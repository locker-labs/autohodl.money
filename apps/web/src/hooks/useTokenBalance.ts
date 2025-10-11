import { useReadContract } from 'wagmi';
import { type Address, erc20Abi, formatUnits } from 'viem';
import { TokenDecimalMap } from '@/lib/constants';
import { chain } from '@/config';

const chainId = chain.id;

export function useTokenBalance({ address, token }: { address: Address; token: Address }) {
  const decimals = TokenDecimalMap[token];

  const { data, isFetched, isFetching } = useReadContract({
    chainId,
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  console.log('useTokenBalance', { isFetched, isFetching, data });

  const balanceNumber = data ? Number(formatUnits(data, decimals)) : 0;
  const balanceString = String(balanceNumber.toFixed(2));

  return {
    balance: data,
    isFetched,
    isFetching,
    balanceNumber,
    balanceString,
  };
}
