// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVenueAdapter} from "../../interfaces/IVenueAdapter.sol";

import {IPool} from "@aave/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title AAVEAdapter
/// @notice Venue adapter for AAVE V3
contract AAVEAdapter is IVenueAdapter {
    address public lockerRouter;
    mapping(address => address) public aavePoolForAsset;
    mapping(address => uint256) public depositedAssets;

    constructor(address _lockerRouter, address[] memory assets, address[] memory pools) {
        lockerRouter = _lockerRouter;
        require(assets.length == pools.length, "Mismatched lengths");
        for (uint256 i = 0; i < assets.length; i++) {
            aavePoolForAsset[assets[i]] = pools[i];
        }
    }

    function venueId() external pure returns (bytes32) {
        return "AAVE";
    }

    function deposit(address asset, uint256 amount) external {
        IERC20(asset).approve(aavePoolForAsset[asset], amount);
        IPool(aavePoolForAsset[asset]).supply(asset, amount, address(this), 0);
        depositedAssets[asset] += amount;
        emit Deposited(amount);
    }

    function requestRedeem(address asset, uint256 amount) external returns (uint256) {
        uint256 withdrawnAmount = IPool(aavePoolForAsset[asset]).withdraw(asset, amount, lockerRouter);
        depositedAssets[asset] -= withdrawnAmount;
        emit RedeemRequested(withdrawnAmount);
        return withdrawnAmount;
    }

    function positionAssets(address asset) external view returns (uint256) {
        return depositedAssets[asset];
    }

    // For AAVE, redemptions are instant, so settleRedeem is a no-op
    function settleRedeem() external pure returns (uint256 received) {
        return 0;
    }

    function router() external view returns (address) {
        return lockerRouter;
    }
}
