// Lifetime spare change saved
'use client';

import { useQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { chains } from '@/config';
import type { EChainId } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { getAutoHodlAddressByChain, getAutoHodlSupportedTokens } from '@/lib/helpers';
import { roundOff } from '@/lib/math';

export type LifetimeSavingsMap = Map<EChainId, number>;

export function useLifetimeSavings() {
  const { address, isConnected } = useConnection();

  const { data, isLoading, error, isFetched, isFetching } = useQuery({
    queryKey: ['lifetime-savings', address],
    queryFn: async () => {
      const savingsMap: LifetimeSavingsMap = new Map();

      if (!address) return savingsMap;

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const autohodl = getAutoHodlAddressByChain(chainId);
          const autohodlTokens = getAutoHodlSupportedTokens(chainId);

          if (!autohodl || !autohodlTokens || autohodlTokens.length === 0) return;

          try {
            const res = await fetchErc20Transfers(
              {
                fromAddress: address,
                toAddress: autohodl,
                contractAddresses: autohodlTokens,
                maxCount: 1000,
                order: 'desc',
              },
              chainId,
            );

            // Calculate total for this chain
            const total = res.transfers.reduce((acc, t) => acc + t.value, 0);

            // Only add to map if there's a non-zero value, or if we want to track 0s
            // storing roundOff value directly
            savingsMap.set(chainId, roundOff(total, 2));
          } catch (err) {
            console.error(`Error fetching lifetime savings for chain ${chainId}`, err);
          }
        }),
      );

      return savingsMap;
    },
    enabled: isConnected && !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  });

  return { data, isLoading, isFetched, isFetching, error, isReady: isFetched && !isLoading };
}
