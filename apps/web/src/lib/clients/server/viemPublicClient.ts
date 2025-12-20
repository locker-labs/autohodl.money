import { createPublicClient, http } from 'viem';
import { viemChain as chain } from '@/config';
import { secrets } from '@/lib/secrets';

export const viemPublicClient = createPublicClient({
  chain,
  transport: http(secrets.rpcUrl),
});
