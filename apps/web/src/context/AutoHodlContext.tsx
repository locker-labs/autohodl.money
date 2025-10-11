'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { USDC_ADDRESS } from '@/lib/constants';
import { getSavingsConfig } from '@/lib/contract/client/getSavingsConfig';
import type { SavingsConfig } from '@/types/autohodl';
import type { FC, ReactNode } from 'react';

type AutoHodlContextType = {
  loading: boolean;
  config: SavingsConfig | null;
  setRefetchFlag: React.Dispatch<React.SetStateAction<boolean>>;
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
  const { address, isConnected } = useAccount();

  // Fetch savings config when wallet connects
  useEffect(() => {
    async function fetchSavingsConfig() {
      if (!address || !isConnected) {
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching savings config for user:', address, 'Token:', USDC_ADDRESS);
        const config = await getSavingsConfig(address, USDC_ADDRESS);
        const found = config && config[0] !== '0x0000000000000000000000000000000000000000';
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

    fetchSavingsConfig();
  }, [address, isConnected, refetchFlag]);

  return <AutoHodlContext.Provider value={{ loading, config, setRefetchFlag }}>{children}</AutoHodlContext.Provider>;
};
