import axios from 'axios';
import type { Hex } from 'viem';
import type { EChainId } from '@/lib/constants';
import { getAlchemyApiUrlByChain } from '@/lib/helpers';

interface Erc20TransferParams {
  fromBlock?: string;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
  excludeZeroValue?: boolean;
  category?: ('external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft')[];
  contractAddresses: string[]; // An array of contract addresses to filter for.
  order?: 'asc' | 'desc';
  withMetadata?: boolean; // Defaults to false
  maxCount?: number; // Defaults to 0x3e8
  pageKey?: string; // Defaults to 0x0
}

export interface Erc20Transfer {
  blockNum: Hex;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  erc721TokenId: string | null;
  erc1155Metadata: any | null;
  tokenId: string | null;
  asset: string;
  category: string;
  rawContract: {
    value: string;
    address: string;
    decimal: string;
  };
  metadata: {
    blockTimestamp: string;
  };
}

export interface Erc20TransferResponse {
  transfers: Erc20Transfer[];
  pageKey?: string;
}

export async function fetchErc20Transfers(
  params: Erc20TransferParams,
  chainId: EChainId,
): Promise<Erc20TransferResponse> {
  const {
    fromBlock = '0x0',
    toBlock = 'latest',
    fromAddress,
    toAddress,
    contractAddresses,
    order = 'desc',
    maxCount = 100,
    pageKey = '0x0',
  } = params;

  const requestBody = {
    id: 1,
    jsonrpc: '2.0',
    method: 'alchemy_getAssetTransfers',
    params: [
      {
        fromBlock,
        toBlock,
        category: ['erc20'],
        fromAddress,
        toAddress,
        contractAddresses,
        withMetadata: true,
        excludeZeroValue: true,
        order,
        maxCount: `0x${maxCount.toString(16)}`,
        pageKey,
      },
    ],
  };

  try {
    const response = await axios.post<{ result: Erc20TransferResponse }>(
      getAlchemyApiUrlByChain(chainId),
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const { result } = response.data;
    if (result) {
      return result;
    }
    return {
      transfers: [],
    };
  } catch (error) {
    console.error('Error fetching ERC20 transfers:', error);
    throw error;
  }
}
