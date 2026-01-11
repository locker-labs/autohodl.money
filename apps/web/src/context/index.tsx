'use client';

import { wagmiAdapter, projectId, networks } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import type { ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { AutoHodlProvider } from '@/context/AutoHodlContext';
import { ChainSwitchProvider } from '@/context/ChainSwitchContext';
import { ViemChainImageMap } from '@/lib/constants';

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: 'autohodl.money',
  description: 'Save while you spend',
  url: 'https://autohodl.money', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Create the modal
export const modal = createAppKit({
  chainImages: ViemChainImageMap,
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'light',
  features: {
    swaps: false,
    onramp: false,
    email: false,
    socials: false,
    history: true,
    analytics: true,
    allWallets: true,
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  },
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AutoHodlProvider>
          <ChainSwitchProvider>{children}</ChainSwitchProvider>
        </AutoHodlProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
