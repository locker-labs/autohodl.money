import { useQuery } from '@tanstack/react-query';
import { linea, sepolia } from 'viem/chains';
import { AaveV3Linea, AaveV3Sepolia } from '@bgd-labs/aave-address-book';
import { chain } from '@/config';
import { viemPublicClient } from '@/lib/clients/client';

// Simple Pool ABI for getting reserve data
const simplePoolAbi = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      {
        components: [
          { name: 'configuration', type: 'uint256' },
          { name: 'liquidityIndex', type: 'uint128' },
          { name: 'currentLiquidityRate', type: 'uint128' },
          { name: 'variableBorrowIndex', type: 'uint128' },
          { name: 'currentVariableBorrowRate', type: 'uint128' },
          { name: 'currentStableBorrowRate', type: 'uint128' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'id', type: 'uint16' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' },
        ],
        name: 'reserveData',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Chain configurations
const CHAIN_CONFIGS = {
  [linea.id]: {
    usdcAddress: AaveV3Linea.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Linea.POOL,
  },
  [sepolia.id]: {
    usdcAddress: AaveV3Sepolia.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Sepolia.POOL,
  },
} as const;

export function useAaveAPY() {
  async function fetchAaveAPY() {
    try {
      const config = CHAIN_CONFIGS[chain.id];

      // Call getReserveData directly on the Pool contract for USDC
      const reserveData = await viemPublicClient.readContract({
        address: config.aavePoolAddress,
        abi: simplePoolAbi,
        functionName: 'getReserveData',
        args: [config.usdcAddress],
      });

      if (reserveData?.currentLiquidityRate) {
        // Convert currentLiquidityRate from ray (1e27) to APY percentage
        const liquidityRateRay = Number(reserveData.currentLiquidityRate);
        const apyValue = (liquidityRateRay / 1e27) * 100;

        return apyValue.toFixed(2);
      }

      throw new Error('No liquidity rate found');
    } catch (err) {
      console.error('Error fetching Aave APY:', err);
      throw new Error('Failed to fetch APY');
    }
  }

  return useQuery({
    queryKey: ['aave-apy', chain.id],
    queryFn: fetchAaveAPY,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15000, // 15 seconds
  });
}
