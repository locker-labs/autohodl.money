import type { Address, Hex } from 'viem';
import { encodeAbiParameters } from 'viem';
import { MMCardDelegateAbi } from '@/lib/abis';
import { walletClient } from '@/lib/clients/server';
import { DELEGATE } from '@/lib/constants';

/**
 * Executes a savings transaction on the MMCardDelegate contract.
 * @param user The user address (must match connected wallet)
 * @param asset The ERC20 token address
 * @param value The amount to transfer (in token's smallest unit, e.g. USDC 6 decimals)
 * @param data Additional data to be emitted with the transaction
 * @returns The transaction hash
 */
export async function delegateSaving({
  user,
  asset,
  value,
  data,
}: {
  user: Address;
  asset: Address;
  value: bigint;
  data: { sourceTxHash: Hex; purchaseAmount: bigint };
}): Promise<Hex> {
  console.log('Delegate Saving called with:', { user, asset, value, data });

  if (!walletClient) throw new Error('No wallet client found');
  // The connected wallet must be the delegate for this user/token

  const params = [{ type: 'bytes32' }, { type: 'uint256' }];
  const encoded = encodeAbiParameters(params, [data.sourceTxHash, data.purchaseAmount]);
  console.log('encoded:', encoded);

  return walletClient.writeContract({
    address: DELEGATE,
    abi: MMCardDelegateAbi,
    functionName: 'delegateSaving',
    args: [user, asset, value, encoded],
  });
}
