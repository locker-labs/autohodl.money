import type { Address } from 'viem';
import type { SavingsConfigArray } from '@/types/autohodl';
import { AutoHodlAbi } from '../../abis/AutoHodl';
import { viemPublicClient } from '../../clients/server';
import { AUTOHODL_ADDRESS } from '../../constants';

export async function getSavingsConfigArray(user: Address, token: Address): Promise<Readonly<SavingsConfigArray>> {
  const config: Readonly<SavingsConfigArray> = await viemPublicClient.readContract({
    address: AUTOHODL_ADDRESS,
    abi: AutoHodlAbi,
    functionName: 'savings',
    args: [user, token],
  });

  return config;
}
