import axios from 'axios';
import { chain } from '@/config';
import { AlchemyChainMap } from '@/lib/constants';
import { secrets } from '@/lib/secrets';

const ALCHEMY_API_URL = `https://${AlchemyChainMap[chain.id]}.g.alchemy.com/v2/${secrets.alchemyApiKey}`;

interface Erc20TransferParams {
  fromBlock?: string;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
  contractAddresses: string[];
  maxCount?: number;
}

export interface Erc20Transfer {
  blockNum: string;
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

interface Erc20TransferResponse {
  transfers: Erc20Transfer[];
}

export async function fetchErc20Transfers(params: Erc20TransferParams): Promise<Erc20TransferResponse> {
  const { fromBlock = '0x0', toBlock = 'latest', fromAddress, toAddress, contractAddresses, maxCount = 100 } = params;

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
        maxCount: `0x${maxCount.toString(16)}`,
      },
    ],
  };

  try {
    const response = await axios.post(ALCHEMY_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { result } = response.data;
    if (result) {
      return {
        transfers: result.transfers,
      };
    }
    return {
      transfers: [],
    };
  } catch (error) {
    console.error('Error fetching ERC20 transfers:', error);
    throw error;
  }
}
