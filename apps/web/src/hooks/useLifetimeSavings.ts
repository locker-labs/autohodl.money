// Lifetime spare change saved
'use client';

import { useQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { chains } from '@/config';
import { ERefetchInterval, type EChainId } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { getAutoHodlAddressByChain, getAutoHodlSupportedTokens, getScheduleAutoHodlAddressByChain } from '@/lib/helpers';
import { roundOff } from '@/lib/math';

export type LifetimeSavingsMap = Map<EChainId, number>;

export function useLifetimeSavings() {
  const { address } = useConnection();

  const { data, isLoading, error, isFetched, isFetching } = useQuery({
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: ERefetchInterval.FAST,
    queryKey: ['lifetime-savings', address],
    queryFn: async () => {
      const savingsMap: LifetimeSavingsMap = new Map();

      if (!address) return savingsMap;

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const autohodl = getAutoHodlAddressByChain(chainId);
          const scheduleHodl = getScheduleAutoHodlAddressByChain(chainId);
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
            const res2 = await fetchErc20Transfers(
              {
                fromAddress: address,
                toAddress: scheduleHodl,
                contractAddresses: autohodlTokens,
                maxCount: 1000,
                order: 'desc',
              },
              chainId,
            );

            const roundUpTransfers = res.transfers.map((tx) => ({ ...tx, isSchedule: false }));
            const scheduledTransfers = res2.transfers.map((tx) => ({ ...tx, isSchedule: true }));
            
            const combinedTransfers = [...roundUpTransfers, ...scheduledTransfers];

            const total = combinedTransfers.reduce((acc, t) => acc + t.value, 0);

            savingsMap.set(chainId, roundOff(total, 2));
          } catch (err) {
            console.error(`Error fetching lifetime savings for chain ${chainId}`, err);
          }
        }),
      );

      return savingsMap;
    },
  });

  return { data, isLoading, isFetched, isFetching, error, isReady: isFetched && !isLoading };
}
