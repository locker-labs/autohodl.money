import type { Address, PublicClient } from 'viem';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import { AUTOHODL_ADDRESS } from '@/lib/constants';
import { parseSavingsConfig, type SavingsConfig, type SavingsConfigArray } from '@/types/autohodl';

export async function getSavingsConfig(
  viemPublicClient: PublicClient,
  user: Address,
  token: Address,
): Promise<SavingsConfig> {
  const configArray: Readonly<SavingsConfigArray> = await viemPublicClient.readContract({
    address: AUTOHODL_ADDRESS,
    abi: AutoHodlAbi,
    functionName: 'savings',
    args: [user, token],
  });

  return parseSavingsConfig(configArray);
}
