import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import type { Address, Hex } from 'viem';
import { getAddress, zeroAddress } from 'viem';
import { getTransactionLink } from '@/lib/blockExplorer';
import { type EChainId, MoralisStreamId } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import { delegateSaving } from '@/lib/contract/server';
import { fetchAllowance } from '@/lib/erc20/allowance';
import {
  computeRoundUpAndSavings,
  isAutoHodlSupportedToken,
  getAutoHodlAddressByChain,
  getDelegateAddressByChain,
  getAutoHodlSupportedTokens,
  getViemPublicClientByChain,
} from '@/lib/helpers';
import { SavingsMode, type SavingsConfig } from '@/types/autohodl';

async function handleSavingsExecution(
  erc20Transfer: IERC20Transfer,
  { streamId, chainId }: { streamId: string; chainId: string },
): Promise<Hex | undefined> {
  const { from: _from, contract, to, transactionHash: sourceTxHash } = erc20Transfer;
  const transferAmount: bigint = BigInt(erc20Transfer.value);
  const token: Address = getAddress(contract);
  const from = _from as Address;

  const savingsChainId = Number(chainId) as EChainId;

  const [delegate, autohodl, autohodlTokens, viemPublicClient] = [
    getDelegateAddressByChain(savingsChainId),
    getAutoHodlAddressByChain(savingsChainId),
    getAutoHodlSupportedTokens(savingsChainId),
    getViemPublicClientByChain(savingsChainId),
  ];

  // Since we dont have access to metamask card,
  // we can hardcode the `from` address for savings transfers.
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
  console.debug(JSON.stringify({ from, to, token, sourceTxHash, value: erc20Transfer.value, delegate }));

  // // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // For now, we will support only USDC savings transfers.
  // Check token support
  if (!isAutoHodlSupportedToken(token, savingsChainId)) {
    console.warn(`Token not supported for savings execution: ${token} Supported tokens: ${autohodlTokens}`);
    return;
  }

  // Fetch savings config
  let savingsConfig: SavingsConfig;
  try {
    savingsConfig = await getSavingsConfig(viemPublicClient, from, token, savingsChainId);
    console.log('CONFIG:', savingsConfig);
  } catch (configError) {
    console.error('Error fetching savings config:', configError instanceof Error ? configError.message : configError);
    // TODO: Notify dev team
    throw configError;
  }

  // Check if config is set
  if (savingsConfig.delegate === zeroAddress) {
    console.warn(`Savings config not found for user ${from} and token ${token}`, 'Aborting execution.');
    return;
  }

  // check mode, and validate with streamId
  if (savingsConfig.mode === SavingsMode.MetamaskCard && streamId !== MoralisStreamId.MmcWithdrawal) {
    console.warn(
      `Transfer streamId ${streamId} does not match MMC Withdrawal streamId ${MoralisStreamId.MmcWithdrawal} for MetaMask Card mode.`,
      'Aborting execution.',
    );
    return;
  }

  if (savingsConfig.mode === SavingsMode.All && streamId !== MoralisStreamId.EoaTransfer) {
    console.warn(
      `Transfer streamId ${streamId} does not match EOA Transfer streamId ${MoralisStreamId.EoaTransfer} for All Transfers mode.`,
      'Aborting execution.',
    );
    return;
  }

  // Check if config is active
  if (!savingsConfig.active) {
    console.warn(`Savings config is not active for user ${from} and token ${token}`, 'Aborting execution.');
    return;
  }

  // If toYield = true, and to = AUTOHODL_ADDRESS, skip execution
  if (savingsConfig.toYield === true && getAddress(to) === getAddress(autohodl)) {
    console.warn(
      'This is a savings tx.',
      `toYield = true and to = autoHODL for user ${from} and token ${token}`,
      'Aborting execution.',
    );
    return;
  }

  // If toYield = false, and to = savingsAddress, skip execution
  if (savingsConfig.toYield === false && getAddress(to) === getAddress(savingsConfig.savingAddress)) {
    console.warn(
      'This is a savings tx.',
      `toYield = false and to = Savings address for user ${from} and token ${token}`,
      'Aborting execution.',
    );
    return;
  }

  // Verify delegate
  if (getAddress(savingsConfig.delegate) !== getAddress(delegate)) {
    console.warn(
      `Delegate mismatch in savings config for user ${from} and token ${token}`,
      `Expected: ${delegate}, Found: ${savingsConfig.delegate}`,
      'Aborting execution.',
    );
    // TODO: Notify dev team
    throw new Error(
      `Delegate mismatch in savings config for user ${from} and token ${token} ` +
        `Expected: ${delegate}, Found: ${savingsConfig.delegate}`,
    );
  }

  // Check approval amount for the autohodl contract from user's address
  let allowance: bigint;
  try {
    allowance = await fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: token,
      owner: from as Address,
      spender: autohodl,
    });
    console.log('ALLOWANCE:', allowance);
  } catch (allowanceError) {
    console.error(
      'Error fetching allowance:',
      allowanceError instanceof Error ? allowanceError.message : allowanceError,
    );
    // TODO: Notify dev team
    throw allowanceError;
  }

  // Calculate amount for savings tx
  const roundUpTo: bigint = savingsConfig.roundUp;
  console.log('TRANSFER AMOUNT:', transferAmount);
  console.log('ROUNDUP TO:', roundUpTo);
  const savingsAmount: bigint = computeRoundUpAndSavings(transferAmount, roundUpTo).savingsAmount;
  console.log('SAVINGS AMOUNT:', savingsAmount);

  // Check if allowance is sufficient
  if (allowance < savingsAmount) {
    console.warn(`Insufficient allowance. Current allowance: ${allowance}, Required: ${savingsAmount}`);
    // TODO: notify user when allowance is insufficient
    return;
  }

  // Call the delegateSaving fn of the SC.
  try {
    const txHash = await delegateSaving({
      user: from as Address,
      asset: token,
      value: savingsAmount,
      data: { sourceTxHash: sourceTxHash as Hex, purchaseAmount: transferAmount },
      chainId: savingsChainId,
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

export { handleSavingsExecution };
