// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract IDelegate {
    function verifyRegisteration(address user, bytes calldata data) external virtual returns (bool) {}
    function delegateSaving(address user,address asset, uint256 value, bytes calldata data) external virtual {}
}
