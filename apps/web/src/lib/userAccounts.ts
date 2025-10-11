import type { Address } from 'viem';
import { viemPublicClient } from '@/lib/clients/client';
import { MetaMaskCard, SupportedAccounts, USDC_ADDRESS } from '@/lib/constants';
import { fetchAllowance } from '@/lib/erc20/allowance';

async function getSupportedAccounts(address: Address) {
  // Write logic to determine supported accounts

  // For MetaMask Card
  // Check if the address has given erc20 approval to the Card contract
  const allowanceMMUSPromise = fetchAllowance({
    publicClient: viemPublicClient,
    tokenAddress: USDC_ADDRESS,
    owner: address,
    spender: MetaMaskCard.US,
  });

  const allowanceMMIntlPromise = fetchAllowance({
    publicClient: viemPublicClient,
    tokenAddress: USDC_ADDRESS,
    owner: address,
    spender: MetaMaskCard.International,
  });

  const [allowanceMMUS, allowanceMMIntl] = await Promise.all([allowanceMMUSPromise, allowanceMMIntlPromise]);

  if (allowanceMMUS > BigInt(0) || allowanceMMIntl > BigInt(0)) {
    return [SupportedAccounts.MetaMask];
  }

  return [SupportedAccounts.EOA];
}

export { getSupportedAccounts };
