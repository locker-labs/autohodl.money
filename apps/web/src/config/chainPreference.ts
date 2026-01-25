import { EChainId } from '@/lib/constants';

function getPreferredChainId(chainIds: EChainId[]) {
  if (chainIds.includes(EChainId.Linea)) {
    return EChainId.Linea;
  }

  if (chainIds.includes(EChainId.ArcTestnet)) {
    return EChainId.ArcTestnet;
  }

  if (chainIds.includes(EChainId.Sepolia)) {
    return EChainId.Sepolia;
  }
}

export { getPreferredChainId };
