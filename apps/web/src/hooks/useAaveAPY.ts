import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { linea, sepolia } from 'viem/chains';
import { AaveV3Linea, AaveV3Sepolia } from '@bgd-labs/aave-address-book';
import { chain } from '@/config';

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
    chain: linea,
    chainId: linea.id,
    usdcAddress: AaveV3Linea.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Linea.POOL,
    rpcUrl: 'https://rpc.linea.build',
    name: 'Linea',
  },
  [sepolia.id]: {
    chain: sepolia,
    chainId: sepolia.id,
    usdcAddress: AaveV3Sepolia.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Sepolia.POOL,
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    name: 'Sepolia',
  },
} as const;

export function useAaveAPY() {
  const [apy, setApy] = useState<string>('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAaveAPY() {
      try {
        setLoading(true);
        setError(null);

        const config = CHAIN_CONFIGS[chain.id];

        // Create public client for the specified chain
        const publicClient = createPublicClient({
          chain: config.chain,
          transport: http(config.rpcUrl),
        });

        // Call getReserveData directly on the Pool contract for USDC
        const reserveData = await publicClient.readContract({
          address: config.aavePoolAddress as Address,
          abi: simplePoolAbi,
          functionName: 'getReserveData',
          args: [config.usdcAddress as Address],
        });

        if (reserveData?.currentLiquidityRate) {
          // Convert currentLiquidityRate from ray (1e27) to APY percentage
          const liquidityRateRay = Number(reserveData.currentLiquidityRate);
          const apyValue = (liquidityRateRay / 1e27) * 100;

          setApy(apyValue.toFixed(2));
        } else {
          setError('No liquidity rate found');
          setApy('--');
        }
      } catch (err) {
        console.error('Error fetching Aave APY:', err);
        setError('Failed to fetch APY');
        setApy('--');
      } finally {
        setLoading(false);
      }
    }

    fetchAaveAPY();

    // Refresh APY every 5 minutes
    const interval = setInterval(fetchAaveAPY, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { apy, loading, error };
}
