import type { Address, PublicClient } from 'viem';
import { erc20Abi } from 'viem';

export async function fetchAllowance({
  publicClient,
  tokenAddress,
  owner,
  spender,
}: {
  publicClient: PublicClient;
  tokenAddress: Address;
  owner: Address;
  spender: Address;
}): Promise<bigint> {
  const allowance: bigint = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  });

  return allowance;
}
