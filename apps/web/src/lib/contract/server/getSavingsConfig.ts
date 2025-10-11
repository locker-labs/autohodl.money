import type { Address } from 'viem';
import type { SavingsConfig } from '@/types/autohodl';
import { AutoHodlAbi } from '../../abis/AutoHodl';
import { viemPublicClient } from '../../clients/server';
import { AUTOHODL_ADDRESS } from '../../constants';

export async function getSavingsConfig(user: Address, token: Address): Promise<Readonly<SavingsConfig>> {
  const config: Readonly<SavingsConfig> = await viemPublicClient.readContract({
    address: AUTOHODL_ADDRESS,
    abi: AutoHodlAbi,
    functionName: 'savings',
    args: [user, token],
  });

  return config;
}
