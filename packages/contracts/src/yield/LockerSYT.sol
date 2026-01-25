// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {ILockerRouter} from "../interfaces/ILockerRouter.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title LockerSYT
/// @notice SYT (Spendable Yield Token) representing a share of a user's deposited assets in the LockerRouter.

contract LockerSYT is IERC20, ReentrancyGuard {
    // Metadata
    string public name;
    string public symbol;
    uint8 private immutable decimals_;
    address public parentToken;

    // ERC20 storage
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOfSYT;
    mapping(address => mapping(address => uint256)) public allowance;

    // Immutable router
    ILockerRouter public immutable router;

    // Errors
    error TransferBlocked();
    error InvalidTransfer();
    error InsufficientAllowance();

    // Events
    event Routed(address indexed from, address indexed to, uint256 amount, address indexed destination);

    // Modifiers
    modifier routerOnly() {
        if (msg.sender != address(router)) revert TransferBlocked();
        _;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals, address _router, address _parentToken) {
        name = _name;
        symbol = _symbol;
        decimals_ = _decimals;
        router = ILockerRouter(_router);
        parentToken = _parentToken;
    }

    // IERC20 metadata
    function decimals() external view returns (uint8) {
        return decimals_;
    }

    // Total underlying managed by the portfolio (Router aggregates adapters)
    function totalAssets() public view returns (uint256) {
        // Router is authoritative for NAV across adapters
        ILockerRouter.Allocation memory alloc = router.getDefaultAllocation(parentToken);
        return router.navAcrossAdapters(alloc.adapters, parentToken);
    }

    // ERC20 balance reflects current claim in assets (rebasing-style view)
    function balanceOf(address account) public view returns (uint256) {
        uint256 ts = totalSupply;
        if (ts == 0) return 0;

        return Math.mulDiv(balanceOfSYT[account], totalAssets(), ts, Math.Rounding.Floor);
    }

    // IERC20
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external nonReentrant returns (bool) {
        return _routedTransfer(msg.sender, to, value);
    }

    function transferFrom(address from, address to, uint256 value) external nonReentrant returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            if (allowed < value) revert InsufficientAllowance();
            unchecked {
                allowance[from][msg.sender] = allowed - value;
            }
        }
        return _routedTransfer(from, to, value);
    }

    function mint(address to, uint256 amount) external routerOnly {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external routerOnly {
        _burn(from, amount);
    }

    // Internal transfer logic with router gating
    function _routedTransfer(address from, address to, uint256 amount) internal returns (bool) {
        if (amount == 0) {
            return false;
        }

        // Only consult router for regular transfers (not mints/burns)
        if (from == address(0) || to == address(0)) revert InvalidTransfer();

        (uint256 sharesToSend, address routeTo) = router.sendUnderlying(parentToken, from, to, amount);

        if (routeTo == address(0)) {
            _burn(from, sharesToSend);
        } else {
            _poolTransfer(from, routeTo, sharesToSend);
            emit Routed(from, to, sharesToSend, routeTo);
        }

        emit Transfer(from, to, amount);
        return true;
    }

    // Internal mint/burn to be exposed by trusted system contracts via inheritance
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOfSYT[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _poolTransfer(address from, address to, uint256 amount) internal {
        balanceOfSYT[from] = balanceOfSYT[from] - amount;
        balanceOfSYT[to] = balanceOfSYT[to] + amount;
    }

    function _burn(address from, uint256 amount) internal {
        balanceOfSYT[from] = balanceOfSYT[from] - amount;
        totalSupply = totalSupply - amount;
        emit Transfer(from, address(0), amount);
    }
}
