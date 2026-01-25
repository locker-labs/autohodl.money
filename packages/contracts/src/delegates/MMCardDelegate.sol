// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IDelegate.sol";
import "../AutoHodl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MMCardDelegate is IDelegate, Ownable {
    address public autoHodl;

    event SavingDelegated(bytes data);
    
    constructor(address _autoHodl, address owner) Ownable(owner) {
        autoHodl = _autoHodl;
    }



    // Admin function to set autoHodl address
    function setAutoHodl(address _autoHodl) external onlyOwner {
        autoHodl = _autoHodl;
    }

    function delegateSaving(address user, address asset, uint256 value, bytes calldata data) external override onlyOwner {
        AutoHodl(autoHodl).executeSavingsTx(user, asset, value);
        emit SavingDelegated(data);
    }

    // Function to verify user registration
    function verifyRegisteration(address user, bytes calldata extraData) external view override returns (bool) {
        return false;
    }
}
