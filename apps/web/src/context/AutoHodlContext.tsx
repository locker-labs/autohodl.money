'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useConnection, useSwitchChain } from 'wagmi';
import { useERC20BalanceOf, type UseERC20BalanceOfReturn } from '@/hooks/useERC20Token';
import { type EChainId, mockDefaultChainId, type SupportedAccounts } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import type { SavingsConfig } from '@/types/autohodl';
import type { FC, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupportedAccounts } from '@/lib/userAccounts';
import { type Address, zeroAddress } from 'viem';
import { chains } from '@/config';
import { getSusdcAddressByChain, getUsdcAddressByChain, getViemPublicClientByChain } from '@/lib/helpers';

type AutoHodlContextType = {
  loading: boolean;
  config: SavingsConfig | null;
  setConfig: React.Dispatch<React.SetStateAction<SavingsConfig | null>>;
  setRefetchFlag: React.Dispatch<React.SetStateAction<boolean>>;
  accountsMap?: Map<EChainId, SupportedAccounts[]>;
  accounts: SupportedAccounts[];
  sToken: UseERC20BalanceOfReturn;
  token: UseERC20BalanceOfReturn;
  address: Address | undefined;
  isConnected: boolean;
  savingsChainId: EChainId | null;
  setSavingsChainId: React.Dispatch<React.SetStateAction<EChainId | null>>;
  switchChain: (chainId: EChainId) => Promise<void>;
};

const AutoHodlContext = createContext<AutoHodlContextType | undefined>(undefined);

export const useAutoHodl = () => {
  const context = useContext(AutoHodlContext);
  if (!context) {
    throw new Error('useAutoHodl must be used within a AutoHodlProvider');
  }
  return context;
};

type Props = {
  children: ReactNode;
};

export const AutoHodlProvider: FC<Props> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SavingsConfig | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(false);
  const { address, isConnected } = useConnection();
  const [savingsChainId, setSavingsChainId] = useState<EChainId | null>(null);

  const switchChainFn = useSwitchChain();

  async function switchChain(chainId: EChainId) {
    const chainToSwitch = chains.find((c) => c.id === chainId);
    if (chainToSwitch) {
      await switchChainFn.mutateAsync({ chainId: chainToSwitch.id });
    } else {
      console.error('Chain to switch not found');
    }
  }

  // Get Supported Accounts
  const { data: accountsMap, isLoading: loadingAccounts } = useQuery({
    enabled: !!address && isConnected,
    queryFn: async () => {
      return await getSupportedAccounts(address);
    },
    queryKey: ['supported-accounts', address, refetchFlag],
  });

  const accounts = savingsChainId ? accountsMap?.get(savingsChainId) || [] : [];

  // Fetch savings config when wallet connects
  useEffect(() => {
    async function fetchSavingsConfigArray() {
      if (!address || !isConnected) {
        return;
      }

      try {
        setLoading(true);
        for (const chain of chains) {
          const chainId = chain.id as EChainId;
          const config = await getSavingsConfig(
            getViemPublicClientByChain(chainId),
            address,
            getUsdcAddressByChain(chainId),
            chainId,
          );
          const found = config && config.savingAddress !== zeroAddress;
          if (found) {
            setConfig(config);
            setSavingsChainId(chainId);
            break;
          }
          setConfig(null);
          setSavingsChainId(null);
        }
      } catch (error) {
        console.error('Error fetching savings config:', error);
        setConfig(null);
        setSavingsChainId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSavingsConfigArray();
  }, [address, isConnected, refetchFlag]);

  // TODO: check autoHODL config in all supported chains and set savingsChain accordingly

  // Get sToken Balance
  const sToken = useERC20BalanceOf({
    chainId: savingsChainId,
    token: getSusdcAddressByChain(savingsChainId || mockDefaultChainId),
    address: address,
  });

  // Get Token Balance
  const token = useERC20BalanceOf({
    chainId: savingsChainId,
    token: getUsdcAddressByChain(savingsChainId || mockDefaultChainId),
    address: address,
  });

  return (
    <AutoHodlContext.Provider
      value={{
        loading: loading || loadingAccounts,
        config,
        setRefetchFlag,
        setConfig,
        accountsMap,
        accounts,
        sToken,
        token,
        address,
        isConnected,
        savingsChainId,
        setSavingsChainId,
        switchChain,
      }}
    >
      {children}
    </AutoHodlContext.Provider>
  );
};
