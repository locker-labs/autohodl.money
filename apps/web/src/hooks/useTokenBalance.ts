import { useReadContract } from 'wagmi';
import { type Address, erc20Abi, formatUnits } from 'viem';
import { TokenDecimalMap } from '@/lib/constants';
import { truncateToTwoDecimals } from '@/lib/math';
import { chain } from '@/config';

const chainId = chain.id;

export function useTokenBalance({ address, token }: { address: Address | undefined; token: Address }) {
  const decimals = TokenDecimalMap[token];

  const { data, isFetched, isFetching, isLoading } = useReadContract({
    chainId,
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const balanceFormatted = data ? truncateToTwoDecimals(formatUnits(data, decimals)) : 0;

  console.log('useTokenBalance', {
    balance: data,
    balanceFormatted,
    isFetched,
    isFetching,
  });

  return {
    balance: data,
    balanceFormatted,
    isReady: isFetched && !isLoading,
    isLoading,
    isFetched,
    isFetching,
  };
}
