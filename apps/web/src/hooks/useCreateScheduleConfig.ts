import { useState } from 'react';
import { useConnection, useSwitchChain, useWalletClient } from 'wagmi';
import type { Address, Hex } from 'viem';
import { encodeAbiParameters, parseUnits } from 'viem';
import { AutoHodlAbi } from '@/lib/abis/AutoHodl';
import { type EChainId, TokenDecimalMap, ViemChainMap } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { extraDataParams, type SavingsMode } from '@/types/autohodl';
import { useAnalytics } from './useAnalytics';
import {
  getAutoHodlAddressByChain,
  getDelegateAddressByChain,
  getScheduleAutoHodlAddressByChain,
  getUsdcAddressByChain,
  getViemPublicClientByChain,
} from '@/lib/helpers';
import { toastCustom } from '@/components/ui/toast';
import { ScheduleHodlAbi } from '@/lib/abis/ScheduleHodl';

type CreateScheduleConfigParams = {
  active: boolean;
  toYield: boolean;
  scheduleAmount: number;
  cycle: bigint;
  savingsAddress: Address;
  mode: SavingsMode;
  savingsChainId: EChainId;
};

type UseCreateScheduleConfigReturn = {
  error: string | null;
  createScheduleConfig: (params: CreateScheduleConfigParams) => Promise<Hex>;
  handleCreateScheduleConfig: (params: CreateScheduleConfigParams) => Promise<void>;
  loading: boolean;
  waitingForConfirmation: boolean;
  isConfirmed: boolean;
  txHash: Hex | null;
};

const useCreateScheduleConfig = () : UseCreateScheduleConfigReturn => {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setRefetchFlag, setSavingsChainId } = useAutoHodl();
  const { address, isConnected } = useConnection();
  const { data: walletClient } = useWalletClient();
  const switchChain = useSwitchChain();

  const createScheduleConfig = async ({
    scheduleAmount,
    cycle,
    savingsAddress,
    active,
    toYield,
    mode,
    savingsChainId,
  }: CreateScheduleConfigParams) => {
      console.log("Creating schedule config with params:", {
        scheduleAmount,
        cycle,
        savingsAddress,
        active,
        toYield,
        mode,
        savingsChainId,
      });
    if (!walletClient) throw new Error('WalletClient not initialized');
    await switchChain.mutateAsync({ chainId: savingsChainId });
    if (!walletClient) throw new Error('WalletClient not initialized');
    await switchChain.mutateAsync({ chainId: savingsChainId });

    const viemPublicClient = getViemPublicClientByChain(savingsChainId);

    const [delegate, scheduleAutohodl, usdc] = [
      getDelegateAddressByChain(savingsChainId),
      getScheduleAutoHodlAddressByChain(savingsChainId),
      getUsdcAddressByChain(savingsChainId),
    ];

    const extraData = encodeAbiParameters(extraDataParams, [mode]);
    const args = [
      usdc,
      savingsAddress as Address,
      delegate,
      parseUnits(scheduleAmount.toString(), TokenDecimalMap[usdc]),
      cycle,
      active,
      toYield,
      extraData,
    ] as const;
    const tx = await walletClient.writeContract({
      chain: ViemChainMap[savingsChainId],
      address: scheduleAutohodl,
      abi: ScheduleHodlAbi,
      functionName: 'setSavingConfig',
      args,
    });
    await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
    setRefetchFlag((flag) => !flag);
    setSavingsChainId(savingsChainId);
    return tx;
  };

  const handleCreateScheduleConfig = async ({
    scheduleAmount,
    cycle,
    savingsAddress,
    active,
    toYield,
    mode,
    savingsChainId,
  }: CreateScheduleConfigParams) => {
    if (!isConnected || !address || !walletClient) return;

    setLoading(true);
    setError(null);
    setWaitingForConfirmation(false);
    setIsConfirmed(false);
    setTxHash(null);

    try {
      await switchChain.mutateAsync({ chainId: savingsChainId });
      const viemPublicClient = getViemPublicClientByChain(savingsChainId);

      const [delegate, scheduleAutohodl, usdc] = [
        getDelegateAddressByChain(savingsChainId),
        getScheduleAutoHodlAddressByChain(savingsChainId),
        getUsdcAddressByChain(savingsChainId),
      ];
      const extraData = encodeAbiParameters(extraDataParams, [mode]);

      // Ensure types for contract call
      const args = [
        usdc,
        savingsAddress,
        delegate,
        parseUnits(scheduleAmount.toString(), TokenDecimalMap[usdc]),
        cycle,
        active,
        toYield,
        extraData,
      ] as const;

      const tx = await walletClient.writeContract({
        chain: ViemChainMap[savingsChainId],
        address: scheduleAutohodl,
        abi: ScheduleHodlAbi,
        functionName: 'setSavingConfig',
        args,
      });

      setWaitingForConfirmation(true);
      await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      setWaitingForConfirmation(false);
      setIsConfirmed(true);
      setTxHash(tx);

      setRefetchFlag((flag) => !flag);
      setSavingsChainId(savingsChainId);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to create config';
      console.error(errMsg);
      toastCustom(errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
      setWaitingForConfirmation(false);
    }
  };

  return {
    error,
    createScheduleConfig,
    handleCreateScheduleConfig,
    loading,
    waitingForConfirmation,
    isConfirmed,
    txHash,
  };
}

export default useCreateScheduleConfig;
export type { UseCreateScheduleConfigReturn, CreateScheduleConfigParams };