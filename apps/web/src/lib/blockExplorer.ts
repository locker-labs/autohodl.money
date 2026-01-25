import { chainIdToBlockExplorer, type EChainId } from './constants';

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
