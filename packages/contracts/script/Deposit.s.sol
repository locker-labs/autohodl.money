// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LockerRouter} from "../src/yield/LockerRouter.sol";

contract Deposit is Script {
    LockerRouter public lockerRouter;
    uint256 pk = vm.envUint("PRIVATE_KEY");

    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet
    address public aaveAdapterAddress = vm.envAddress("AAVE_ADAPTER_ADDRESS"); // Deployed AAVE Adapter address
    uint32 public allocationBps = 10000; // 100% allocation to AAVE for single adapter setup
    address public lockerRouterAddress = vm.envAddress("LOCKER_ROUTER"); // Existing LockerRouter address if updating

    function run() public {
        vm.startBroadcast(pk);

        lockerRouter = LockerRouter(lockerRouterAddress);

        lockerRouter.deposit(tokenAddress, 1000);
        vm.stopBroadcast();
    }
}
