import { decodeDelegateSavingData } from '@/lib/autohodl';
import { type EChainId, SavingDelegatedEventSigHash } from '@/lib/constants';
import type { ITransactionReceipt } from '@/types/alchemy';
import type { SourceTxInfo } from '@/types/autohodl';
import { fetchTransactionReceiptsInBatch } from './fetchTransactionReceiptsInBatch';

/**
 * Fetches source transaction information in batch for a given array of transaction hashes.
 *
 * This function retrieves transaction receipts for the provided transaction hashes
 * and extracts the source transaction information from the logs of each receipt.
 * If a receipt does not contain the expected log or is null, the corresponding result
 * will be `null`.
 *
 * @param transactionHashes - An array of transaction hashes to fetch source transaction information for.
 * @returns A promise that resolves to an array of `SourceTxInfo` objects or `null` values.
 *          Each element corresponds to the respective transaction hash in the input array.
 */
export async function fetchSourceTxInfoInBatch(
  transactionHashes: string[],
  defaultChainId: EChainId,
): Promise<SourceTxInfo[]> {
  const receipts: ITransactionReceipt[] = await fetchTransactionReceiptsInBatch(transactionHashes, defaultChainId);

  return receipts.map((receipt: ITransactionReceipt) => {
    if (receipt) {
      const log = receipt.logs.find((log) => log.topics.some((topic) => topic === SavingDelegatedEventSigHash));
      if (log) {
        const sourceTxInfo: SourceTxInfo = decodeDelegateSavingData(log.data, defaultChainId);
        return sourceTxInfo;
      }
    }

    throw Error('No source transaction info found in receipt');
  });
}
