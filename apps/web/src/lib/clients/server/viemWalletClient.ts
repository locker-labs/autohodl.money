import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { EChainId } from '@/lib/constants';
import { secrets } from '@/lib/secrets';
import { getAlchemyApiUrlByChain, getViemChain } from '@/lib/helpers';

export const account = privateKeyToAccount(secrets.privateKeyExecutor as `0x${string}`);

function createWalletClientForChain(chainId: EChainId) {
  const alchemyUrl = getAlchemyApiUrlByChain(chainId);
  const chain = getViemChain(chainId);

  return createWalletClient({
    chain,
    transport: http(alchemyUrl),
    account,
  });
}

const baseClient = createWalletClientForChain(EChainId.Base);
const arcTestnetClient = createWalletClientForChain(EChainId.ArcTestnet);
const lineaClient = createWalletClientForChain(EChainId.Linea);
const sepoliaClient = createWalletClientForChain(EChainId.Sepolia);

export const ViemWalletClientMap: Record<EChainId, WalletClient> = {
  [EChainId.Base]: baseClient,
  [EChainId.ArcTestnet]: arcTestnetClient,
  [EChainId.Linea]: lineaClient,
  [EChainId.Sepolia]: sepoliaClient,
};

export function getViemWalletClientByChain(chainId: EChainId) {
  return ViemWalletClientMap[chainId];
}
