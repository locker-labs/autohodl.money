import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { AUTOHODL_ADDRESS, USDC_ADDRESS } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { truncateToTwoDecimals } from '@/lib/math';

export function useSpareChange() {
  const { address: fromAddress, isConnected } = useAccount();

  //   TODO: enable support for more than 100 transfers
  const { data, isLoading, error, isFetched, isFetching } = useQuery({
    queryKey: ['spareChangeErc20Transfers', fromAddress],
    queryFn: () =>
      fetchErc20Transfers({
        fromAddress,
        toAddress: AUTOHODL_ADDRESS,
        contractAddresses: [USDC_ADDRESS],
        maxCount: 100,
      }).then((res) => res.transfers),
    enabled: isConnected && !!fromAddress,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15000,
  });

  const changeSaved: number = useMemo(() => {
    if (!data) return 0;
    const total: number = data.reduce((total, transfer) => {
      return total + Number(transfer.rawContract.value) / 10 ** Number(transfer.rawContract.decimal);
    }, 0);
    return truncateToTwoDecimals(total);
    // return Math.trunc(total * 100) / 100; // round to 2 decimal places
  }, [data]);

  return { changeSaved, data, isLoading, isFetched, isFetching, error, isReady: isFetched && !isLoading };
}
