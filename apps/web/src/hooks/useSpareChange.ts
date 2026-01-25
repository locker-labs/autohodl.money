import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { AUTOHODL_ADDRESS, AUTOHODL_SUPPORTED_TOKENS } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { roundOff } from '@/lib/math';

export function useSpareChange() {
  const { address: fromAddress, isConnected } = useAccount();

  //   TODO: enable support for more than 100 transfers
  const { data, isLoading, error, isFetched, isFetching } = useQuery({
    queryKey: [`spareChangeErc20Transfers-${fromAddress}`],
    queryFn: () =>
      fetchErc20Transfers({
        fromAddress,
        toAddress: AUTOHODL_ADDRESS,
        contractAddresses: AUTOHODL_SUPPORTED_TOKENS,
        maxCount: 1000,
        order: 'desc',
      }).then((res) => res.transfers),
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
