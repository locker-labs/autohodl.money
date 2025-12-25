import type { Address, Hex } from 'viem';
import { AutoHodlAbi } from '../../abis/AutoHodl';
import { walletClient } from '../../clients/server';
import { AUTOHODL_ADDRESS } from '../../constants';

/**
 * Executes a savings transaction on the autoHODL contract.
 * @param user The user address (must match connected wallet)
 * @param token The ERC20 token address
 * @param value The amount to transfer (in token's smallest unit, e.g. USDC 6 decimals)
 * @returns The transaction hash
 */
export async function executeSavingsTx({
  user,
  token,
  value,
}: {
  user: Address;
  token: Address;
  value: bigint;
}): Promise<Hex> {
  if (!walletClient) throw new Error('No wallet client found');
  // The connected wallet must be the delegate for this user/token
  return walletClient.writeContract({
    address: AUTOHODL_ADDRESS,
    abi: AutoHodlAbi,
    functionName: 'executeSavingsTx',
    args: [user, token, value],
  });
}
