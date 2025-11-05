// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LockerRouter} from "../src/yield/LockerRouter.sol";
import {LockerSYT} from "../src/yield/LockerSYT.sol";
import {AAVEAdapter} from "../src/yield/adapters/AAVEAdapter.sol";

contract MockAAVEPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        IERC20(asset).transfer(to, amount);
        return amount;
    }
}

contract ERC20TOKEN is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract RouterSetupTest is Test {
    struct Allocation {
        address[] adapters; // venue adapter
        uint256[] amount; // total amount of underlying deposited
        uint32[] bps; // 0..10000; if non-empty, sum must equal 10000
    }

    LockerRouter router;
    LockerSYT syt;
    AAVEAdapter aave;
    AAVEAdapter pendle;
    ERC20TOKEN token;

    address asset = address(0xA11CE); // mock ERC20 set in setUp
    address userA = address(0xA);
    address userB = address(0xB);
    address userC = address(0xC);
    address mockAAVEPool = address(0xD);

    function setUp() public {
        // Deploy mock asset
        token = new ERC20TOKEN("Mock", "MOCK");
        asset = address(token);

        address[] memory tokenAddresses = new address[](0);
        address[] memory emptyAdapters = new address[](0);
        uint32[] memory emptyBps = new uint32[](0);

        // Deploy Locker Router
        router = new LockerRouter(tokenAddresses, emptyAdapters, emptyBps);

        // Deploy mock AAVE pool
        MockAAVEPool mockPool = new MockAAVEPool();
        mockAAVEPool = address(mockPool);

        // Deploy SYT and adapters
        syt = new LockerSYT("SYT MOCK", "sMOCK", 18, address(router), asset);
        address[] memory assets = new address[](1);
        assets[0] = asset;
        address[] memory aavePools = new address[](1);
        aavePools[0] = mockAAVEPool;
        aave = new AAVEAdapter(address(router), assets, aavePools);

        // Configure Router
        address[] memory adapters = new address[](1);
        adapters[0] = address(aave);
        uint32[] memory bps = new uint32[](1);
        bps[0] = 10000;
        router.setDefaultAlloc(assets, adapters, bps); // a test subclass if abstract
        router.setSupportedSYT(asset, address(syt)); // or call a setter if exposed
        router.setAssetAdapter(asset, address(aave), true);

        // Mint test balances and approvals
        token.mint(userA, 10_000e18);
        token.mint(userC, 10_000e18);
        vm.startPrank(userA);
        token.approve(address(router), type(uint256).max);
        vm.stopPrank();
        vm.startPrank(userB);
        token.approve(address(router), type(uint256).max);
        vm.stopPrank();
        vm.startPrank(userC);
        token.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function test_MultiDeposit() public {
        uint256 depositAmount = 1_000e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        vm.stopPrank();
        vm.startPrank(userC);
        router.depositFor(userB, asset, depositAmount);
        vm.stopPrank();
        assertEq(syt.balanceOf(userA), depositAmount);
        assertEq(syt.balanceOf(userB), depositAmount);
        assertEq(token.balanceOf(mockAAVEPool), 2 * depositAmount);
    }

    function test_Withdaw() public {
        uint256 depositAmount = 1_000e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        router.withdraw(asset, depositAmount);
        vm.stopPrank();
        assertEq(syt.balanceOf(userA), 0);
        assertEq(token.balanceOf(mockAAVEPool), 0);
        assertEq(token.balanceOf(userA), 10_000e18);
    }

    function test_SYTSend() public {
        uint256 depositAmount = 1_000e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        syt.transfer(userB, 500e18);
        vm.stopPrank();
        assertEq(syt.balanceOf(userA), 500e18);
        assertEq(token.balanceOf(userB), 500e18);
        assertEq(token.balanceOf(mockAAVEPool), 500e18);
    }
}
