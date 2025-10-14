// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LockerSYT} from "../src/yield/LockerSYT.sol";
import {AAVEAdapter} from "../src/yield/adapters/AAVEAdapter.sol";
import {ILockerRouter} from "../src/interfaces/ILockerRouter.sol";

contract SetupUsdcSYT is Script {
    LockerSYT public syt;
    uint256 pk = vm.envUint("PRIVATE_KEY"); 
    address public lockerRouter = vm.envAddress("LOCKER_ROUTER");
    address public tokenAddress = vm.envAddress("TOKEN_ADDRESS"); // USDC on Ethereum Mainnet
    string public name = "Staked Yield Token: USDC"; // Update for each token
    string public symbol = "sytUSDC"; // Update for each token
    uint8 public decimals = 6; // Update for each token

    function run() public {
        vm.startBroadcast(pk);
        syt = new LockerSYT(name, symbol, decimals, lockerRouter, tokenAddress);
        ILockerRouter(lockerRouter).setSupportedSYT(tokenAddress, address(syt));
        vm.stopBroadcast();
    }
}
