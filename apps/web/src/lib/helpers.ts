import type { Address } from 'viem';
import { erc20Abi } from 'viem';
import { viemPublicClient } from '@/lib/clients/server';

export async function fetchAllowance({
  tokenAddress,
  owner,
  spender,
}: {
  tokenAddress: Address;
  owner: Address;
  spender: Address;
}): Promise<bigint> {
  const allowance: bigint = await viemPublicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  });

  return allowance;
}
