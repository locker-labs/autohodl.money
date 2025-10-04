// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract IDelegate {
    function verifyRegisteration(address user, bytes calldata data) external view returns (bool) {}
    function executeTransaction(address to, uint256 value, bytes calldata data) external returns (bytes memory) {}
}
