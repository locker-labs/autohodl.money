import { createPublicClient, http } from 'viem';
import { chain } from '@/config';

export const viemPublicClient = createPublicClient({
  chain,
  transport: http(),
});
