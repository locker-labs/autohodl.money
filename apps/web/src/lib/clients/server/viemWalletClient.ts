import { createWalletClient, type Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { viemChain as chain } from '@/config';
import { secrets } from '@/lib/secrets';

export const account = privateKeyToAccount(secrets.privateKeyExecutor as Hex);

export const walletClient = createWalletClient({
  chain,
  transport: http(secrets.rpcUrl),
  account,
});
