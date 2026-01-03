import { createPublicClient, http, type PublicClient } from 'viem';
import { AlchemyApiUrlMap, EChainId, ViemChainMap } from '@/lib/constants';

function createPublicClientForChain(chainId: EChainId) {
  const alchemyUrl = AlchemyApiUrlMap[chainId];
  const chain = ViemChainMap[chainId];

  return createPublicClient({
    chain,
    transport: http(alchemyUrl),
  });
}

const arcTestnetClient = createPublicClientForChain(EChainId.ArcTestnet);
const lineaClient = createPublicClientForChain(EChainId.Linea);
const sepoliaClient = createPublicClientForChain(EChainId.Sepolia);

export const ViemPublicClientMap: Record<EChainId, PublicClient> = {
  [EChainId.ArcTestnet]: arcTestnetClient,
  [EChainId.Linea]: lineaClient,
  [EChainId.Sepolia]: sepoliaClient,
};
