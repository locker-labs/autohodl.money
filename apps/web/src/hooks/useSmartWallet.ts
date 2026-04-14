import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { EChainId } from '@/lib/constants';
import { getViemPublicClientByChain } from '@/lib/helpers';

/**
 * Checks if a given Ethereum address is a Smart Contract.
 */
async function isSmartWallet(
  address: Address, 
  chainId: EChainId
): Promise<boolean> {
  try {
    const client = getViemPublicClientByChain(chainId);
    const bytecode = await client.getBytecode({ address });
    return bytecode !== undefined && bytecode !== '0x';
  } catch (error) {
    console.error(`Failed to fetch bytecode for address ${address}:`, error);
    return false;
  }
}

/**
 * React Query hook to check and cache if an address is a smart wallet.
 */
export function useSmartWallet(
  address: Address | undefined, 
  chainId: EChainId | undefined
) {
  return useQuery({
    queryKey: ['isSmartWallet', address, chainId],
    
    queryFn: async () => {
      if (!address || !chainId) return false;
      return await isSmartWallet(address, chainId);
    },
    
    // Only execute the query if we have both an address and a chainId
    enabled: !!address && !!chainId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}