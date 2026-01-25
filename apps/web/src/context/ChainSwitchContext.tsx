// @ts-nocheck
'use client';

import { createContext, useContext, useState, type FC, type ReactNode } from 'react';
import { useConnection, useWalletClient } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits, zeroAddress } from 'viem';
import { switchChain } from '@wagmi/core';
import { useAutoHodl } from '@/context/AutoHodlContext';
import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, ViemChainMap, type EChainId } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import { getAutoHodlAddressByChain, getUsdcAddressByChain, getViemPublicClientByChain } from '@/lib/helpers';
import { fetchAllowance } from '@/lib/erc20/allowance';
import { toastCustom } from '@/components/ui/toast';
import type { SavingsConfig } from '@/types/autohodl';
import { config as wagmiConfig } from '@/config';
import { ChainSwitchModal, type ChainSwitchFlow, type ChainSwitchState } from '@/components/feature/ChainSwitchModal';

type ChainSwitchContextType = {
  // State
  state: ChainSwitchState;
  modalOpen: boolean;

  // Methods
  checkConfigExists: (chainId: EChainId) => Promise<{ exists: boolean; config: SavingsConfig | null }>;
  initiateChainSwitch: (targetChainId: EChainId) => Promise<ChainSwitchFlow | null>;
  executeChainSwitch: (targetChainId: EChainId, flow: ChainSwitchFlow) => Promise<void>;
  resetState: () => void;

  // Modal controls
  openModal: (targetChainId: EChainId) => Promise<void>;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
  handleModalOpenChange: (open: boolean) => void;
};

const ChainSwitchContext = createContext<ChainSwitchContextType | undefined>(undefined);

export const useChainSwitchContext = () => {
  const context = useContext(ChainSwitchContext);
  if (!context) {
    throw new Error('useChainSwitchContext must be used within a ChainSwitchProvider');
  }
  return context;
};

type Props = {
  children: ReactNode;
};

