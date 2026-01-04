// Lifetime spare change saved
'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useConnection } from 'wagmi';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { getAutoHodlAddressByChain, getAutoHodlSupportedTokens } from '@/lib/helpers';
import { roundOff } from '@/lib/math';

export function useLifetimeSavings() {
  const { address: fromAddress, isConnected } = useConnection();
  const { savingsChainId } = useAutoHodl();
  const autohodl = getAutoHodlAddressByChain(savingsChainId);
  const autohodlTokens = getAutoHodlSupportedTokens(savingsChainId);

  const { data, isLoading, error, isFetched, isFetching } = useQuery({
    queryKey: [`lifetimeSavingsErc20Transfers-${fromAddress}`],
    queryFn: async () => {
      if (!savingsChainId) throw new Error('savingsChainId is not defined');

      return fetchErc20Transfers(
        {
          fromAddress,
          toAddress: autohodl,
          contractAddresses: autohodlTokens,
          maxCount: 1000,
          order: 'desc',
        },
        savingsChainId,
      ).then((res) => res.transfers);
    },
    enabled: isConnected && !!fromAddress,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  });

  const changeSaved: number = useMemo(() => {
    if (!data) return 0;
    const total: number = data.reduce((total, transfer) => {
      return total + transfer.value;
    }, 0);
    return roundOff(total, 2);
  }, [data]);

  return { changeSaved, data, isLoading, isFetched, isFetching, error, isReady: isFetched && !isLoading };
}
