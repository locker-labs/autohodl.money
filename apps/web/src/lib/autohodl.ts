import type { Address, Hex, PublicClient } from 'viem';
import { decodeAbiParameters } from 'viem';
import {
  extraDataParams,
  type SavingsConfig,
  type SavingsConfigArray,
  SavingsMode,
  type SourceTxInfo,
} from '@/types/autohodl';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import type { EChainId } from './constants';
import { getAutoHodlAddressByChain } from './helpers';

export function decodeDelegateSavingData(data: Hex, defaultChainId: EChainId): SourceTxInfo {
  // New format with sourceChainId (5 params)
  const newParams = [
    { type: 'uint256' },
    { type: 'uint256' },
    { type: 'bytes32' },
    { type: 'uint256' },
    { type: 'uint256' },
  ];

  // Old format without sourceChainId (4 params)
  const oldParams = [{ type: 'uint256' }, { type: 'uint256' }, { type: 'bytes32' }, { type: 'uint256' }];

  // Try new format first, fall back to old format for backward compatibility
  try {
    const decoded = decodeAbiParameters(newParams, data);
    return {
      sourceTxHash: decoded[2] as Hex,
      purchaseAmount: decoded[3] as bigint,
      sourceChainId: Number(decoded[4]),
    };
  } catch {
    // Fall back to old format without sourceChainId
    const decoded = decodeAbiParameters(oldParams, data);
    return {
      sourceTxHash: decoded[2] as Hex,
      purchaseAmount: decoded[3] as bigint,
      sourceChainId: defaultChainId,
    };
  }
}

export function parseSavingsConfig(arr: SavingsConfigArray | Readonly<SavingsConfigArray>): SavingsConfig {
  let mode: SavingsMode = SavingsMode.All;
  if (arr[5] && arr[5] !== '0x') {
    const decoded = decodeAbiParameters(extraDataParams, arr[5]);
    if (decoded[0]) {
      mode = decoded[0] as SavingsMode;
    }
  }

  return {
    savingAddress: arr[0],
    delegate: arr[1],
    roundUp: arr[2],
    active: arr[3],
    toYield: arr[4],
    extraData: arr[5],
    mode,
  };
}

export async function getSavingsConfig(
  viemPublicClient: PublicClient,
  user: Address,
  token: Address,
  chainId: EChainId,
): Promise<SavingsConfig> {
  const configArray: Readonly<SavingsConfigArray> = await viemPublicClient.readContract({
    address: getAutoHodlAddressByChain(chainId),
    abi: AutoHodlAbi,
    functionName: 'savings',
    args: [user, token],
  });

  return parseSavingsConfig(configArray);
}
