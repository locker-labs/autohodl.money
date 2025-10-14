// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AAVEAdapter} from "../src/yield/adapters/AAVEAdapter.sol";
import {ILockerRouter} from "../src/interfaces/ILockerRouter.sol";

contract SetupAAVEAdapter is Script {
    AAVEAdapter public adapter;
    uint256 pk = vm.envUint("PRIVATE_KEY");
    address public lockerRouter = vm.envAddress("LOCKER_ROUTER");
    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet
    address public aavePoolAddress = vm.envAddress("AAVE_POOL_ADDRESS"); // AAVE Pool address on Ethereum Mainnet

    function run() public {
        vm.startBroadcast(pk);
        address[] memory aavePool = new address[](1);
        aavePool[0] = aavePoolAddress;
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = tokenAddress;
        adapter = new AAVEAdapter(lockerRouter, tokenAddresses, aavePool);
        ILockerRouter(lockerRouter).setAssetAdapter(tokenAddress, address(adapter), true);
        vm.stopBroadcast();
    }
}
