// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ILockerPool
/// @notice Multi-asset instant liquidity pool with per-asset accounting and LP shares.
/// @dev Router is the only contract allowed to perform payouts/refills. LPs provide/withdraw liquidity.
///      Share math mirrors ERC4626 patterns but across multiple assets.
interface ILockerPool {
    /*=============================*
     *            EVENTS           *
     *=============================*/

    event Deposited(address indexed asset, address indexed lp, uint256 assets, uint256 shares);
    event Withdrawn(address indexed asset, address indexed lp, uint256 assets, uint256 shares);
    event Payout(address indexed asset, address indexed to, uint256 amount);
    event Refilled(address indexed asset, uint256 amount);
    event AssetEnabled(address indexed asset, bool enabled);
    event PoolPaused(bool paused);

    // Rebalancing
    /// @notice Emitted when a rebalance that targets the SYT ratio is executed.
    /// @param caller msg.sender triggering the rebalance
    /// @param asset Underlying asset whose SYT exposure was reduced
    /// @param sytRedeemed Total SYT amount redeemed across venues (asset-native decimals of SYT token if distinct)
    /// @param underlyingReceived Total underlying received back into the pool
    /// @param prevRatioBps Ratio before (value(SYT)/total) in bps
    /// @param newRatioBps Ratio after in bps
    event RebalancedSYT(
        address indexed caller,
        address indexed asset,
        uint256 sytRedeemed,
        uint256 underlyingReceived,
        uint16 prevRatioBps,
        uint16 newRatioBps
    );

    /// @notice Emitted per venue redemption for observability (optional to emit in release builds).
    event VenueRedeemedSYT(address indexed asset, address indexed venue, uint256 sytAmount, uint256 underlyingOut);

    /*=============================*
     *            VIEWS            *
     *=============================*/

    /// @notice Total liquid assets currently held for an asset (free capacity + any idle buffers).
    function totalAssets(address asset) external view returns (uint256);

    /// @notice Total LP shares outstanding for an asset.
    function totalShares(address asset) external view returns (uint256);

    /// @notice Convert assets -> shares at current rate for an asset.
    function convertToShares(address asset, uint256 assets) external view returns (uint256);

    /// @notice Convert shares -> assets at current rate for an asset.
    function convertToAssets(address asset, uint256 shares) external view returns (uint256);

    /// @notice Immediately-available assets for instant payouts for an asset.
    function available(address asset) external view returns (uint256);

    /// @notice Address authorized as router.
    function router() external view returns (address);

    // Rebalancing views

    /// @notice Current SYT ratio (value(SYT) / (value(SYT)+value(underlying))) in basis points for `asset`.
    /// @dev Implementations should keep unit consistency internally; external callers treat this as pure ratio.
    function sytRatioBps(address asset) external view returns (uint16);

    /// @notice Target SYT ratio in bps that the pool aims to maintain for `asset`.
    function targetSYTRatioBps(address asset) external view returns (uint16);

    /// @notice Upper band threshold in bps above target at which a redeem is triggered (hysteresis).
    function redeemThresholdBps(address asset) external view returns (uint16);

    /// @notice Max portion of current SYT position redeemable per call, in bps.
    function maxRedeemBpsPerCall(address asset) external view returns (uint16);

    /// @notice Global cooldown between rebalances for `asset` in seconds.
    function rebalanceCooldown(address asset) external view returns (uint256);

    /// @notice Timestamp of last successful rebalance for `asset`.
    function lastRebalanceAt(address asset) external view returns (uint256);

    /// @notice Helper for off-chain keepers: whether a rebalance would currently execute for `asset`.
    /// @dev Purely advisory; should replicate the same checks used by rebalanceSYT().
    function isRebalanceNeeded(address asset) external view returns (bool needed, uint16 currentRatioBps);

    /// @notice Estimation helper to return recommended total SYT to redeem (in SYT units) if executed now.
    /// @dev Best-effort estimate based on internal pricing and caps; not a binding quote.
    function estimateRedeemSYT(address asset) external view returns (uint256 sytToRedeem);

    /*=============================*
     *        LP INTERACTIONS      *
     *=============================*/

    function deposit(address asset, uint256 assets, address receiver) external returns (uint256 shares);

    function withdraw(address asset, uint256 shares, address receiver, address owner)
        external
        returns (uint256 assets);

    /*=============================*
     *       ROUTER-ONLY HOOKS     *
     *=============================*/

    function payout(address asset, address to, uint256 amount) external;

    function refill(address asset, uint256 amount) external;

    /*=============================*
     *         ADMIN / OPS         *
     *=============================*/

    function setAssetEnabled(address asset, bool enabled) external;

    function setPaused(bool paused) external;

    // Rebalancing actions

    /// @notice Publicly callable rebalancing action to redeem SYT exposure for `asset` back into underlying.
    /// @dev Must enforce:
    ///      - cooldown per `asset`
    ///      - ratio check against target + threshold
    ///      - per-call cap (maxRedeemBpsPerCall)
    ///      - slippage/min-out checks internally (implementation-specific)
    ///      Implementations SHOULD no-op or revert with a specific error if not needed.
    /// @return sytRedeemed Total SYT redeemed
    /// @return underlyingReceived Total underlying received
    function rebalanceSYT(address asset) external returns (uint256 sytRedeemed, uint256 underlyingReceived);

    // Optional admin setters for future flexibility; can be omitted if truly immutable in v1.

    /// @notice Admin: update SYT rebalancing parameters for `asset`.
    /// @dev If parameters are immutable in v1, this can be omitted and values hard-coded.
    function setRebalanceParams(
        address asset,
        uint16 targetRatioBps,
        uint16 thresholdBps,
        uint16 maxPerCallBps,
        uint256 cooldown
    ) external;
}
