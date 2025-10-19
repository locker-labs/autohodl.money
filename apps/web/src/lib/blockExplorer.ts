import { chain } from '@/config';

const chainId = chain.id;

const chainIdToBlockExplorer: Record<number, string> = {
  59144: 'https://lineascan.build',
  11155111: 'https://sepolia.etherscan.io',
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  42161: 'https://arbiscan.io',
};

export const getTransactionLink = (txHash: string): string => {
  return `${chainIdToBlockExplorer[chainId]}/tx/${txHash}`;
};

export const getAddressLink = (address: string): string => {
  return `${chainIdToBlockExplorer[chainId]}/address/${address}`;
};
