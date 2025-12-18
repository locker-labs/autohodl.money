import type { AppKitNetwork } from '@reown/appkit/networks';
import { defineChain, linea } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arcTestnet as arcTestnetViem, type Chain, linea as lineaViem } from 'viem/chains';
import { secrets } from '@/lib/secrets';

// NOTE: reown's AppKit does not yet include Arc Testnet yet, so we define it here
const arcTestnetAppKitNetwork: AppKitNetwork = defineChain({
  id: arcTestnetViem.id,
  caipNetworkId: `eip155:${arcTestnetViem.id}`,
  chainNamespace: 'eip155',
  name: arcTestnetViem.name,
  nativeCurrency: arcTestnetViem.nativeCurrency,
  blockExplorers: arcTestnetViem.blockExplorers,
  rpcUrls: arcTestnetViem.rpcUrls,
  contracts: arcTestnetViem.contracts,
});

// ['production', 'staging'].includes(secrets.env) ? linea : sepolia;
export const chain = linea;
export const chains = [linea, arcTestnetAppKitNetwork];

export const viemChain: Chain = lineaViem;
export const viemChains: Chain[] = [lineaViem, arcTestnetViem];

// Get projectId from https://dashboard.reown.com
export const projectId = secrets.reownProjectId;

if (!projectId) {
  throw new Error('Reown project ID is not defined');
}

export const networks = chains as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
