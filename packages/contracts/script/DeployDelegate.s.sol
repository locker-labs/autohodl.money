// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MMCardDelegate} from "../src/delegates/MMCardDelegate.sol";

contract DeployDelegate is Script {
    MMCardDelegate public delegate;
    uint256 pk = vm.envUint("PRIVATE_KEY");

    address public autoHodl = vm.envAddress("AUTO_HODL"); // LockerRouter address
    address public delegateAddress = vm.envAddress("DELEGATE"); // USDC on Ethereum Mainnet

    function run() public {
        vm.startBroadcast(pk);
        delegate = new MMCardDelegate(autoHodl, delegateAddress);
        vm.stopBroadcast();
    }
}
