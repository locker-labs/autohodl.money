import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import { erc20Abi, type Hex, type Address } from 'viem';
import { viemPublicClient, walletClient, account } from '@/lib/clients';
import { DELEGATE, MMC_TOKENS, TokenDecimalMap } from '@/lib/constants';
import { fetchAllowance } from '@/lib/helpers';
import { secrets } from './secrets';

export async function processSavingsTransfer(erc20Transfer: IERC20Transfer): Promise<Hex | undefined> {
  const { from: fromTransfer, contract: tokenAddress } = erc20Transfer;

  let from: Address;
  if (secrets.savingsFrom) {
    from = secrets.savingsFrom as Address;
  } else {
    from = fromTransfer as Address;
  }

  // For debugging
  console.debug(JSON.stringify({ fromTransfer, from, DELEGATE, tokenAddress }));

  // TODO: Check if the from address is an autohodl user (check savings config)
  // for now, assume all transfers are from autohodl users
  const isAutohodlUser = true;

  if (!isAutohodlUser) {
    console.log(`${from} is not an autohodl user, ignoring.`);
    return;
  }

  // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // For now, we will support only USDC savings transfers.
  if (tokenAddress.toLowerCase() !== MMC_TOKENS[0].toLowerCase()) {
    console.warn('Only USDC is supported for now. Unsupported token:', tokenAddress);
    return;
  }

  // TODO: calculate the savings amount based on user's config
  // for now: hardcode to 0.01 USDC
  const savingsAmountBigInt = BigInt(0.01 * 10 ** TokenDecimalMap[MMC_TOKENS[0] as Address]); // in smallest unit (e.g., 0.01 USDC = 1,000,000 wei)

  // Check the current approval amount for the delegate from user's address
  let allowance: bigint;
  try {
    allowance = await fetchAllowance({
      tokenAddress: tokenAddress as Address,
      from: from as Address,
      to: DELEGATE as Address,
    });
  } catch (allowanceError) {
    console.error(
      'Error fetching allowance:',
      allowanceError instanceof Error ? allowanceError.message : allowanceError,
    );
    return;
  }

  if (allowance < savingsAmountBigInt) {
    console.warn(`Insufficient allowance. Current allowance: ${allowance}, Required: ${savingsAmountBigInt}`);
    // TODO: add a user notification when allowance is less
    return;
  }

  // TODO: Call the executeSavings fn of the SC.
  // for now, Execute the transferFrom transaction using an EOA (delegate)
  try {
    // Simulate the transferFrom transaction
    const { request, result } = await viemPublicClient.simulateContract({
      account,
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'transferFrom',
      args: [from as Address, DELEGATE as Address, savingsAmountBigInt],
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
