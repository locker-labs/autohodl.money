import { useInfiniteQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { type Erc20Transfer, fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { type Hex, parseUnits } from 'viem';
import { fetchSourceTxInfoInBatch } from '@/lib/data/fetchSourceTxInfoInBatch';
import type { SourceTxInfo } from '@/types/autohodl';
import { EAutoHodlTxType } from '@/enums';
import { fetchBlockByNumberInBatch } from '@/lib/data/fetchBlockByNumberInBatch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { getAutoHodlAddressByChain, getAutoHodlSupportedTokens } from '@/lib/helpers';

export interface ISavingsTx {
  id: string;
  timestamp?: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  blockNum: Hex;
  type: EAutoHodlTxType.Savings;
  sourceTxHash: Hex;
  purchaseValue: bigint;
}

export function useSavingsTxs() {
  const { address } = useConnection();
  const { savingsChainId } = useAutoHodl();

  const [autohodl, autohodlTokens] = [
    getAutoHodlAddressByChain(savingsChainId),
    getAutoHodlSupportedTokens(savingsChainId),
  ];

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [`savings-txs-${address}`],
    queryFn: async ({ pageParam }) => {
      if (!address || !savingsChainId) {
        return { transfers: [], pageKey: undefined };
      }

      const response = await fetchErc20Transfers({
        fromAddress: address,
        toAddress: autohodl,
        contractAddresses: autohodlTokens,
        maxCount: 100,
        pageKey: pageParam,
      });

      const blockNumbers = response.transfers.map((tx) => tx.blockNum);
      const blocks = await fetchBlockByNumberInBatch(blockNumbers, savingsChainId);
      const blockTimestamps = blocks.map((block) => block.timestamp);

      const transactionHashes = response.transfers.map((tx) => tx.hash);
      const sourceTxInfoArray = await fetchSourceTxInfoInBatch(transactionHashes, savingsChainId);

      const transfersWithSourceTxInfo: (Erc20Transfer & SourceTxInfo)[] = [];

      for (let i = 0; i < response.transfers.length; i++) {
        transfersWithSourceTxInfo.push({
          ...response.transfers[i],
          ...sourceTxInfoArray[i],
          metadata: {
            blockTimestamp: blockTimestamps[i],
          },
        });
      }

      return {
        transfers: transfersWithSourceTxInfo,
        pageKey: response.pageKey,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pageKey;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000, // 5 seconds
  });

  // Flatten all pages into a single array of transactions
  const allTxs: ISavingsTx[] = data?.pages.flatMap((page) => page.transfers.map(savingsTxMapper)) || [];

  // Get only the most recent page's transactions
  const txs: ISavingsTx[] = data?.pages[data.pages.length - 1]?.transfers.map(savingsTxMapper) || [];

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

function savingsTxMapper(tx: Erc20Transfer & SourceTxInfo): ISavingsTx {
  return {
    id: tx.uniqueId,
    timestamp: tx.metadata?.blockTimestamp,
    to: tx.to,
    from: tx.from,
    value: parseUnits(tx.value.toString(), Number(tx.rawContract.decimal)),
    txHash: tx.hash,
    sourceTxHash: tx.sourceTxHash,
    purchaseValue: tx.purchaseAmount,
    // computedRoundUpValue: computeRoundUpAndSavings(
    //   parseUnits(tx.value.toString(), TOKEN_DECIMALS),
    //   parseUnits('1', TOKEN_DECIMALS),
    // ).savingsAmount,
    blockNum: tx.blockNum as Hex,
    type: EAutoHodlTxType.Savings,
  };
}
