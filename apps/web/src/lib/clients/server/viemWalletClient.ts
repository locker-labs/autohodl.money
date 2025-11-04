import { createWalletClient, type Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chain } from '@/config';
import { secrets } from '@/lib/secrets';

export const account = privateKeyToAccount(secrets.privateKeyDelegate as Hex);

export const walletClient = createWalletClient({
  chain,
  transport: http(secrets.rpcUrl),
  account,
});
