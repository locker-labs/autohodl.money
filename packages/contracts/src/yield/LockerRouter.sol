// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ILockerRouter} from "../interfaces/ILockerRouter.sol";
import {IVenueAdapter} from "../interfaces/IVenueAdapter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LockerSYT} from "./LockerSYT.sol";

contract LockerRouter is ILockerRouter, Ownable {
    uint32 constant MAX_BPS = 10000;

    // Storage
    mapping(address => mapping(address => Allocation)) private yieldAllocation; // user => asset => allocation
    mapping(address => Allocation) private defaultAllocation; // asset => allocations
    mapping(address => address) public assetSYT; // asset => SYT
    mapping(address => address[]) public assetAdapters; // asset => adapters

    constructor(address[] memory assets, address[] memory adapters, uint32[] memory bps) Ownable(msg.sender) {
        require(assets.length == bps.length, "Mismatched lengths");
        for (uint256 i = 0; i < assets.length; i++) {
            defaultAllocation[assets[i]] = Allocation({adapters: adapters, amount: new uint256[](0), bps: bps});
        }
    }

    function getYieldAllocation(address user, address asset) external view returns (Allocation memory) {
        return yieldAllocation[user][asset];
    }

    function deposit(address asset, uint256 amount) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
         _deposit(msg.sender, asset, amount);
    }

    function depositFor(address user, address asset, uint256 amount) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        _deposit(user, asset, amount);
    }

    function withdraw(address asset, uint256 amount) external returns (uint256) {
        LockerSYT syt = LockerSYT(assetSYT[asset]);

        // Price in shares using ERC-4626
        uint256 totalShares = syt.totalSupply();
        uint256 totalAssets = navAcrossAdapters(asset);
        require(amount > 0 && totalShares > 0 && totalAssets > 0, "INVALID_STATE");

        // shares = ceil(assets * totalShares / totalAssets)
        uint256 shares = (amount * totalShares + totalAssets - 1) / totalAssets;

        // Burn shares from sender
        syt.burn(msg.sender, shares);

        // Pro-rata withdraw from adapters by current portfolio weights
        address[] memory adapters = assetAdapters[asset];
        require(adapters.length > 0, "No adapters");

        uint256 remaining = amount;
        uint256 withdrawn;
        for (uint256 i = 0; i < adapters.length; i++) {
            uint256 adapterAssets = IVenueAdapter(adapters[i]).positionAssets(asset);
            if (adapterAssets == 0) continue;

            // target chunk = floor(assets * adapterAssets / totalAssets)
            uint256 target = (amount * adapterAssets) / totalAssets;

            // last adapter takes the remainder
            if (i == adapters.length - 1) {
                target = remaining;
            } else if (target > remaining) {
                target = remaining;
            }

            if (target == 0) continue;

            // Execute withdraw, capture actual received
            uint256 received = IVenueAdapter(adapters[i]).requestRedeem(asset, amount);
            withdrawn += received;
            remaining = remaining > received ? remaining - received : 0;

            if (remaining == 0) break;
        }

        // Transfer what was actually withdrawn to the user
        IERC20(asset).transfer(msg.sender, withdrawn);
        emit Withdrawn(msg.sender, asset, withdrawn, 0);
        return withdrawn;
    }

    function sendUnderlying(address asset, address from, address to, uint256 amount)
        external
        returns (address routeTo)
    {
        LockerSYT syt = LockerSYT(assetSYT[asset]);
        require(msg.sender == address(syt), "Invalid SYT");
        // For v1, assume instant withdrawal from first adapter in default allocation
        Allocation memory allocations = defaultAllocation[asset];
        if (allocations.adapters.length == 0) {
            revert("No default allocation");
        }
        IVenueAdapter(allocations.adapters[0]).requestRedeem(asset, amount);
        IERC20(asset).transfer(to, amount);
        emit Sent(from, asset, to, amount, 0);
        return to;
    }

    // Internal functions
    function _deposit(address _user, address _asset, uint256 _amount) internal {
        Allocation memory allocations = yieldAllocation[_user][_asset];
        if (allocations.adapters.length == 0) {
            allocations = defaultAllocation[_asset];
        }
        require(allocations.adapters.length > 0, "No allocation");
        LockerSYT syt = LockerSYT(assetSYT[_asset]);
        uint256 totalShares = syt.totalSupply();

        // totalAssets is the portfolio value across all adapters for this asset
        uint256 totalAssets = navAcrossAdapters(_asset); // sums IVenueAdapter.positionAssets(_asset)
        uint256 mintedShares;
        if (totalShares == 0 || totalAssets == 0) {
            mintedShares = _amount; // initial price = 1.0
        } else {
            // shares = floor(_amount * totalShares / totalAssets)
            mintedShares = (_amount * totalShares) / totalAssets;
            require(mintedShares != 0, "ZERO_SHARES");
        }
        uint256[] memory amounts = new uint256[](allocations.adapters.length);
        address[] memory adapters = allocations.adapters;

        // Route the underlying into adapters per bps
        for (uint256 i = 0; i < allocations.adapters.length; i++) {
            uint256 depositAmount = (_amount * allocations.bps[i]) / MAX_BPS;
            amounts[i] = depositAmount;
            IERC20(_asset).transfer(allocations.adapters[i], depositAmount);
            IVenueAdapter(allocations.adapters[i]).deposit(_asset, depositAmount);
        }

        // 4) Mint shares to the user at the computed price
        syt.mint(_user, mintedShares);
        emit DepositRouted(_user, _asset, amounts, adapters);
    }

    function navAcrossAdapters(address asset) public view returns (uint256 total) {
        // Sum up positionAssets across all adapters for this asset
        // For v1, just use default allocation adapters
        address[] memory adapters = assetAdapters[asset];
        for (uint256 i = 0; i < adapters.length; i++) {
            total += IVenueAdapter(adapters[i]).positionAssets(asset);
        }
    }

    function setSupportedSYT(address asset, address syt) external onlyOwner {
        require(assetSYT[asset] == address(0), "SYT already set");
        assetSYT[asset] = syt;
    }

    function setDefaultAlloc(address asset, Allocation calldata alloc) external onlyOwner {
        defaultAllocation[asset] = alloc;
        assetAdapters[asset] = alloc.adapters;
        emit DefaultAllocSet(asset);
    }

    function setAssetAdapter(address asset, address adapter, bool allowed) external onlyOwner {
        if (allowed) {
            // Add if not already present
            address[] storage adapters = assetAdapters[asset];
            for (uint256 i = 0; i < adapters.length; i++) {
                if (adapters[i] == adapter) {
                    return; // already present
                }
            }
            adapters.push(adapter);
        } else {
            // Remove if present
            address[] storage adapters = assetAdapters[asset];
            for (uint256 i = 0; i < adapters.length; i++) {
                if (adapters[i] == adapter) {
                    adapters[i] = adapters[adapters.length - 1];
                    adapters.pop();
                    break;
                }
            }
        }
        emit AdapterSet(asset, adapter, allowed);
    }

    function setDefaultAlloc(address[] memory assets, address[] memory adapters, uint32[] memory bps ) external onlyOwner{
        require(assets.length == adapters.length && assets.length == bps.length, "Mismatched lengths");
        for (uint256 i = 0; i < assets.length; i++) {
            Allocation storage alloc = defaultAllocation[assets[i]];
            alloc.adapters.push(adapters[i]);
            alloc.bps.push(bps[i]);
            alloc.amount.push(0);
            emit DefaultAllocSet(assets[i]);
        }
    }
}