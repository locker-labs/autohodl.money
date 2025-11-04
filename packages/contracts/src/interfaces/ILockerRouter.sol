// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title ILockerRouter
/// @notice Mutating entrypoints for deposits, settlements, adapter routing and claim reassignment.
/// @dev All outward settlements are "instant or revert" in v0. Read-only views live in a separate interface.
interface ILockerRouter {
    /*=============================*
     *            TYPES            *
     *=============================*/

    struct Allocation {
        address[] adapters; // venue adapter
        uint256[] amount; // total amount of underlying deposited
        uint32[] bps; // 0..10000; if non-empty, sum must equal 10000
    }

    /*=============================*
     *            EVENTS           *
     *=============================*/

    event DepositRouted(address indexed user, address indexed asset, uint256[] amounts, address[] adapters);
    event Sent(address indexed user, address indexed asset, address indexed to, uint256 amount, uint256 fee);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 fee);

    // Governance / ops
    event RebalanceExecuted(address indexed operator);
    event AdapterSet(address indexed asset, address indexed adapter, bool allowed);
    event DefaultAllocSet(address indexed asset);
    event PolicySet(
        address indexed asset, uint256 maxPerTx, uint256 rollingLimit, uint64 rollingWindow, uint256 coverageTargetBps
    );
    event ReservedBandSet(address indexed account, address indexed asset, uint256 amount);
    event SettlementPaused(address indexed asset, bool paused);
    event AdapterPaused(address indexed adapter, bool paused);

    // Claim-to-pool pathway
    event ClaimTransferredToPool(address indexed user, address indexed asset, uint256 amount);

    /*=============================*
     *        USER ACTIONS         *
     *=============================*/

    /// @notice Deposit underlying and mint SYT 1:1, allocate per weights or default.
    /// @param asset ERC20 underlying (e.g., USDC)
    /// @param amount amount of underlying to deposit (approve to Router first)
    function deposit(address asset, uint256 amount) external;

    /// @notice Deposit underlying for a user and mint SYT 1:1.
    /// @param user beneficiary of SYT minted
    /// @param asset ERC20 underlying (e.g., USDC)
    /// @param amount amount of underlying to deposit (approve to Router first)
    function depositFor(address user, address asset, uint256 amount) external;

    /// @notice Withdraw underlying to msg.sender by burning SYT (instant-or-revert).
    // function withdraw(address asset, uint256 amount) external returns (uint256 withdrawalAmount);

    /// @notice Send underlying to a recipient by burning caller’s SYT (instant-or-revert).
    function sendUnderlying(address asset, address from, address to, uint256 amount)
        external
        returns (uint256 sharesNeeded,address routeTo);

    /// @notice Transfer a portion of caller's claim (SYT + per-venue shares) to the Instant Pool without redeeming underlying.
    /// @dev After this, the pool accrues the future yield on the transferred position.
    /// Emits ClaimTransferredToPool.
    /// Reverts if caller’s effective claim < amount or policy/adapter constraints prevent reassignment.
    // function transferClaimToPool(address asset, uint256 amount) external;

    /*=============================*
     *     ADMIN / GOVERNANCE      *
     *=============================*/

    // function setPolicy(
    //     address asset,
    //     uint256 maxPerTx,
    //     uint256 rollingLimit,
    //     uint64 rollingWindow,
    //     uint256 coverageTargetBps
    // ) external;
    // function setAdapter(address asset, address adapter, bool allowed) external;
    function setDefaultAlloc(address[] memory assets, address[] memory adapters, uint32[] memory bps) external;
    // function setReservedBand(address account, address asset, uint256 amount) external;
    // function pauseSettlement(address asset, bool paused) external;
    // function pauseAdapter(address adapter, bool paused) external;
    function setSupportedSYT(address asset, address syt) external;
    function setAssetAdapter(address asset, address adapter, bool allowed) external;

    /*=============================*
     *        GETTERS              *
     *=============================*/

    function navAcrossAdapters(address asset) external view returns (uint256);
    // function sytFor(address asset) external view returns (address); // SYT ERC20 for asset
    // function pool() external view returns (address); // Instant Pool (multi-asset)
    // function treasury() external view returns (address); // protocol fee sink (if any)
}
