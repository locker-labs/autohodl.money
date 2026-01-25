import axios from 'axios';
import type { Hex } from 'viem';
import { AlchemyApiUrlMap, type EChainId } from '@/lib/constants';
import type { IBlock } from '@/types/alchemy';
import type { IJsonRpcRequest, IJsonRpcResponse } from '@/types/json-rpc';

/**
 * Fetch blocks in bulk by block numbers.
 * @param blockNumbers - An array of block numbers (in hex string format) to fetch blocks for.
 * @returns A promise that resolves to an array of blocks.
 */
export async function fetchBlockByNumberInBatch(blockNumbers: Hex[], chainId: EChainId): Promise<IBlock[]> {
  const requests: IJsonRpcRequest[] = blockNumbers.map((blockNumber, index) => ({
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [blockNumber, false],
    id: index + 1,
  }));

  try {
    const { data } = await axios.post<IJsonRpcResponse<IBlock>[]>(AlchemyApiUrlMap[chainId], requests, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create a map to store responses by their IDs
    const blockMap = new Map<number, IBlock>();
    data.forEach((response) => {
      if (response.error) {
        console.error(`Error fetching block for request ID ${response.id}:`, response.error);
        throw new Error(`No block found for request ID ${response.id}`);
      }
      if (response.result) {
        blockMap.set(response.id, response.result);
      } else {
        throw new Error(`No block found for request ID ${response.id}`);
      }
    });

    // Map the responses back to the original order using blockNumbers indices
    return blockNumbers.map((_, index) => {
      const block = blockMap.get(index + 1);
      if (!block) {
        throw new Error(`No block found for block number at index ${index}`);
      }

      return block;
    });
  } catch (error) {
    console.error('Error fetching blocks in batch:', error);
    throw error;
  }
}
