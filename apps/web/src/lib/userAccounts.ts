import type { Address } from 'viem';
import { viemChains } from '@/config';
import { type EChainId, MetaMaskCardAddressMap, SupportedAccounts } from '@/lib/constants';
import { fetchAllowance } from '@/lib/erc20/allowance';
import { getUsdcAddressByChain, getViemPublicClientByChain } from '@/lib/helpers';

const defaultAccounts: SupportedAccounts[] = [SupportedAccounts.EOA];

async function getSupportedAccounts(address: Address | undefined): Promise<Map<EChainId, SupportedAccounts[]>> {
  if (!address) throw new Error('Address is required');

  const accountsMap = new Map<EChainId, SupportedAccounts[]>();

  // For multichain support, check allowance on all supported chains.

  // Write logic to determine supported accounts

  // For MetaMask Card
  // Check if the address has given erc20 approval to the Card contract

  for (const chain of viemChains) {
    const chainId = chain.id as unknown as EChainId;
    accountsMap.set(chainId, defaultAccounts);

    const mmc = MetaMaskCardAddressMap[chainId];
    if (!mmc) continue;

    const viemPublicClient = getViemPublicClientByChain(chainId);
    const usdc = getUsdcAddressByChain(chainId);

    const allowanceMMUSPromise = fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: usdc,
      owner: address,
      spender: mmc.International,
    });

    const allowanceMMIntlPromise = fetchAllowance({
      publicClient: viemPublicClient,
      tokenAddress: usdc,
      owner: address,
      spender: mmc.US,
    });

    const [allowanceMMUS, allowanceMMIntl] = await Promise.all([allowanceMMUSPromise, allowanceMMIntlPromise]);

    if (allowanceMMUS > BigInt(0) || allowanceMMIntl > BigInt(0)) {
      accountsMap.set(chainId, [SupportedAccounts.MetaMask, ...defaultAccounts]);
    }
    // else if (chainId === EChainId.Linea) {
    //   accountsMap.set(chainId, [SupportedAccounts.MetaMask, ...defaultAccounts]);
    // }
  }

  return accountsMap;
}

export { getSupportedAccounts };