export const ChainSwitchProvider: FC<Props> = ({ children }) => {
  const { address, isConnected } = useConnection();
  const { config, setConfig, savingsChainId, setRefetchFlag } = useAutoHodl();
  const { createConfig } = useCreateConfig();
  const { data: walletClient } = useWalletClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [state, setState] = useState<ChainSwitchState>({
    step: 'idle',
    error: null,
    targetChainId: null,
    flow: null,
    needsAllowanceApproval: false,
  });

  const resetState = () => {
    setState({
      step: 'idle',
      error: null,
      targetChainId: null,
      flow: null,
      needsAllowanceApproval: false,
    });
  };

  /**
   * Check if a config exists on the target chain
   */
  const checkConfigExists = async (chainId: EChainId): Promise<{ exists: boolean; config: SavingsConfig | null }> => {
    if (!address || !isConnected) {
      return { exists: false, config: null };
    }

    try {
      const viemPublicClient = getViemPublicClientByChain(chainId);
      const usdc = getUsdcAddressByChain(chainId);
      const targetConfig = await getSavingsConfig(viemPublicClient, address, usdc, chainId);

      const exists = targetConfig && targetConfig.savingAddress !== zeroAddress;
      return { exists, config: exists ? targetConfig : null };
    } catch (error) {
      console.error('Error checking config on target chain:', error);
      return { exists: false, config: null };
    }
  };

  /**
   * Initiate chain switch - checks if config exists and returns the flow type
   */
  const initiateChainSwitch = async (targetChainId: EChainId): Promise<ChainSwitchFlow | null> => {
    if (!address || !isConnected || !config || !savingsChainId) {
      toastCustom('Please connect your wallet and set up a config first');
      return null;
    }

    if (targetChainId === savingsChainId) {
      toastCustom('You are already on this chain');
      return null;
    }

    setState((prev) => ({ ...prev, step: 'checking', error: null, targetChainId, flow: null }));

    try {
      const { exists } = await checkConfigExists(targetChainId);
      const flow: ChainSwitchFlow = exists ? 'has-config' : 'no-config';

      // Step 0: Check and add USDC allowance on destination chain if zero
      const targetUsdc = getUsdcAddressByChain(targetChainId);
      const targetAutohodl = getAutoHodlAddressByChain(targetChainId);
      const targetViemPublicClient = getViemPublicClientByChain(targetChainId);

      const currentAllowance = await fetchAllowance({
        publicClient: targetViemPublicClient,
        tokenAddress: targetUsdc,
        owner: address,
        spender: targetAutohodl,
      });

      if (currentAllowance === BigInt(0)) {
        setState((prev) => ({ ...prev, needsAllowanceApproval: true }));
        if (!walletClient) {
          throw new Error('Wallet client not initialized');
        }
      }

      setState((prev) => ({ ...prev, step: 'confirming', error: null, targetChainId, flow }));
      return flow;
    } catch (error) {
      const toastErrMsg = error instanceof Error ? error.message?.split('.')[0] : 'Failed to switch chain';
      const errMsg = error instanceof Error ? error.message : 'Failed to check target chain config';
      setState((prev) => ({ ...prev, step: 'error', error: errMsg, targetChainId, flow: null }));
      toastCustom(toastErrMsg);
      return null;
    }
  };

  /**
   * Execute the chain switch - performs the 3-step process
   */
  const executeChainSwitch = async (targetChainId: EChainId, flow: ChainSwitchFlow): Promise<void> => {
    if (!address || !isConnected || !config || !savingsChainId) {
      toastCustom('Invalid state for chain switch');
      return;
    }
    const roundUpTo = Number(formatUnits(config.roundUp, TokenDecimalMap[getUsdcAddressByChain(savingsChainId)]));

    try {
      // Step 0: Switch to the savings chain
      await switchChain(wagmiConfig, { chainId: savingsChainId });

      // Step 1: Mark current config as inactive
      setState((prev) => ({ ...prev, step: 'deactivating', error: null, targetChainId, flow }));
      if (config.active) {
        await createConfig({
          active: false,
          roundUp: roundUpTo,
          savingsAddress: config.savingAddress,
          mode: config.mode,
          toYield: config.toYield,
          savingsChainId,
        });
      }

      // Step 2: Switch to the new chain
      setState((prev) => ({ ...prev, step: 'switching', error: null, targetChainId, flow }));
      await switchChain(wagmiConfig, { chainId: targetChainId });
      //   console.log('switchChain result', res);

      // Step 2.5: Check and add USDC allowance on destination chain if zero

      if (state.needsAllowanceApproval) {
        // Set state to show approving step
        setState((prev) => ({
          ...prev,
          step: 'approving',
          error: null,
        }));

        const targetUsdc = getUsdcAddressByChain(targetChainId);
        const targetAutohodl = getAutoHodlAddressByChain(targetChainId);
        const targetViemPublicClient = getViemPublicClientByChain(targetChainId);

        // Approve 100 USDC
        const approveAmount = parseUnits('100', TokenDecimalMap[targetUsdc]);
        const approveTx = await walletClient.writeContract({
          chain: ViemChainMap[targetChainId],
          address: targetUsdc,
          abi: erc20Abi,
          functionName: 'approve',
          args: [targetAutohodl, approveAmount],
        });
        await targetViemPublicClient.waitForTransactionReceipt({ hash: approveTx, confirmations: 1 });
        setState((prev) => ({ ...prev, error: null, needsAllowanceApproval: false }));
      }

      // Step 3: Activate or create config on new chain
      setState((prev) => ({ ...prev, step: 'activating', error: null, targetChainId, flow }));

      if (flow === 'has-config') {
        // Mark existing config as active
        const { config: targetConfig } = await checkConfigExists(targetChainId);
        if (targetConfig && !targetConfig.active) {
          await createConfig({
            active: true,
            roundUp: roundUpTo,
            savingsAddress: targetConfig.savingAddress,
            mode: targetConfig.mode,
            toYield: targetConfig.toYield,
            savingsChainId: targetChainId,
          });
          setConfig((prev) =>
            prev
              ? {
                  ...prev,
                  active: true,
                  roundUp: parseUnits(roundUpTo.toString(), TokenDecimalMap[getUsdcAddressByChain(targetChainId)]),
                  savingsAddress: targetConfig.savingAddress,
                  mode: targetConfig.mode,
                  toYield: targetConfig.toYield,
                  savingsChainId: targetChainId,
                }
              : prev,
          );
        }
      } else {
        // Create new config with same settings
        await createConfig({
          active: true,
          roundUp: roundUpTo,
          savingsAddress: config.savingAddress,
          mode: config.mode,
          toYield: config.toYield,
          savingsChainId: targetChainId,
        });
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                active: true,
                roundUp: parseUnits(roundUpTo.toString(), TokenDecimalMap[getUsdcAddressByChain(targetChainId)]),
                savingsAddress: config.savingAddress,
                mode: config.mode,
                toYield: config.toYield,
                savingsChainId: targetChainId,
              }
            : prev,
        );
      }

      setState((prev) => ({ ...prev, step: 'complete', error: null, targetChainId, flow }));
      setRefetchFlag((flag) => !flag);
    } catch (error) {
      const toastErrMsg = error instanceof Error ? error.message?.split('.')[0] : 'Failed to switch chain';
      const errMsg = error instanceof Error ? error.message : 'Failed to switch chain';
      setState((prev) => ({ ...prev, step: 'error', error: errMsg, targetChainId, flow }));
      toastCustom(toastErrMsg);
    }
  };

  /**
   * Open modal and initiate chain switch
   */
  const openModal = async (targetChainId: EChainId) => {
    const flow = await initiateChainSwitch(targetChainId);
    if (flow) {
      setModalOpen(true);
    }
  };

  /**
   * Handle confirm button in modal
   */
  const handleConfirm = async () => {
    if (state.targetChainId && state.flow) {
      await executeChainSwitch(state.targetChainId, state.flow);
    }
  };

  /**
   * Handle cancel button in modal
   */
  const handleCancel = () => {
    setModalOpen(false);
    setTimeout(() => {
      resetState();
    }, 500);
  };

  /**
   * Handle modal open/close state change
   */
  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setTimeout(() => {
        resetState();
      }, 500);
    }
  };

  return (
    <ChainSwitchContext.Provider
      value={{
        state,
        modalOpen,
        checkConfigExists,
        initiateChainSwitch,
        executeChainSwitch,
        resetState,
        openModal,
        handleConfirm,
        handleCancel,
        handleModalOpenChange,
      }}
    >
      {children}
      <ChainSwitchModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        targetChainId={state.targetChainId}
        flow={state.flow}
        state={state}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ChainSwitchContext.Provider>
  );
};
