import { Address, parseAbi } from 'viem';
import { 
  getViemPublicClientByChain, 
  getDelegateAddressByChain 
} from '@/lib/helpers';
import type { EChainId } from '@/lib/constants';
import type { SourceTxInfo } from '@/types/autohodl';
import { delegateSaving } from '@/lib/contract/server/delegateSaving'; 

// We only need the ERC20 ABI now!
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
]);

/**
 * Iterates through eligible users and executes savings if balance/allowance checks pass.
 */
export async function processSavingsBatch(
  users: Address[],
  tokens: Address[],
  values: bigint[],
  chainId: EChainId
) {
  const publicClient = getViemPublicClientByChain(chainId);
  const delegateAddress = getDelegateAddressByChain(chainId);

  if (!publicClient) throw new Error("No public client found for chain");

  const results = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const asset = tokens[i];
    const requiredAmount = values[i];

    try {
      console.log(`Processing savings for user ${user} with token ${asset} for amount ${requiredAmount}...`);

      const balance = await publicClient.readContract({
        address: asset,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [user],
      });

      if (balance < requiredAmount) {
        console.log(`Skipping ${user}: Insufficient balance. Has ${balance}, needs ${requiredAmount}`);
        results.push({ user, asset, status: 'skipped', reason: 'Insufficient balance' });
        continue;
      }

      const allowance = await publicClient.readContract({
        address: asset,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [user, delegateAddress], 
      });

      if (allowance < requiredAmount) {
        console.log(`Skipping ${user}: Insufficient allowance. Has ${allowance}, needs ${requiredAmount}`);
        results.push({ user, asset, status: 'skipped', reason: 'Insufficient allowance' });
        continue;
      }

      const cronData: SourceTxInfo = {
        sourceTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000', 
        purchaseAmount: requiredAmount, 
        sourceChainId: chainId,
      };

      // Step 4: Execute the transaction
      const txHash = await delegateSaving({
        user,
        asset,
        value: requiredAmount,
        data: cronData,
        chainId,
      });

      console.log(`✅ Successfully executed for ${user}. TxHash: ${txHash}`);
      results.push({ user, asset, status: 'success', txHash });

    } catch (error) {
      console.error(`❌ Failed to process savings for ${user}:`, error);
      results.push({ user, asset, status: 'error', error: String(error) });
    }
  }

  return results;
}