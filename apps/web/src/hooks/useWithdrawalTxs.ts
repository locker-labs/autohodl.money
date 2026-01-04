import { useInfiniteQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { SusdcAddressMap } from '@/lib/constants';
import { type Erc20Transfer, fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { type Hex, parseUnits, zeroAddress } from 'viem';
import { EAutoHodlTxType } from '@/enums';
import { fetchBlockByNumberInBatch } from '@/lib/data/fetchBlockByNumberInBatch';
import { useAutoHodl } from '@/context/AutoHodlContext';

export interface IWithdrawalTx {
  id: string;
  timestamp?: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  blockNum: Hex;
  type: EAutoHodlTxType.Withdrawal;
}

export function useWithdrawalTxs() {
  const { address } = useConnection();
  const { savingsChainId: chainId } = useAutoHodl();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [`withdrawal-txs-${address}`],
    queryFn: async ({ pageParam }) => {
      if (!chainId || !address) {
        return { transfers: [], pageKey: undefined };
      }

      const response = await fetchErc20Transfers(
        {
          fromAddress: address,
          contractAddresses: [SusdcAddressMap[chainId]],
          maxCount: 100,
          pageKey: pageParam,
        },
        chainId,
      );

      const blockNumbers = response.transfers.map((tx) => tx.blockNum);
      const blocks = await fetchBlockByNumberInBatch(blockNumbers, chainId);
      const blockTimestamps = blocks.map((block) => block.timestamp);

      response.transfers = response.transfers.map((tx, i) => ({
        ...tx,
        metadata: {
          blockTimestamp: blockTimestamps[i],
        },
      }));

      return response;
    },
    getNextPageParam: (lastPage) => lastPage.pageKey,
    initialPageParam: undefined as string | undefined,
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000, // 5 seconds
  });

  // Flatten all pages into a single array of transactions
  const allTxs: IWithdrawalTx[] = data?.pages.flatMap((page) => page.transfers.map(withdrawalTxMapper)) || [];

  const allTxsFiltered: IWithdrawalTx[] = allTxs.filter((tx) => tx.to !== zeroAddress);

  // Get only the most recent page's transactions
  const txs: IWithdrawalTx[] = data?.pages[data.pages.length - 1]?.transfers.map(withdrawalTxMapper) || [];

  const txsFiltered: IWithdrawalTx[] = txs.filter((tx) => tx.to !== zeroAddress);

  return {
    allTxs, // All transactions from all pages
    allTxsFiltered,
    txs, // Transactions from the most recent page only
    txsFiltered,
    error: error instanceof Error ? error.message : null,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasNext: hasNextPage,
    fetchNext: fetchNextPage,
  };
}

function withdrawalTxMapper(tx: Erc20Transfer) {
  return {
    id: tx.uniqueId,
    timestamp: tx.metadata?.blockTimestamp,
    to: tx.to,
    from: tx.from,
    value: parseUnits(tx.value.toString(), Number(tx.rawContract.decimal)),
    txHash: tx.hash,
    blockNum: tx.blockNum as Hex,
    type: EAutoHodlTxType.Withdrawal as const,
  };
}
