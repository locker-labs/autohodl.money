import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import { parseSavingsConfig, type SavingsConfigArray } from '@/types/autohodl';
import type { Hex, Address } from 'viem';
import { AUTOHODL_ADDRESS, DELEGATE, MMC_TOKENS, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { fetchAllowance } from '@/lib/erc20/allowance';
import { executeSavingsTx } from './contract/server/executeSavingsTx';
import { getSavingsConfigArray } from './contract/server/getSavingsConfig';
import { chain } from '@/config';
import { viemPublicClient } from '@/lib/clients/server';
import { secrets } from '@/lib/secrets';
import { getTransactionLink } from './blockExplorer';

export async function handleSavingsExecution(erc20Transfer: IERC20Transfer): Promise<Hex | undefined> {
  const { from: fromTransfer, contract: tokenAddress } = erc20Transfer;
  const transferAmount: bigint = BigInt(erc20Transfer.value);

  // Since we dont have access to metamask card,
  // we will hardcode the from address for savings transfers.
  let from: Address;
  if (secrets.savingsFrom) {
    from = secrets.savingsFrom as Address;
  } else {
    from = fromTransfer as Address;
  }

  // For debugging
  console.debug(JSON.stringify({ from, DELEGATE, tokenAddress }));

  // // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // // For now, we will support only USDC savings transfers.
  // if (tokenAddress.toLowerCase() !== MMC_TOKENS[0].toLowerCase()) {
  //   console.warn('Only USDC is supported for now. Unsupported token:', tokenAddress);
  //   return;
  // }

  // Use USDC address for Sepolia, MMC_TOKENS[0] for Linea
  const savingsToken: Address = chain.id === 11155111 ? USDC_ADDRESS : MMC_TOKENS[0];

  // Fetch savings config for user and token (to verify delegate is set correctly)
  let savingsConfig: Readonly<SavingsConfigArray>;
  try {
    savingsConfig = await getSavingsConfigArray(from as Address, savingsToken);
    console.log('CONFIG:', JSON.stringify(parseSavingsConfig(savingsConfig)));
  } catch (configError) {
    console.error('Error fetching savings config:', configError instanceof Error ? configError.message : configError);
    return;
  }

  // Check if config is set
  if (savingsConfig[0] === '0x0000000000000000000000000000000000000000') {
    console.warn(`Savings config is not set for user ${from} and token ${savingsToken}. Aborting execution.`);
    return;
  }

  // Check if config is active
  if (!savingsConfig[3]) {
    console.warn(`Savings config is not active for user ${from} and token ${savingsToken}. Aborting execution.`);
    return;
  }

  // Check if delegate is set
  if (savingsConfig[1].toLowerCase() !== DELEGATE.toLowerCase()) {
    console.warn(
      `Delegate mismatch in savings config. Expected: ${DELEGATE}, Found: ${savingsConfig[1]}. Aborting execution.`,
    );
    return;
  }

  // Check approval amount for the autohodl contract from user's address
  let allowance: bigint;
  try {
    allowance = await fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: savingsToken,
      owner: from as Address,
      spender: AUTOHODL_ADDRESS,
    });
    console.log('ALLOWANCE:', allowance);
  } catch (allowanceError) {
    console.error(
      'Error fetching allowance:',
      allowanceError instanceof Error ? allowanceError.message : allowanceError,
    );
    return;
  }

  // Calculate amount for savings tx
  // Assuming roundUp is BigInt(10**18) for $1
  const roundUpAmount: bigint = (savingsConfig[2] / BigInt(10 ** 18)) * BigInt(10 ** TokenDecimalMap[savingsToken]);
  console.log('TRANSFER AMOUNT:', transferAmount);
  console.log('ROUNDUP AMOUNT:', roundUpAmount);
  const savingsAmount: bigint = computeRoundUpAndSavings(transferAmount, roundUpAmount).savingsAmount;
  console.log('SAVINGS AMOUNT:', savingsAmount);

  // Check if allowance is sufficient
  if (allowance < savingsAmount) {
    console.warn(`Insufficient allowance. Current allowance: ${allowance}, Required: ${savingsAmount}`);
    // TODO: add a user notification when allowance is less
    return;
  }

  // Call the executeSavings fn of the SC.
  try {
    const txHash = await executeSavingsTx({
      user: from as Address,
      token: savingsToken,
      value: savingsAmount,
    });

    console.log('SAVINGS TX:', getTransactionLink(txHash));
    return txHash;
  } catch (executionError) {
    console.error(
      'Error executing savings transaction:',
      executionError instanceof Error ? executionError.message : executionError,
    );
  }
}

export function computeRoundUpAndSavings(
  transferAmount: bigint,
  roundUpTo: bigint,
): { roundUpAmount: bigint; savingsAmount: bigint } {
  if (roundUpTo <= BigInt(0)) {
    throw new Error('roundUpTo must be > 0');
  }
  // Equivalent to: ((transferAmount + roundUpTo - 1) / roundUpTo) * roundUpTo
  const roundUpAmount = ((transferAmount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;

  const savingsAmount = roundUpAmount - transferAmount;

  return { roundUpAmount, savingsAmount };
}
