// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {}
    function approve(address spender, uint256 amount) external returns (bool) {}
    function transfer(address to, uint256 amount) external returns (bool) {}
    function balanceOf(address account) external view returns (uint256) {}
    function totalSupply() external view returns (uint256) {}
    function allowance(address owner, address spender) external returns (bytes memory) {}
}
