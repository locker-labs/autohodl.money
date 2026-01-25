import { useQuery } from '@tanstack/react-query';
import { useConnection } from 'wagmi';
import { chains } from '@/config';
import { ERefetchInterval, SusdcAddressMap, type EChainId } from '@/lib/constants';
import { type Erc20Transfer, fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';
import { type Hex, parseUnits, zeroAddress } from 'viem';
import { EAutoHodlTxType } from '@/enums';
import { fetchBlockByNumberInBatch } from '@/lib/data/fetchBlockByNumberInBatch';
import type { IWithdrawalTx } from '@/types/tx';
import { sortByTimestampDesc } from '@/lib/helpers/sort';

export function useWithdrawalTxs() {
  const { address } = useConnection();

  const { data, isLoading, error, isFetched } = useQuery({
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: ERefetchInterval.FAST,
    queryKey: ['withdrawal-txs', address],
    queryFn: async () => {
      const allTransfers: IWithdrawalTx[] = [];

      if (!address) return allTransfers;

      await Promise.all(
        chains.map(async (chain) => {
          const chainId = chain.id as EChainId;
          const sUsdcAddress = SusdcAddressMap[chainId];

          // Skip if sUSDC address is '0x' or invalid/empty
          if (!sUsdcAddress || sUsdcAddress === '0x') return;

          try {
            const response = await fetchErc20Transfers(
              {
                fromAddress: address,
                contractAddresses: [sUsdcAddress],
                maxCount: 100,
              },
              chainId,
            );

            if (response.transfers.length === 0) return;

            const blockNumbers = response.transfers.map((tx) => tx.blockNum);
            const blocks = await fetchBlockByNumberInBatch(blockNumbers, chainId);
            const blockTimestamps = blocks.map((block) => block.timestamp);

            for (let i = 0; i < response.transfers.length; i++) {
              const transferWithTimestamp = {
                ...response.transfers[i],
                metadata: {
                  blockTimestamp: blockTimestamps[i],
                },
              };
              allTransfers.push(withdrawalTxMapper(transferWithTimestamp, chainId));
            }
          } catch (err) {
            console.error(`Error fetching withdrawal txs for chain ${chainId}`, err);
          }
        }),
      );

      return allTransfers.sort(sortByTimestampDesc);
    },
  });

  const allTxs = data || [];
  const allTxsFiltered = allTxs.filter((tx) => tx.to !== zeroAddress);

  return {
    allTxs,
    allTxsFiltered,
    error: error instanceof Error ? error.message : null,
    loading: isLoading,
    isReady: isFetched && !isLoading,
  };
}

function withdrawalTxMapper(tx: Erc20Transfer, chainId: EChainId): IWithdrawalTx {
  return {
    id: tx.uniqueId,
    timestamp: tx.metadata?.blockTimestamp,
    to: tx.to,
    from: tx.from,
    value: parseUnits(tx.value.toString(), Number(tx.rawContract.decimal)),
    txHash: tx.hash,
    blockNum: tx.blockNum as Hex,
    type: EAutoHodlTxType.Withdrawal as const,
    chainId,
  };
}
