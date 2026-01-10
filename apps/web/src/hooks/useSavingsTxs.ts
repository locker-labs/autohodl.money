import { useQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { chains } from '@/config';
import { type Erc20Transfer, fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { type Hex, parseUnits } from 'viem';
import { fetchSourceTxInfoInBatch } from '@/lib/data/fetchSourceTxInfoInBatch';
import type { SourceTxInfo } from '@/types/autohodl';
import { EAutoHodlTxType } from '@/enums';
import { fetchBlockByNumberInBatch } from '@/lib/data/fetchBlockByNumberInBatch';
import type { EChainId } from '@/lib/constants';
import { getAutoHodlAddressByChain, getAutoHodlSupportedTokens } from '@/lib/helpers';
import type { ISavingsTx } from '@/types/tx';
import { sortByTimestampDesc } from '@/lib/helpers/sort';

export function useSavingsTxs() {
  const { address, isConnected } = useConnection();

  const { data, isLoading, error, isFetched } = useQuery({
    queryKey: ['savings-txs', address],
    queryFn: async () => {
      const allTransfers: ISavingsTx[] = [];

      if (!address) return allTransfers;

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const autohodl = getAutoHodlAddressByChain(chainId);
          const autohodlTokens = getAutoHodlSupportedTokens(chainId);

          if (!autohodl || !autohodlTokens || autohodlTokens.length === 0) return;

          try {
            const response = await fetchErc20Transfers(
              {
                fromAddress: address,
                toAddress: autohodl,
                contractAddresses: autohodlTokens,
                maxCount: 100,
              },
              chainId,
            );

            if (response.transfers.length === 0) return;

            const blockNumbers = response.transfers.map((tx) => tx.blockNum);
            const blocks = await fetchBlockByNumberInBatch(blockNumbers, chainId);
            const blockTimestamps = blocks.map((block) => block.timestamp);

            const transactionHashes = response.transfers.map((tx) => tx.hash);
            const sourceTxInfoArray = await fetchSourceTxInfoInBatch(transactionHashes, chainId);

            for (let i = 0; i < response.transfers.length; i++) {
              const transferWithSourceTxInfo = {
                ...response.transfers[i],
                ...sourceTxInfoArray[i],
                metadata: {
                  blockTimestamp: blockTimestamps[i],
                },
              };
              allTransfers.push(savingsTxMapper(transferWithSourceTxInfo, chainId));
            }
          } catch (err) {
            console.error(`Error fetching savings txs for chain ${chainId}`, err);
          }
        }),
      );

      return allTransfers.sort(sortByTimestampDesc);
    },
    enabled: isConnected && !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000, // 5 seconds
  });

  return {
    allTxs: data || [],
    error: error instanceof Error ? error.message : null,
    loading: isLoading,
    isReady: isFetched && !isLoading,
  };
}

function savingsTxMapper(tx: Erc20Transfer & SourceTxInfo, chainId: EChainId): ISavingsTx {
  return {
    id: tx.uniqueId,
    timestamp: tx.metadata?.blockTimestamp,
    to: tx.to,
    from: tx.from,
    value: parseUnits(tx.value.toString(), Number(tx.rawContract.decimal)),
    txHash: tx.hash,
    sourceTxHash: tx.sourceTxHash,
    purchaseValue: tx.purchaseAmount,
    blockNum: tx.blockNum as Hex,
    type: EAutoHodlTxType.Savings,
    chainId,
    sourceChainId: tx.sourceChainId as EChainId,
  };
}
