import type { AppKitNetwork } from '@reown/appkit/networks';
import { linea, sepolia } from '@reown/appkit/networks';
import { linea as lineaViem, sepolia as sepoliaViem } from 'viem/chains';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { secrets } from '@/lib/secrets';

export const chain = secrets.env === 'production' || secrets.env === 'staging' ? linea : sepolia;
export const viemChain = secrets.env === 'production' || secrets.env === 'staging' ? lineaViem : sepoliaViem;

// Get projectId from https://dashboard.reown.com
export const projectId = secrets.reownProjectId as string;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [chain] as [AppKitNetwork, ...AppKitNetwork[]];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
