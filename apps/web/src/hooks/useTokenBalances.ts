import { useQuery } from '@tanstack/react-query';
import { erc20Abi, formatUnits } from 'viem';
import { chains } from '@/config';
import { type EChainId, ERefetchInterval, TokenDecimalMap } from '@/lib/constants';
import { getUsdcAddressByChain, getViemPublicClientByChain } from '@/lib/helpers';
import { roundOff } from '@/lib/math';
import { useConnection } from 'wagmi';

export type TokenBalance = {
  balance: bigint;
  balanceFormatted: number;
};

export type TokenBalancesMap = Map<EChainId, TokenBalance>;

export function useTokenBalances() {
  const { address } = useConnection();
  return useQuery({
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: ERefetchInterval.FAST,
    queryKey: ['token-balances', address],
    queryFn: async () => {
      const balances: TokenBalancesMap = new Map();

      if (!address) {
        return balances;
      }

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const usdcAddress = getUsdcAddressByChain(chainId);

          if (!usdcAddress) {
            return;
          }

          const client = getViemPublicClientByChain(chainId);
          if (!client) {
            console.error(`Missing public for chain ${chainId}`);
            return;
          }

          try {
            const balance = await client.readContract({
              address: usdcAddress,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            });

            const decimals = TokenDecimalMap[usdcAddress];
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
            console.error(`Error fetching Token balance for chain ${chainId}`, error);
          }
        }),
      );

      return balances;
    },
  });
}
