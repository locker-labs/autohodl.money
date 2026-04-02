// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ScheduleHodl} from "../src/ScheduleHodl.sol";

contract DeployScheduleHodl is Script {
    ScheduleHodl public scheduleHodl;
    uint256 pk = vm.envUint("PRIVATE_KEY");

    address public lockerRouter = vm.envAddress("LOCKER_ROUTER"); // LockerRouter address
    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet

    function run() public {
        vm.startBroadcast(pk);
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = tokenAddress;
        scheduleHodl = new ScheduleHodl(lockerRouter, tokenAddresses);
        vm.stopBroadcast();
    }
}
