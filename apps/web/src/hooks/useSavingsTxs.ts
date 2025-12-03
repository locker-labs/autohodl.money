import { useInfiniteQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { AUTOHODL_ADDRESS, AUTOHODL_SUPPORTED_TOKENS, TOKEN_DECIMALS } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { computeRoundUpAndSavings } from '@/lib/helpers';

export interface ISavingsTx {
  id: string;
  timestamp?: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  purchaseValue: bigint;
}

export function useSavingsTxs() {
  const { address } = useAccount();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['savings-txs', address],
    queryFn: async ({ pageParam }) => {
      if (!address) {
        return { transfers: [], pageKey: undefined };
      }

      const response = await fetchErc20Transfers({
        fromAddress: address,
        toAddress: AUTOHODL_ADDRESS,
        contractAddresses: AUTOHODL_SUPPORTED_TOKENS,
        maxCount: 6,
        pageKey: pageParam,
      });

      console.log({ response });

      return response;
    },
    getNextPageParam: (lastPage) => lastPage.pageKey,
    initialPageParam: undefined as string | undefined,
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15000, // 15 seconds
  });

  // Flatten all pages into a single array of transactions
  const allTxs: ISavingsTx[] =
    data?.pages.flatMap((page) =>
      page.transfers.map((tx) => ({
        id: tx.uniqueId,
        timestamp: tx.metadata?.blockTimestamp,
        to: tx.to,
        from: tx.from,
        value: BigInt(tx.value * 10 ** TOKEN_DECIMALS),
        txHash: tx.hash,
        purchaseValue: computeRoundUpAndSavings(BigInt(tx.value * 10 ** TOKEN_DECIMALS), BigInt(10 ** TOKEN_DECIMALS))
          .savingsAmount,
      })),
    ) || [];

  // Get only the most recent page's transactions
  const txs: ISavingsTx[] =
    data?.pages[data.pages.length - 1]?.transfers.map((tx) => ({
      id: tx.uniqueId,
      timestamp: tx.metadata?.blockTimestamp,
      to: tx.to,
      from: tx.from,
      value: BigInt(tx.value * 10 ** TOKEN_DECIMALS),
      txHash: tx.hash,
      purchaseValue: computeRoundUpAndSavings(BigInt(tx.value * 10 ** TOKEN_DECIMALS), BigInt(10 ** TOKEN_DECIMALS))
        .savingsAmount,
    })) || [];

  return {
    allTxs, // All transactions from all pages
    txs, // Transactions from the most recent page only
    error: error instanceof Error ? error.message : null,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasNext: hasNextPage,
    fetchNext: fetchNextPage,
  };
}
