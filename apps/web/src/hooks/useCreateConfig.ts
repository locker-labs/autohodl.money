import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import type { Address, Hex } from 'viem';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import { AUTOHODL_ADDRESS, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { secrets } from '@/lib/secrets';
import { viemPublicClient } from '@/lib/clients/client';
import { useAutoHodl } from '@/context/AutoHodlContext';

const defaultConfig = {
  active: true,
  toYield: false,
  extraData: '0x' as Hex,
};

type UseCreateConfigReturn = {
  error: string | null;
  handleCreateConfig: (params: { roundUp: number; savingsAddress: Address }) => Promise<void>;
  loading: boolean;
  waitingForConfirmation: boolean;
};

const useCreateConfig = (): UseCreateConfigReturn => {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { setRefetchFlag } = useAutoHodl();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateConfig = async ({ roundUp, savingsAddress }: { roundUp: number; savingsAddress: Address }) => {
    if (!isConnected || !address || !walletClient) return;

    setLoading(true);
    setError(null);
    try {
      // Ensure types for contract call
      const args = [
        USDC_ADDRESS,
        savingsAddress as Address,
        secrets.delegate as Address,
        BigInt(roundUp * 10 ** TokenDecimalMap[USDC_ADDRESS]),
        defaultConfig.active,
        defaultConfig.toYield,
        defaultConfig.extraData,
      ] as const;
      const tx = await walletClient.writeContract({
        address: AUTOHODL_ADDRESS,
        abi: AutoHodlAbi,
        functionName: 'setSavingConfig',
        args,
      });

      setWaitingForConfirmation(true);
      await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      setWaitingForConfirmation(false);

      setRefetchFlag((flag) => !flag);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create config');
    } finally {
      setLoading(false);
      setWaitingForConfirmation(false);
    }
  };

  return {
    error,
    handleCreateConfig,
    loading,
    waitingForConfirmation,
  };
};

export type { UseCreateConfigReturn };
export default useCreateConfig;
