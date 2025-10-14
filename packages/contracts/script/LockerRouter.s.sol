// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LockerRouter} from "../src/yield/LockerRouter.sol";

contract SetupLockerRouter is Script {
    LockerRouter public lockerRouter;
    uint256 pk = vm.envUint("PRIVATE_KEY"); 
    
    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet
    address public aaveAdapterAddress = vm.envAddress("AAVE_ADAPTER_ADDRESS"); // Deployed AAVE Adapter address
    uint32 public allocationBps = 10000; // 100% allocation to AAVE for single adapter setup
    address public lockerRouterAddress = vm.envAddress("LOCKER_ROUTER"); // Existing LockerRouter address if updating
    function run() public {
        vm.startBroadcast(pk);
        address[] memory tokenAddresses = new address[](1);
        address[] memory adapters = new address[](1);
        uint32[] memory bps = new uint32[](1);
        tokenAddresses[0] = tokenAddress;
        adapters[0] = aaveAdapterAddress;
        bps[0] = allocationBps;
        lockerRouter =  LockerRouter(lockerRouterAddress);

        lockerRouter.setDefaultAlloc(tokenAddresses, adapters, bps);
        vm.stopBroadcast();
    }
}

contract DeployLockerRouter is Script {
    LockerRouter public lockerRouter;
    uint256 pk = vm.envUint("PRIVATE_KEY"); 

    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet     
    function run() public {
        vm.startBroadcast(pk);
        address[] memory tokenAddresses = new address[](0);
        address[] memory adapters = new address[](0);
        uint32[] memory bps = new uint32[](0);
        lockerRouter =  new LockerRouter(tokenAddresses, adapters, bps);
        vm.stopBroadcast();
    }
}