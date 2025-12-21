import axios from 'axios';
import { ALCHEMY_API_URL } from '@/lib/constants';
import type { ITransactionReceipt } from '@/types/alchemy';
import type { IJsonRpcRequest, IJsonRpcResponse } from '@/types/json-rpc';

/**
 * Fetch transaction receipts in bulk by transaction hashes.
 * @param transactionHashes - An array of transaction hashes to fetch receipts for.
 * @returns A promise that resolves to an array of transaction receipts.
 */
export async function fetchTransactionReceiptsInBatch(transactionHashes: string[]): Promise<ITransactionReceipt[]> {
  const requests: IJsonRpcRequest[] = transactionHashes.map((hash, index) => ({
    jsonrpc: '2.0',
    method: 'eth_getTransactionReceipt',
    params: [hash],
    id: index + 1,
  }));

  try {
    const { data } = await axios.post<IJsonRpcResponse<ITransactionReceipt>[]>(ALCHEMY_API_URL, requests, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create a map to store responses by their IDs
    const receiptMap = new Map<number, ITransactionReceipt>();
    data.forEach((response) => {
      if (response.error) {
        console.error(`Error fetching receipt for request ID ${response.id}:`, response.error);
        throw new Error(`No receipt found for request ID ${response.id}`);
      }
      if (response.result) {
        receiptMap.set(response.id, response.result);
      } else {
        throw new Error(`No receipt found for request ID ${response.id}`);
      }
    });

    // Map the responses back to the original order using transactionHashes indices
    return transactionHashes.map((_, index) => {
      const receipt = receiptMap.get(index + 1);
      if (!receipt) {
        throw new Error(`No receipt found for transaction hash at index ${index}`);
      }

      return receipt;
    });
  } catch (error) {
    console.error('Error fetching transaction receipts in batch:', error);
    throw error;
  }
}
