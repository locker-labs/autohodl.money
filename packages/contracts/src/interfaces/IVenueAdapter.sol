// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IVenueAdapter
/// @notice Standard interface for integrating a yield/cash venue with the Router.
/// @dev One adapter instance binds to a single underlying asset and a single venue/strategy.
interface IVenueAdapter {
    /*=============================*
     *            EVENTS           *
     *=============================*/

    event Deposited(uint256 amount);
    event RedeemRequested(uint256 amount);
    event RedeemSettled(uint256 received);
    event FeesAccrued(uint256 amount); // venue-specific fees if any

    /*=============================*
     *            VIEWS            *
     *=============================*/

    /// @notice Human-readable venue/strategy ID (optional but helpful for UIs).
    function venueId() external view returns (bytes32);

    /*=============================*
     *          MUTATIONS          *
     *=============================*/

    /// @notice Deposit underlying into the venue.
    /// @dev Callable only by the Router; implementation should assume underlying already transferred to adapter.
    function deposit(address asset, uint256 amount) external;

    /// @notice Request redemption from the venue (may enqueue or schedule).
    /// @dev Callable only by the Router; must not revert if venue enqueues.
    function requestRedeem(address asset, uint256 amount) external returns (uint256);

    /// @notice Settle previously requested redemptions and transfer underlying to the caller (Router).
    /// @return received amount of underlying delivered this call
    function settleRedeem() external returns (uint256 received);

    /*=============================*
     *           METADATA          *
     *=============================*/

    /// @notice Address with permission to call mutating methods (Router).
    function router() external view returns (address);

    /// @notice Address of the yield token for a token.
    function adapterPositionValue(address asset) external view returns (uint256);
}
