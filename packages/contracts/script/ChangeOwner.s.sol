// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AutoHodl} from "../src/AutoHodl.sol";
import {AutoHodl} from "../src/AutoHodl.sol";

contract ChangeOwner is Script {
    AutoHodl public autoHodl;
    uint256 pk = vm.envUint("PRIVATE_KEY");

    address public delegate = vm.envAddress("MMC_DELEGATE"); // AutoHodl address
    address public newOwner = vm.envAddress("NEW_OWNER_ADDRESS"); // New owner address

    function run() public {
        vm.startBroadcast(pk);
        autoHodl = AutoHodl(delegate);
        autoHodl.transferOwnership(newOwner);
        vm.stopBroadcast();
    }
}
