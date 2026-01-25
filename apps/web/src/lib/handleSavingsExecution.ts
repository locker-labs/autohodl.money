import type { IERC20Transfer } from '@moralisweb3/streams-typings';
import type { Address, Hex } from 'viem';
import { getAddress, zeroAddress } from 'viem';
import { getTransactionLink } from '@/lib/blockExplorer';
import {
  ChainToMoralisStreamIdMap,
  EChainId,
  EMoralisStreamId,
  TokenDecimalMap,
  TTokenAddress,
  ViemChainNameMap,
} from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import { delegateSaving } from '@/lib/contract/server';
import { fetchAllowance } from '@/lib/erc20/allowance';
import {
  computeRoundUpAndSavings,
  isAutoHodlSupportedToken,
  getAutoHodlAddressByChain,
  getDelegateAddressByChain,
  getViemPublicClientByChain,
  isValidSourceChain,
  getUsdcAddressByChain,
} from '@/lib/helpers';
import { SavingsMode, type SavingsConfig } from '@/types/autohodl';
import { chains } from '@/config';

async function handleSavingsExecution(
  erc20Transfer: IERC20Transfer,
  { streamId, chainId }: { streamId: string; chainId: string },
): Promise<Hex | undefined> {
  const { from: _from, contract, to, transactionHash: sourceTxHash } = erc20Transfer;
  const transferAmount: bigint = BigInt(erc20Transfer.value);
  const sourceToken: Address = getAddress(contract);
  const from = _from as Address;

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

  // // Note: MMC spendable tokens include USDC, aUSDC, USDT, WETH, EURe, and GBPe on the Linea network.
  // For now, we will support only USDC savings transfers.

  // For debugging
  console.debug(JSON.stringify({ from, to, sourceToken, sourceTxHash, value: erc20Transfer.value }));

  // 1. Validate source chain id
  if (!isValidSourceChain(Number(chainId))) {
    console.warn(`Invalid source chain id: ${chainId}`);
    return;
  }
  const sourceChainId = Number(chainId) as EChainId;

  // 2. Check source token support - this step is essential to prevent fetching configs for unsupported tokens
  if (!isAutoHodlSupportedToken(sourceToken)) {
    console.warn(`Token not supported by any supported chain: ${sourceToken}`);
    return;
  }

  // 3. Find savings chain id & savings config using savings token
  let savingsConfig: SavingsConfig | null = null;
  let savingsChainId: EChainId | null = null;

  // Fetch savings config on all supported chains and pick first active config
  try {
    for (const chain of chains) {
      const chainId = chain.id as unknown as EChainId;
      const viemPublicClient = getViemPublicClientByChain(chainId);
      const savingsToken = getUsdcAddressByChain(chainId);
      const config = await getSavingsConfig(viemPublicClient, from, savingsToken, chainId);

      // 3A. Check if config is set
      if (config.delegate === zeroAddress) {
        console.warn(
          `Savings config not found for user ${from} and token ${savingsToken} on chain ${ViemChainNameMap[chainId]}`,
        );
        continue;
      }

      // 3B. Check if config is active
      if (!config.active) {
        console.warn(
          `Savings config is not active for user ${from} and token ${savingsToken} on chain ${ViemChainNameMap[chainId]}`,
        );
        continue;
      }

      // 3C. Set savings config
      savingsConfig = config;
      savingsChainId = chainId;
      break;
    }
  } catch (configError) {
    console.error('Error fetching savings config:', configError instanceof Error ? configError.message : configError);
    // TODO: Notify dev team
    throw configError;
  }

  if (!savingsConfig || !savingsChainId) {
    console.warn(`No active savings config found for user ${from}`, 'Aborting execution.');
    return;
  }

  console.log('SAVINGS CHAIN ID:', savingsChainId);
  console.log('SAVINGS CONFIG:', savingsConfig);

  // 4. Get savings token (TODO: support multiple savings tokens?)
  const savingsToken = getUsdcAddressByChain(savingsChainId);

  // 5. Check config mode, and validate with streamId
  const streamIds = ChainToMoralisStreamIdMap[sourceChainId];

  // 5A. Check if config mode is MetaMask Card
  if (savingsConfig.mode === SavingsMode.MetamaskCard && streamId !== streamIds[EMoralisStreamId.MmcWithdrawal]) {
    console.warn(
      `Transfer streamId ${streamId} does not match MMC Withdrawal streamId ${streamIds[EMoralisStreamId.MmcWithdrawal]} for MetaMask Card mode.`,
      'Aborting execution.',
    );
    return;
  }

  // 5B. Check if config mode is All Transfers
  if (savingsConfig.mode === SavingsMode.All && streamId !== streamIds[EMoralisStreamId.EoaTransfer]) {
    console.warn(
      `Transfer streamId ${streamId} does not match EOA Transfer streamId ${streamIds[EMoralisStreamId.EoaTransfer]} for All Transfers mode.`,
      'Aborting execution.',
    );
    return;
  }

  const [delegate, autohodl, viemPublicClient] = [
    getDelegateAddressByChain(savingsChainId),
    getAutoHodlAddressByChain(savingsChainId),
    getViemPublicClientByChain(savingsChainId),
  ];

  // 6. Check config yield settings

  // 6A. If toYield = true, and to = AUTOHODL_ADDRESS, skip execution
  if (savingsConfig.toYield === true && getAddress(to) === getAddress(autohodl)) {
    console.warn(
      'This is a savings tx.',
      `toYield = true and to = autoHODL for user ${from} and savingsToken ${savingsToken}`,
      'Aborting execution.',
    );
    return;
  }

  // 6B. If toYield = false, and to = savingsAddress, skip execution
  if (savingsConfig.toYield === false && getAddress(to) === getAddress(savingsConfig.savingAddress)) {
    console.warn(
      'This is a savings tx.',
      `toYield = false and to = Savings address for user ${from} and savingsToken ${savingsToken}`,
      'Aborting execution.',
    );
    return;
  }

  // 7. Verify delegate
  if (getAddress(savingsConfig.delegate) !== getAddress(delegate)) {
    console.warn(
      `Delegate mismatch in savings config for user ${from} and savingsToken ${savingsToken}`,
      `Expected: ${delegate}, Found: ${savingsConfig.delegate}`,
      'Aborting execution.',
    );
    // TODO: Notify dev team
    throw new Error(
      `Delegate mismatch in savings config for user ${from} and savingsToken ${savingsToken} ` +
        `Expected: ${delegate}, Found: ${savingsConfig.delegate}`,
    );
  }

  // 8. Check approval amount for the autohodl contract from user's address
  let allowance: bigint;
  try {
    allowance = await fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: savingsToken,
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

  const savingsTokenDecimals = TokenDecimalMap[getUsdcAddressByChain(savingsChainId)];
  const sourceTokenDecimals = TokenDecimalMap[sourceToken as TTokenAddress];
  console.log('transferAmount', transferAmount);
  const normalizedTransferAmount =
    (transferAmount * BigInt(10 ** savingsTokenDecimals)) / BigInt(10 ** sourceTokenDecimals);

  // 9. Calculate amount for savings tx
  const roundUpTo: bigint = savingsConfig.roundUp;
  console.log('TRANSFER AMOUNT:', normalizedTransferAmount);
  console.log('ROUNDUP TO:', roundUpTo);
  const savingsAmount: bigint = computeRoundUpAndSavings(normalizedTransferAmount, roundUpTo).savingsAmount;
  console.log('SAVINGS AMOUNT:', savingsAmount);

  // 10. Check if allowance is sufficient
  if (allowance < savingsAmount) {
    console.warn(`Insufficient allowance. Current allowance: ${allowance}, Required: ${savingsAmount}`);
    // TODO: notify user when allowance is insufficient
    return;
  }

  // TODO: 11. Check balance before executing savings tx

  // 12. Call the delegateSaving fn of the SC.
  try {
    const txHash = await delegateSaving({
      user: from as Address,
      asset: savingsToken,
      value: savingsAmount,
      data: { sourceTxHash: sourceTxHash as Hex, purchaseAmount: transferAmount, sourceChainId },
      chainId: savingsChainId,
    });

    console.log('SAVINGS TX:', getTransactionLink(txHash, savingsChainId));
    return txHash;
  } catch (executionError) {
    console.error(
      'Error executing savings transaction:',
      executionError instanceof Error ? executionError.message : executionError,
    );
  }
}

export { handleSavingsExecution };
