// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LockerRouter} from "../src/yield/LockerRouter.sol";
import {LockerSYT} from "../src/yield/LockerSYT.sol";
import {AAVEAdapter} from "../src/yield/adapters/AAVEAdapter.sol";

contract MockAAVEPool {
    YIELDTOKEN public yieldToken;
    constructor(address _yieldToken) {
        yieldToken = YIELDTOKEN(_yieldToken);
    }
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // In a real AAVE pool, a yield token would be minted to onBehalfOf
        // For testing, we will mint a mock yield token directly
        yieldToken.transfer(onBehalfOf, amount);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        yieldToken.burn(msg.sender, amount);
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

contract YIELDTOKEN is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
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
    AAVEAdapter aaveAdapter;
    AAVEAdapter pendle;
    ERC20TOKEN token;
    YIELDTOKEN yieldToken;

    address asset = address(0xA11CE); // mock ERC20 set in setUp
    address userA = address(0xA);
    address userB = address(0xB);
    address userC = address(0xC);
    address mockAAVEPool = address(0xD);

    function setUp() public {
        // Deploy mock asset
        token = new ERC20TOKEN("Mock", "MOCK");
        asset = address(token);

        // Deploy mock yield token
        yieldToken = new YIELDTOKEN("Yield Mock", "yMOCK");

        address[] memory tokenAddresses = new address[](0);
        address[] memory emptyAdapters = new address[](0);
        uint32[] memory emptyBps = new uint32[](0);

        // Deploy Locker Router
        router = new LockerRouter(tokenAddresses, emptyAdapters, emptyBps);

        // Deploy mock AAVE pool
        MockAAVEPool mockPool = new MockAAVEPool(address(yieldToken));
        mockAAVEPool = address(mockPool);

        // Deploy SYT and adapters
        syt = new LockerSYT("SYT MOCK", "sMOCK", 18, address(router), asset);
        address[] memory assets = new address[](1);
        assets[0] = asset;
        address[] memory aavePools = new address[](1);
        aavePools[0] = mockAAVEPool;
        address[] memory yieldTokens = new address[](1);
        yieldTokens[0] = address(yieldToken);
        aaveAdapter = new AAVEAdapter(address(router), assets, aavePools, yieldTokens);

        // Configure Router
        address[] memory adapters = new address[](1);
        adapters[0] = address(aaveAdapter);
        uint32[] memory bps = new uint32[](1);
        bps[0] = 10000;
        router.setDefaultAlloc(assets, adapters, bps); // a test subclass if abstract
        router.setSupportedSYT(asset, address(syt)); // or call a setter if exposed
        router.setAssetAdapter(asset, address(aaveAdapter), true);

        // Mint test balances and approvals
        token.mint(userA, 10_000e18);
        token.mint(userC, 10_000e18);
        yieldToken.mint(address(mockAAVEPool), 10_000e18); // fund adapter with yield tokens for redemptions
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

    // Test non yield SYT deposits
    function test_MultiDeposit() public {
        uint256 depositAmount = 1_000e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        vm.stopPrank();
        vm.startPrank(userC);
        router.depositFor(userB, asset, depositAmount);
        vm.stopPrank();
        assertEq(syt.balanceOfSYT(userA), depositAmount);
        assertEq(syt.balanceOfSYT(userB), depositAmount);
        assertEq(yieldToken.balanceOf(address(aaveAdapter)), 2 * depositAmount);
        // check per user aUSDC balance
        assertEq(syt.balanceOf(userA), depositAmount); // syt.balanceOf fetches aUSDC balance
        assertEq(syt.balanceOf(userB), depositAmount);
    }

    function test_SYTSend() public {
        uint256 depositAmount = 1_000e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        syt.transfer(userB, 500e18);
        vm.stopPrank();
        assertEq(syt.balanceOfSYT(userA), 500e18);
        assertEq(token.balanceOf(userB), 500e18);
        assertEq(syt.balanceOfSYT(userB), 0);
    }

    // Yield enabled
    function test_MultiDepositWithYield() public {
        uint256 depositAmount = 1_000e18;
        uint256 yieldAmount = 100e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        vm.stopPrank();
        // Simulate yield accrual by minting yield tokens to adapter
        yieldToken.mint(address(aaveAdapter), yieldAmount); // 10% yield
        vm.startPrank(userC);
        router.depositFor(userB, asset, depositAmount);
        vm.stopPrank();
        assertEq(syt.balanceOfSYT(userA), depositAmount);
        assertEq(syt.balanceOf(userA), depositAmount + yieldAmount); // userA's balance should includes yield
        assertLt(syt.balanceOfSYT(userB), depositAmount); // userB's SYT balance should be less 
        assertEq(syt.balanceOf(userB), depositAmount - 1); // -1 for floor in math. 
    
        // Increase yield and check if the yield is distributed correctly
        yieldToken.mint(address(aaveAdapter), yieldAmount); // 10% original yield

        vm.startPrank(userA);
        syt.transfer(userB, syt.balanceOf(userA)); // userA cannot transfer more than balance
        // True with scaling
        // assertEq(syt.balanceOf(userA), depositAmount + (3*yieldAmount)/2);
        // assertEq(syt.balanceOf(userB), depositAmount - 1 + yieldAmount/2);
    }

    function test_sendYieldGained() public {
        uint256 depositAmount = 1_000e18;
        uint256 yieldAmount = 100e18;
        vm.startPrank(userA);
        router.deposit(asset, depositAmount);
        vm.stopPrank();
        // Simulate yield accrual by minting yield tokens to adapter
        yieldToken.mint(address(aaveAdapter), yieldAmount); // 10% yield
        token.mint(address(mockAAVEPool),yieldAmount);

        vm.startPrank(userA);
        syt.transfer(userB, depositAmount + yieldAmount);
        vm.stopPrank();

        assertEq(token.balanceOf(userB), depositAmount + yieldAmount);
        assertEq(syt.balanceOfSYT(userA),0);
        assertEq(yieldToken.balanceOf(address(aaveAdapter)), 0);
    }
}
