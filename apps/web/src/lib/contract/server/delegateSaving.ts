import type { Address, Hex } from 'viem';
import { encodeAbiParameters } from 'viem';
import { MMCardDelegateAbi } from '@/lib/abis';
import { account, getViemWalletClientByChain } from '@/lib/clients/server';
import type { EChainId } from '@/lib/constants';
import { getDelegateAddressByChain, getViemChain } from '@/lib/helpers';

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
  chainId,
}: {
  user: Address;
  asset: Address;
  value: bigint;
  data: { sourceTxHash: Hex; purchaseAmount: bigint };
  chainId: EChainId;
}): Promise<Hex> {
  console.log('Delegate Saving called with:', { user, asset, value, data });

  const walletClient = getViemWalletClientByChain(chainId);
  if (!walletClient) throw new Error('No wallet client found for chain');

  const params = [{ type: 'bytes32' }, { type: 'uint256' }];
  const encoded = encodeAbiParameters(params, [data.sourceTxHash, data.purchaseAmount]);
  console.log('encoded:', encoded);

  return walletClient.writeContract({
    address: getDelegateAddressByChain(chainId),
    abi: MMCardDelegateAbi,
    functionName: 'delegateSaving',
    args: [user, asset, value, encoded],
    chain: getViemChain(chainId),
    account,
  });
}
