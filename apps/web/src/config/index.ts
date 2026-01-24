import type { AppKitNetwork } from '@reown/appkit/networks';
import {
  // defineChain,
  base as baseAppKit,
  linea as lineaAppKit,
} from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type Chain, base, linea } from 'viem/chains';
import { secrets } from '@/lib/secrets';
import { SavingsMode } from '@/types/autohodl';

// NOTE: reown's AppKit does not yet include Arc Testnet yet, so we define it here
// const arcTestnetAppKitNetwork: AppKitNetwork = defineChain({
//   id: arcTestnetViem.id,
//   caipNetworkId: `eip155:${arcTestnetViem.id}`,
//   chainNamespace: 'eip155',
//   name: arcTestnetViem.name,
//   nativeCurrency: arcTestnetViem.nativeCurrency,
//   blockExplorers: arcTestnetViem.blockExplorers,
//   rpcUrls: arcTestnetViem.rpcUrls,
//   contracts: arcTestnetViem.contracts,
// });

// ['production', 'staging'].includes(secrets.env) ? linea : sepolia;
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [baseAppKit, lineaAppKit];
export const chains: Chain[] = [base, linea];

// Get projectId from https://dashboard.reown.com
export const projectId = secrets.reownProjectId;

if (!projectId) {
  throw new Error('Reown project ID is not defined');
}

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

export const yieldOptions = [
  {
    label: 'Earn yield',
    value: true,
    imgSrc: '/grow.svg',
    info: 'The change you save will be deposited to Aave and automatically earn yield',
  },
  {
    label: 'Idle savings',
    value: false,
    disabled: false,
    imgSrc: '/save.png',
    info: `The change you save will be deposited into an account of your choice but won't earn any yield`,
  },
];

export const savingOptions = [
  { label: '$1', value: 1, purchase: '$3.56', savings: '$0.44' },
  { label: '$10', value: 10, purchase: '$35', savings: '$5' },
  { label: '$100', value: 100, purchase: '$850', savings: '$50' },
];

export const getSavingsModes = (hasMetaMaskCard: boolean) => [
  {
    label: 'MetaMask Card only',
    value: SavingsMode.MetamaskCard,
    disabled: !hasMetaMaskCard,
    imgSrc: '/mmc.webp',
    info: 'Only save your spare change when you use your MetaMask Card.',
  },
  {
    label: hasMetaMaskCard ? 'All USDC transfers from Wallet and Card' : 'All USDC transfers',
    value: SavingsMode.All,
    disabled: false,
    imgSrc: '/USDCToken.svg',
    info: `Save your spare change, anytime you transfer USDC, regardless of whether it's with the MetaMask Card.`,
    imgSrc2: hasMetaMaskCard ? '/mmc.webp' : null,
  },
];
