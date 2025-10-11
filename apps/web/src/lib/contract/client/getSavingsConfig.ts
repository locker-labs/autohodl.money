import type { Address } from 'viem';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import { viemPublicClient } from '@/lib/clients/client';
import { AUTOHODL_ADDRESS } from '@/lib/constants';
import { parseSavingsConfig, type SavingsConfigArray, type SavingsConfig } from '@/types/autohodl';

export async function getSavingsConfig(user: Address, token: Address): Promise<SavingsConfig> {
  const configArray: Readonly<SavingsConfigArray> = await viemPublicClient.readContract({
    address: AUTOHODL_ADDRESS,
    abi: AutoHodlAbi,
    functionName: 'savings',
    args: [user, token],
  });

  return parseSavingsConfig(configArray);
}
