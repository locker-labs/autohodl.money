import { useQuery } from '@tanstack/react-query';
import { erc20Abi, formatUnits } from 'viem';
import { chains } from '@/config';
import { type EChainId, TokenDecimalMap } from '@/lib/constants';
import { getSusdcAddressByChain, getViemPublicClientByChain } from '@/lib/helpers';
import { roundOff } from '@/lib/math';
import { useConnection } from 'wagmi';

export type STokenBalance = {
  balance: bigint;
  balanceFormatted: number;
};

export type STokenBalancesMap = Map<EChainId, STokenBalance>;

export function useSTokenBalances() {
  const { address } = useConnection();
  return useQuery({
    queryKey: ['sToken-balances', address],
    queryFn: async () => {
      const balances: STokenBalancesMap = new Map();

      if (!address) {
        return balances;
      }

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const sUsdcAddress = getSusdcAddressByChain(chainId);

          // Skip if sUSDC address is '0x' or invalid/empty
          if (!sUsdcAddress || sUsdcAddress === '0x') {
            console.error(`Missing sUSDC address for chain ${chainId}`);
            return;
          }

          const client = getViemPublicClientByChain(chainId);
          if (!client) {
            console.error(`Missing public for chain ${chainId}`);
            return;
          }

          try {
            const balance = await client.readContract({
              address: sUsdcAddress,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            });

            const decimals = TokenDecimalMap[sUsdcAddress];
            if (!decimals) {
              console.error(`Missing decimals for chain ${chainId}`);
              return;
            }

            const balanceFormatted = roundOff(formatUnits(balance, decimals), 2);

            balances.set(chainId, {
              balance,
              balanceFormatted,
            });
          } catch (error) {
            console.error(`Error fetching sToken balance for chain ${chainId}`, error);
          }
        }),
      );

      return balances;
    },
    enabled: !!address,
  });
}
