'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useERC20BalanceOf, type UseERC20BalanceOfReturn } from '@/hooks/useERC20Token';
import { S_USDC_ADDRESS, type SupportedAccounts, USDC_ADDRESS } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/autohodl';
import type { SavingsConfig } from '@/types/autohodl';
import type { FC, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupportedAccounts } from '@/lib/userAccounts';
import { viemPublicClient } from '@/lib/clients/client';
import { type Address, zeroAddress } from 'viem';

type AutoHodlContextType = {
  loading: boolean;
  config: SavingsConfig | null;
  setConfig: React.Dispatch<React.SetStateAction<SavingsConfig | null>>;
  setRefetchFlag: React.Dispatch<React.SetStateAction<boolean>>;
  accounts: SupportedAccounts[];
  sToken: UseERC20BalanceOfReturn;
  token: UseERC20BalanceOfReturn;
  address: Address | undefined;
  isConnected: boolean;
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
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SavingsConfig | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(false);
  const { address, isConnected } = useAccount();

  // Get Supported Accounts
  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    enabled: !!address && isConnected,
    queryFn: async () => {
      return await getSupportedAccounts(address);
    },
    queryKey: ['supported-accounts', address, refetchFlag],
  });

  // Fetch savings config when wallet connects
  useEffect(() => {
    async function fetchSavingsConfigArray() {
      if (!address || !isConnected) {
        return;
      }

      try {
        setLoading(true);
        const config = await getSavingsConfig(viemPublicClient, address, USDC_ADDRESS);
        const found = config && config.savingAddress !== zeroAddress;
        if (found) {
          setConfig(config);
        } else {
          setConfig(null);
        }
      } catch (error) {
        console.error('Error fetching savings config:', error);
        setConfig(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSavingsConfigArray();
  }, [address, isConnected, refetchFlag]);

  // Get sToken Balance
  const sToken = useERC20BalanceOf({
    token: S_USDC_ADDRESS,
    address: address,
  });

  // Get Token Balance
  const token = useERC20BalanceOf({
    token: USDC_ADDRESS,
    address: address,
  });

  return (
    <AutoHodlContext.Provider
      value={{
        loading: loading || loadingAccounts,
        config,
        setRefetchFlag,
        setConfig,
        accounts: accounts || [],
        sToken,
        token,
        address,
        isConnected,
      }}
    >
      {children}
    </AutoHodlContext.Provider>
  );
};
