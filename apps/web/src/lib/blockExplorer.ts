import { EChainId } from './constants';

const chainIdToBlockExplorer: Record<EChainId, string> = {
  [EChainId.Linea]: 'https://lineascan.build',
  [EChainId.Sepolia]: 'https://sepolia.etherscan.io',
  [EChainId.ArcTestnet]: 'https://testnet.arcscan.app',
  // 8453: 'https://basescan.org',
  // 84532: 'https://sepolia.basescan.org',
  // 42161: 'https://arbiscan.io',
};

export const getTransactionLink = (txHash: string, chainId: EChainId | null): string => {
  if (!chainId) {
    throw new Error('Chain ID is required');
  }
  return `${chainIdToBlockExplorer[chainId]}/tx/${txHash}`;
};

export const getAddressLink = (address: string, chainId: EChainId | null): string => {
  if (!chainId) {
    throw new Error('Chain ID is required');
  }
  return `${chainIdToBlockExplorer[chainId]}/address/${address}`;
};
