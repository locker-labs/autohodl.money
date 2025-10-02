import type { Address } from 'viem';
import { erc20Abi } from 'viem';
import { viemPublicClient } from '@/lib/clients';

export async function fetchAllowance({
  tokenAddress,
  from,
  to,
}: {
  tokenAddress: Address;
  from: Address;
  to: Address;
}): Promise<bigint> {
  const allowance: bigint = await viemPublicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [from, to],
  });

  console.log('Current allowance:', allowance);
  return allowance;
}
