import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import type { SavingsConfigArray } from '@/types/autohodl';
import type { Hex, Address } from 'viem';
import { AUTOHODL_ADDRESS, DELEGATE, MMC_TOKENS, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { fetchAllowance } from '@/lib/helpers';
import { executeSavingsTx } from './contract/server/executeSavingsTx';
import { getSavingsConfigArray } from './contract/server/getSavingsConfig';
import { chain } from '@/config';

export async function handleSavingsExecution(erc20Transfer: IERC20Transfer): Promise<Hex | undefined> {
  const { from, contract: tokenAddress, value: transferAmount } = erc20Transfer;

  // For debugging
  console.debug(JSON.stringify({ from, DELEGATE, tokenAddress }));

  // TODO: Check if the from address is an autohodl user (check savings config)
  // for now, assume all transfers are from autohodl users
  const isAutohodlUser = true;

  if (!isAutohodlUser) {
    console.log(`${from} is not an autohodl user, ignoring.`);
    return;
  }

  // // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // // For now, we will support only USDC savings transfers.
  // if (tokenAddress.toLowerCase() !== MMC_TOKENS[0].toLowerCase()) {
  //   console.warn('Only USDC is supported for now. Unsupported token:', tokenAddress);
  //   return;
  // }

  // Check the current approval amount for the delegate from user's address
  let allowance: bigint;

  // Use USDC address for Sepolia, MMC_TOKENS[0] for Linea
  const savingsToken: Address = chain.id === 11155111 ? USDC_ADDRESS : (tokenAddress as Address);

  try {
    allowance = await fetchAllowance({
      tokenAddress: savingsToken,
      owner: from as Address,
      spender: AUTOHODL_ADDRESS,
    });
  } catch (allowanceError) {
    console.error(
      'Error fetching allowance:',
      allowanceError instanceof Error ? allowanceError.message : allowanceError,
    );
    return;
  }

  // Fetch savings config for user and token (to verify delegate is set correctly)
  let savingsConfig: Readonly<SavingsConfigArray>;
  try {
    savingsConfig = await getSavingsConfigArray(from as Address, savingsToken);
  } catch (configError) {
    console.error('Error fetching savings config:', configError instanceof Error ? configError.message : configError);
    return;
  }
  const roundUpAmount = savingsConfig[2];
  const savingsAmountBigInt = computeRoundUpAndSavings(BigInt(transferAmount), roundUpAmount).savingsAmount;
  if (allowance < savingsAmountBigInt) {
    console.warn(`Insufficient allowance. Current allowance: ${allowance}, Required: ${savingsAmountBigInt}`);
    // TODO: add a user notification when allowance is less
    return;
  }

  // Check if config is active
  if (!savingsConfig[3]) {
    console.warn(`Savings config is not active for user ${from} and token ${savingsToken}. Aborting execution.`);
    return;
  }

  // Check if delegate is set correctly in the config
  if (savingsConfig[1].toLowerCase() !== DELEGATE.toLowerCase()) {
    console.warn(
      `Delegate mismatch in savings config. Expected: ${DELEGATE}, Found: ${savingsConfig[1]}. Aborting execution.`,
    );
    return;
  }


  // Call the executeSavings fn of the SC.
  try {
    const txHash = await executeSavingsTx({
      user: from as Address,
      token: savingsToken,
      value: savingsAmountBigInt,
    });
    console.log('Savings transaction executed:', txHash);
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
  roundUpTo: bigint
): { roundUpAmount: bigint; savingsAmount: bigint } {
  if (roundUpTo <= BigInt(0)) {
    throw new Error("roundUpTo must be > 0");
  }
  // Equivalent to: ((transferAmount + roundUpTo - 1) / roundUpTo) * roundUpTo
  const roundUpAmount =
    ((transferAmount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;

  const savingsAmount = roundUpAmount - transferAmount;

  return { roundUpAmount, savingsAmount };
}