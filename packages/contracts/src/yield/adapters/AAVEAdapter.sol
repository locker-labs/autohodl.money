// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IVenueAdapter} from "../../interfaces/IVenueAdapter.sol";

import {IPool} from "@aave/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title AAVEAdapter
/// @notice Venue adapter for AAVE V3
contract AAVEAdapter is IVenueAdapter {
    address public lockerRouter;
    mapping(address => address) public aavePoolForAsset;
    mapping(address => address) public yieldTokens;

    modifier routerOnly() {
        require(msg.sender == lockerRouter, "Only LockerRouter can call");
        _;
    }

    constructor(address _lockerRouter, address[] memory assets, address[] memory pools, address[] memory yieldTokens_) {
        lockerRouter = _lockerRouter;
        require(assets.length == pools.length && assets.length == yieldTokens_.length, "Mismatched lengths");
        for (uint256 i = 0; i < assets.length; i++) {
            aavePoolForAsset[assets[i]] = pools[i];
            yieldTokens[assets[i]] = yieldTokens_[i];
            IERC20(assets[i]).approve(pools[i], type(uint256).max);
        }
    }

    function venueId() external pure returns (bytes32) {
        return "AAVE";
    }

    function deposit(address asset, uint256 amount) external routerOnly {
        IPool(aavePoolForAsset[asset]).supply(asset, amount, address(this), 0);
        emit Deposited(amount);
    }

    function requestRedeem(address asset, uint256 amount) external routerOnly returns (uint256) {
        uint256 withdrawnAmount = IPool(aavePoolForAsset[asset]).withdraw(asset, amount, lockerRouter);
        emit RedeemRequested(withdrawnAmount);
        return withdrawnAmount;
    }

    function adapterPositionValue(address asset) external view returns (uint256) {
        IERC20 yieldToken = IERC20(yieldTokens[asset]);
        return yieldToken.balanceOf(address(this));
    }

    // For AAVE, redemptions are instant, so settleRedeem is a no-op
    function settleRedeem() external pure returns (uint256 received) {
        return 0;
    }

    function router() external view returns (address) {
        return lockerRouter;
    }
}
