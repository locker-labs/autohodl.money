import type { Address } from 'viem';
import { chains } from '@/config';
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

  for (const chain of chains) {
    const chainId = chain.id as unknown as EChainId;
    accountsMap.set(chainId, defaultAccounts);

    const mmc = MetaMaskCardAddressMap[chainId];
    if (!mmc) continue;

    const viemPublicClient = getViemPublicClientByChain(chainId);
    const usdc = getUsdcAddressByChain(chainId);

    if (mmc.International) {
      const allowanceMMIntl = await fetchAllowance({
        publicClient: viemPublicClient,
        tokenAddress: usdc,
        owner: address,
        spender: mmc.International,
      });

      if (allowanceMMIntl > BigInt(0)) {
        accountsMap.set(chainId, [SupportedAccounts.MetaMask, ...defaultAccounts]);
        continue;
      }
    }

    if (mmc.US) {
      const allowanceMMUS = await fetchAllowance({
        publicClient: viemPublicClient,
        tokenAddress: usdc,
        owner: address,
        spender: mmc.US,
      });

      if (allowanceMMUS > BigInt(0)) {
        accountsMap.set(chainId, [SupportedAccounts.MetaMask, ...defaultAccounts]);
        continue;
      }
    }
  }

  return accountsMap;
}

export { getSupportedAccounts };
