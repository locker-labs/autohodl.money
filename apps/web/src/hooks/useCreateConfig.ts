import { useState } from 'react';
import { useConnection, useWalletClient } from 'wagmi';
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
  getUsdcAddressByChain,
  getViemPublicClientByChain,
} from '@/lib/helpers';
import { toastCustom } from '@/components/ui/toast';

type CreateConfigParams = {
  active: boolean;
  toYield: boolean;
  roundUp: number;
  savingsAddress: Address;
  mode: SavingsMode;
  savingsChainId: EChainId;
};

type UseCreateConfigReturn = {
  error: string | null;
  createConfig: (params: CreateConfigParams) => Promise<Hex>;
  handleCreateConfig: (params: CreateConfigParams) => Promise<void>;
  loading: boolean;
  waitingForConfirmation: boolean;
  isConfirmed: boolean;
  txHash: Hex | null;
};

const useCreateConfig = (): UseCreateConfigReturn => {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setRefetchFlag, setSavingsChainId } = useAutoHodl();
  const { address, isConnected } = useConnection();
  const { data: walletClient } = useWalletClient();

  const { trackConfigSetEvent } = useAnalytics();

  const createConfig = async ({
    roundUp,
    savingsAddress,
    active,
    toYield,
    mode,
    savingsChainId,
  }: CreateConfigParams) => {
    if (!walletClient) throw new Error('WalletClient not initialized');

    const viemPublicClient = getViemPublicClientByChain(savingsChainId);

    const [delegate, autohodl, usdc] = [
      getDelegateAddressByChain(savingsChainId),
      getAutoHodlAddressByChain(savingsChainId),
      getUsdcAddressByChain(savingsChainId),
    ];

    const extraData = encodeAbiParameters(extraDataParams, [mode]);
    const args = [
      usdc,
      savingsAddress as Address,
      delegate,
      parseUnits(roundUp.toString(), TokenDecimalMap[usdc]),
      active,
      toYield,
      extraData,
    ] as const;
    const tx = await walletClient.writeContract({
      chain: ViemChainMap[savingsChainId],
      address: autohodl,
      abi: AutoHodlAbi,
      functionName: 'setSavingConfig',
      args,
    });
    await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
    setRefetchFlag((flag) => !flag);
    setSavingsChainId(savingsChainId);
    return tx;
  };

  const handleCreateConfig = async ({
    roundUp,
    savingsAddress,
    active,
    toYield,
    mode,
    savingsChainId,
  }: CreateConfigParams) => {
    if (!isConnected || !address || !walletClient) return;

    setLoading(true);
    setError(null);
    setWaitingForConfirmation(false);
    setIsConfirmed(false);
    setTxHash(null);

    try {
      const viemPublicClient = getViemPublicClientByChain(savingsChainId);

      const [delegate, autohodl, usdc] = [
        getDelegateAddressByChain(savingsChainId),
        getAutoHodlAddressByChain(savingsChainId),
        getUsdcAddressByChain(savingsChainId),
      ];
      const extraData = encodeAbiParameters(extraDataParams, [mode]);

      // Ensure types for contract call
      const args = [
        usdc,
        savingsAddress,
        delegate,
        parseUnits(roundUp.toString(), TokenDecimalMap[usdc]),
        active,
        toYield,
        extraData,
      ] as const;
      const tx = await walletClient.writeContract({
        chain: ViemChainMap[savingsChainId],
        address: autohodl,
        abi: AutoHodlAbi,
        functionName: 'setSavingConfig',
        args,
      });

      setWaitingForConfirmation(true);
      await viemPublicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      setWaitingForConfirmation(false);
      setIsConfirmed(true);
      setTxHash(tx);

      await trackConfigSetEvent(tx);

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
    createConfig,
    handleCreateConfig,
    loading,
    waitingForConfirmation,
    isConfirmed,
    txHash,
  };
};

export type { UseCreateConfigReturn };
export default useCreateConfig;
