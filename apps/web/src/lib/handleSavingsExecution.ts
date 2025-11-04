import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import type { Address, Hex } from 'viem';
import { getAddress, zeroAddress } from 'viem';
import { getTransactionLink } from '@/lib/blockExplorer';
import { AUTOHODL_ADDRESS, AUTOHODL_SUPPORTED_TOKENS, DELEGATE, TokenDecimalMap } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/contract/getSavingsConfig';
import { delegateSaving } from '@/lib/contract/server';
import { viemPublicClient } from '@/lib/clients/server';
import { fetchAllowance } from '@/lib/erc20/allowance';
import type { SavingsConfig } from '@/types/autohodl';

export async function handleSavingsExecution(erc20Transfer: IERC20Transfer): Promise<Hex | undefined> {
  const { from: fromTransfer, contract, to, transactionHash: sourceTxHash } = erc20Transfer;
  const transferAmount: bigint = BigInt(erc20Transfer.value);
  const token: Address = getAddress(contract);
  const from = fromTransfer as Address;

  // Since we dont have access to metamask card,
  // we will hardcode the from address for savings transfers.
  // TODO: remove hardcoded from address
  // NOTE: Uncomment below for testing metamask card savings transfers

  /**
  let from: Address;
  if (secrets.savingsFrom) {
    from = secrets.savingsFrom as Address;
  } else {
    from = fromTransfer as Address;
  }
  */

  // For debugging
  console.debug(JSON.stringify({ from, fromTransfer, to, token, sourceTxHash, value: erc20Transfer.value, DELEGATE }));

  // // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // For now, we will support only USDC savings transfers.
  let isTokenSupported = false;
  for (const supportedToken of AUTOHODL_SUPPORTED_TOKENS) {
    if (getAddress(supportedToken) === token) {
      isTokenSupported = true;
      break;
    }
  }
  if (!isTokenSupported) {
    console.warn('Token not supported for savings execution:', token);
    return;
  }

  // Fetch savings config for user and token (to verify delegate is set correctly)
  let savingsConfig: SavingsConfig;
  try {
    savingsConfig = await getSavingsConfig(viemPublicClient, from as Address, token);
    console.log('CONFIG:', savingsConfig);
  } catch (configError) {
    console.error('Error fetching savings config:', configError instanceof Error ? configError.message : configError);
    return;
  }

  // Check if config is set
  if (savingsConfig.delegate === zeroAddress) {
    console.warn(`Savings config is not set for user ${from} and token ${token}.`, 'Aborting execution.');
    return;
  }

  // Check if config is active
  if (!savingsConfig.active) {
    console.warn(`Savings config is not active for user ${from} and token ${token}.`, 'Aborting execution.');
    return;
  }

  // If toYield = true, and to = AUTOHODL_ADDRESS, skip execution
  if (savingsConfig.toYield === true && getAddress(to) === getAddress(AUTOHODL_ADDRESS)) {
    console.warn(
      'This is a savings tx.',
      `toYield = true and to = AutoHodl for user ${from} and token ${token}.`,
      'Aborting execution.',
    );
    return;
  }

  // If toYield = false, and to = savingsAddress, skip execution
  if (savingsConfig.toYield === false && getAddress(to) === getAddress(savingsConfig.savingAddress)) {
    console.warn(
      'This is a savings tx.',
      `toYield = false and to = Savings address for user ${from} and token ${token}.`,
      'Aborting execution.',
    );
    return;
  }

  // Check if delegate is set
  if (getAddress(savingsConfig.delegate) !== getAddress(DELEGATE)) {
    console.warn(
      'Delegate mismatch in savings config.',
      `Expected: ${DELEGATE}, Found: ${savingsConfig.delegate}.`,
      'Aborting execution.',
    );
    return;
  }

  // Check approval amount for the autohodl contract from user's address
  let allowance: bigint;
  try {
    allowance = await fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: token,
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
  const roundUpAmount: bigint = (savingsConfig.roundUp / BigInt(10 ** 18)) * BigInt(10 ** TokenDecimalMap[token]);
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

  // Call the delegateSaving fn of the SC.
  try {
    const txHash = await delegateSaving({
      user: from as Address,
      asset: token,
      value: savingsAmount,
      data: { sourceTxHash: sourceTxHash as Hex, purchaseAmount: transferAmount },
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
