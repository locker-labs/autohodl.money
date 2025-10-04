// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IDelegate.sol";
import "./interfaces/IERC20.sol";

contract AutoHodl {
    struct SavingConfig {
        address savingAddress; // Address where the savings will be sent
        address delegate; // Address to delegate the savings tx
        uint256 roundUp; // Amount to round up each transaction
        bool active; // Is the saving active
        bool toYield; // Should the savings be sent to a yield platform
        bytes extraData; // Extra data for future use
    }

    mapping(address => mapping(address => SavingConfig)) public savings; // user => token => config
    mapping(address => bool) public tokenAllowlist; // token => isAllowed

    event SavingConfigSet(address indexed user, address indexed token);

    event SavingExecuted(address indexed user, address indexed token, uint256 amount);

    // Admin function to set token allowlist
    function setTokenAllowlist(address token, bool isAllowed) external {
        tokenAllowlist[token] = isAllowed;
    }

    // Function to set saving configuration for a user and token
    function setSavingConfig(
        address token,
        address savingAddress,
        address delegate,
        uint256 roundUp,
        bool active,
        bool toYield,
        bytes calldata extraData
    ) external {
        require(tokenAllowlist[token], "Token is not allowed.");
        savings[msg.sender][token] = SavingConfig({
            savingAddress: savingAddress,
            delegate: delegate,
            roundUp: roundUp,
            active: active,
            toYield: toYield,
            extraData: extraData
        });
        emit SavingConfigSet(msg.sender, token);
    }

    // Function set user savings for a user
    function setSavingConfigForUser(
        address user,
        address token,
        address savingAddress,
        address delegate,
        uint256 roundUp,
        bool active,
        bool toYield,
        bytes calldata extraData
    ) external {
        require(tokenAllowlist[token], "Token is not allowed.");
        bool canConfigure = IDelegate(delegate).verifyRegisteration(user, extraData);
        require(canConfigure, "User has not registered with delegate.");
        savings[user][token] = SavingConfig({
            savingAddress: savingAddress,
            delegate: delegate,
            roundUp: roundUp,
            active: active,
            toYield: toYield,
            extraData: extraData
        });
        emit SavingConfigSet(user, token);
    }

    // Function to execute savings transaction
    function executeSavingsTx(address user, address token, uint256 value) external {
        SavingConfig memory config = savings[user][token];
        require(config.active, "Savings not active for this token.");
        require(config.delegate == msg.sender, "Only delegate can execute savings tx.");
        if (config.toYield) {
            // Logic to send to yield platform
        }
        IERC20(token).transferFrom(user, config.savingAddress, value);

        emit SavingExecuted(user, token, value);
    }
}
