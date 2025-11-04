// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AutoHodl} from "../src/AutoHodl.sol";

contract DeployAutoHodl is Script {
    AutoHodl public autoHodl;
    uint256 pk = vm.envUint("PRIVATE_KEY");

    address public lockerRouter = vm.envAddress("LOCKER_ROUTER"); // LockerRouter address
    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet

    function run() public {
        vm.startBroadcast(pk);
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = tokenAddress;
        autoHodl = new AutoHodl(lockerRouter, tokenAddresses);
        vm.stopBroadcast();
    }
}
