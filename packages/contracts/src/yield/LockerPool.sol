// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ILockerRouter} from "../interfaces/ILockerRouter.sol";

contract LockerPool4626 is ERC4626 {
    using SafeERC20 for IERC20;

    // ---------------- Errors ----------------
    error NotRouter();
    error Paused();
    error ZeroAmount();
    error InsufficientAvailable();
    error CapExceeded();
    error NotNeeded();
    error Cooldown();

    // ---------------- Events ----------------
    event Payout(address indexed to, uint256 amount);
    event Refilled(uint256 amount);
    event PoolPaused(bool paused);

    event RebalancedSYT(
        address indexed caller, uint256 sytRedeemed, uint256 underlyingReceived, uint16 prevRatioBps, uint16 newRatioBps
    );

    event VenueRedeemedSYT(address indexed venue, uint256 sytAmount, uint256 underlyingOut);

    // ---------------- Config ----------------
    address public immutable router; // governance/ops authority
    IERC20 public immutable syt; // SYT whose totalSupply caps LP share supply

    bool public paused;

    // Instant-liquidity buffer: only this much underlying can be used for immediate withdraw/payout
    uint256 public availableBuffer;

    // Rebalance params
    uint16 public targetSYTBps; // e.g., 5000 = 50%
    uint16 public redeemThresholdBps; // e.g., 300 = 3% band above target
    uint16 public maxRedeemBpsPerCall; // cap of SYT position per call, in bps
    uint256 public cooldown; // seconds
    uint256 public lastRebalanceAt; // timestamp

    // ---------------- Modifiers ----------------
    modifier onlyRouter() {
        if (msg.sender != router) revert NotRouter();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    constructor(
        address underlying_, // single underlying asset
        address router_, // authorized operator
        address syt_, // SYT token used to cap shares
        string memory name_, // LP share name
        string memory symbol_ // LP share symbol
    ) ERC20(name_, symbol_) ERC4626(IERC20(underlying_)) {
        router = router_;
        syt = IERC20(syt_);

        // Reasonable defaults; can be changed by router
        targetSYTBps = 5000; // 50%
        redeemThresholdBps = 300; // +3% upper band
        maxRedeemBpsPerCall = 2000; // 20% of SYT position per call
        cooldown = 10 minutes;
    }

    // ---------------- Admin (router) ----------------
    function setPaused(bool _paused) external onlyRouter {
        paused = _paused;
        emit PoolPaused(_paused);
    }

    function setRebalanceParams(uint16 targetRatioBps_, uint16 thresholdBps_, uint16 maxPerCallBps_, uint256 cooldown_)
        external
        onlyRouter
    {
        targetSYTBps = targetRatioBps_;
        redeemThresholdBps = thresholdBps_;
        maxRedeemBpsPerCall = maxPerCallBps_;
        cooldown = cooldown_;
    }

    // ---------------- ERC4626 overrides ----------------
    // totalAssets = vault cash + router-reported SYT value (principal + accrued − expected costs), all in underlying units.
    function totalAssets() public view override returns (uint256) {
        uint256 cash = IERC20(asset()).balanceOf(address(this));
        // uint256 sytVal = ILockerRouter(router).getTotalValue(address(syt), address(this)); // underlying units
        return cash;
    }

    // Clamp previewDeposit to remaining share capacity (SYT.totalSupply - shares.totalSupply)
    function previewDeposit(uint256 assets) public view override returns (uint256 sharesOut) {
        sharesOut = super.previewDeposit(assets);
        uint256 maxShares = _remainingShareCapacity();
        if (sharesOut > maxShares) sharesOut = maxShares;
    }

    // Clamp previewMint similarly; if request > capacity, return assets for maxShares to help integrators
    function previewMint(uint256 shares) public view override returns (uint256 assets) {
        uint256 maxShares = _remainingShareCapacity();
        if (shares > maxShares) {
            assets = super.previewMint(maxShares);
        } else {
            assets = super.previewMint(shares);
        }
    }

    // Enforce cap and pause in the internal minting hooks (guarantees safety regardless of which entrypoint is used)
    function _deposit(address caller, address receiver, uint256 assets, uint256 shares)
        internal
        override
        whenNotPaused
    {
        if (assets == 0 || shares == 0) revert ZeroAmount();

        // Enforce cap
        uint256 maxShares = _remainingShareCapacity();
        if (shares > maxShares) revert CapExceeded();

        // Proceed with the standard ERC4626 deposit
        super._deposit(caller, receiver, assets, shares);

        // Policy: newly deposited assets increase instant buffer
        availableBuffer += assets;
    }

    // Restrict withdrawals/redemptions to instant buffer capacity
    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        whenNotPaused
        returns (uint256 shares)
    {
        if (assets == 0) revert ZeroAmount();
        if (assets > availableBuffer) revert InsufficientAvailable();

        shares = super.withdraw(assets, receiver, owner);
        availableBuffer -= assets;
    }

    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        whenNotPaused
        returns (uint256 assets)
    {
        if (shares == 0) revert ZeroAmount();

        // Preview to enforce buffer before state changes
        uint256 previewAssets = super.previewRedeem(shares);
        if (previewAssets > availableBuffer) revert InsufficientAvailable();

        assets = super.redeem(shares, receiver, owner);
        availableBuffer -= assets;
    }

    // ---------------- Router-only custom hooks ----------------
    // Sends underlying out (e.g., to settle instant claim/payout). Reduces instant buffer.
    function payout(address to, uint256 amount) external onlyRouter {
        if (amount == 0) revert ZeroAmount();
        if (amount > availableBuffer) revert InsufficientAvailable();

        availableBuffer -= amount;
        IERC20(asset()).safeTransfer(to, amount);
        emit Payout(to, amount);
    }

    // Called after router/adapters redeem SYT -> underlying to top up instant buffer.
    // Assumes underlying has already been transferred into this contract.
    function refill(uint256 amount) external onlyRouter {
        if (amount == 0) revert ZeroAmount();
        availableBuffer += amount;
        emit Refilled(amount);
    }

    // ---------------- Rebalancing (public trigger) ----------------
    // Targets SYT value share in NAV (not raw units). Router supplies valuation and redemption.
    function rebalanceSYT() external whenNotPaused returns (uint256 sytRedeemed, uint256 underlyingReceived) {
        if (block.timestamp < lastRebalanceAt + cooldown) revert Cooldown();

        uint16 beforeRatio = sytRatioBps();
        uint256 upper = uint256(targetSYTBps) + uint256(redeemThresholdBps);
        if (beforeRatio <= upper) revert NotNeeded();

        (uint256 sytVal, uint256 uVal) = _poolValues();
        uint256 tot = sytVal + uVal;
        if (tot == 0) revert NotNeeded();

        // Excess SYT value (in underlying units). 1 SYT == 1 underlying unit.
        uint256 targetVal = uint256(targetSYTBps) * tot / 10_000;
        uint256 excessVal = sytVal - targetVal;

        // Convert value to SYT amount under 1:1 invariant
        uint256 sytPosAmt = syt.balanceOf(address(this));
        uint256 capAmt = uint256(maxRedeemBpsPerCall) * sytPosAmt / 10_000;

        uint256 sytToRedeem = excessVal;
        if (sytToRedeem > capAmt) sytToRedeem = capAmt;
        if (sytToRedeem == 0) revert NotNeeded();

        // Redeem via router; router transfers underlying into this vault
        address redeemAsset = asset();
        underlyingReceived = ILockerRouter(router).withdraw(redeemAsset, sytToRedeem);

        // Raise instant capacity by what arrived
        if (underlyingReceived != 0) {
            availableBuffer += underlyingReceived;
        }

        lastRebalanceAt = block.timestamp;

        sytRedeemed = sytToRedeem;
        uint16 afterRatio = sytRatioBps();
        emit RebalancedSYT(msg.sender, sytRedeemed, underlyingReceived, beforeRatio, afterRatio);
    }

    // ---------------- Helpers ----------------
    // SYT ratio by value (bps) = sytValue / (sytValue + cashValue)
    function sytRatioBps() public view returns (uint16) {
        (uint256 sytVal, uint256 uVal) = _poolValues();
        uint256 tot = sytVal + uVal;
        if (tot == 0) return 0;
        uint256 r = sytVal * 10_000 / tot;
        return uint16(r > type(uint16).max ? type(uint16).max : r);
    }

    function _poolValues() internal view returns (uint256 sytValue, uint256 underlyingValue) {
        uint256 cash = IERC20(asset()).balanceOf(address(this));
        underlyingValue = cash;
        // sytValue = ILockerRouter(router).getTotalValue(address(syt), address(this)); // underlying units
    }

    function _remainingShareCapacity() internal view returns (uint256) {
        uint256 cap = syt.totalSupply();
        uint256 issued = totalSupply();
        return issued >= cap ? 0 : (cap - issued);
    }
}
