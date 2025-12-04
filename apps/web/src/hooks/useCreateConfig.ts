import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import type { Address, Hex } from 'viem';
import { encodeAbiParameters, parseUnits } from 'viem';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import { AUTOHODL_ADDRESS, DELEGATE, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { viemPublicClient } from '@/lib/clients/client';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { extraDataParams, type SavingsMode } from '@/types/autohodl';

type CreateConfigParams = {
  active: boolean;
  toYield: boolean;
  roundUp: number;
  savingsAddress: Address;
  mode: SavingsMode;
};

type UseCreateConfigReturn = {
  error: string | null;
  createConfig: (params: CreateConfigParams) => Promise<Hex>;
  handleCreateConfig: (params: CreateConfigParams) => Promise<void>;
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

  const createConfig = async ({ roundUp, savingsAddress, active, toYield, mode }: CreateConfigParams) => {
    if (!walletClient) throw new Error('WalletClient not initialized');

    const extraData = encodeAbiParameters(extraDataParams, [mode]);
    const args = [
      USDC_ADDRESS,
      savingsAddress as Address,
      DELEGATE,
      parseUnits(roundUp.toString(), TokenDecimalMap[USDC_ADDRESS]),
      active,
      toYield,
      extraData,
    ] as const;
    const tx = await walletClient.writeContract({
      address: AUTOHODL_ADDRESS,
      abi: AutoHodlAbi,
      functionName: 'setSavingConfig',
      args,
    });
    await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
    setRefetchFlag((flag) => !flag);
    return tx;
  };

  const handleCreateConfig = async ({ roundUp, savingsAddress, active, toYield, mode }: CreateConfigParams) => {
    if (!isConnected || !address || !walletClient) return;

    setLoading(true);
    setError(null);
    try {
      const extraData = encodeAbiParameters(extraDataParams, [mode]);

      // Ensure types for contract call
      const args = [
        USDC_ADDRESS,
        savingsAddress,
        DELEGATE,
        parseUnits(roundUp.toString(), TokenDecimalMap[USDC_ADDRESS]),
        active,
        toYield,
        extraData,
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
    createConfig,
    handleCreateConfig,
    loading,
    waitingForConfirmation,
  };
};

export type { UseCreateConfigReturn };
export default useCreateConfig;
