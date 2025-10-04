import type { Address, Hex } from 'viem';
import { erc20Abi } from 'viem';
import { viemPublicClient, walletClient } from './clients';

export async function transferFrom({
  account,
  tokenAddress,
  from,
  to,
  amount,
}: {
  account: any;
  tokenAddress: Address;
  from: Address;
  to: Address;
  amount: bigint;
}): Promise<Hex | undefined> {
  try {
    // Simulate the transferFrom transaction
    const { request, result } = await viemPublicClient.simulateContract({
      account,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transferFrom',
      args: [from, to, amount],
    });

    console.log('Simulation result:', result);

    // Execute the transferFrom transaction
    const txHash = await walletClient.writeContract(request);

    console.log('Transaction Hash:', txHash);

    return txHash;
  } catch (transferError) {
    console.error(
      'Error during transfer simulation or execution:',
      transferError instanceof Error ? transferError.message : transferError,
    );
  }
}
