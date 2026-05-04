import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { EChainId } from '@/lib/constants';
import { secrets } from '@/lib/secrets';
import { getAlchemyApiUrlByChain, getViemChain } from '@/lib/helpers';

let _account: ReturnType<typeof privateKeyToAccount> | null = null;
let _clientMap: Record<EChainId, WalletClient> | null = null;

export function getAccount() {
  if (!_account) {
    _account = privateKeyToAccount(secrets.privateKeyExecutor as `0x${string}`);
  }
  return _account;
}

function getClientMap(): Record<EChainId, WalletClient> {
  if (!_clientMap) {
    const account = getAccount();

    function createWalletClientForChain(chainId: EChainId) {
      return createWalletClient({
        chain: getViemChain(chainId),
        transport: http(getAlchemyApiUrlByChain(chainId)),
        account,
      });
    }

    _clientMap = {
      [EChainId.Base]: createWalletClientForChain(EChainId.Base),
      [EChainId.ArcTestnet]: createWalletClientForChain(EChainId.ArcTestnet),
      [EChainId.Linea]: createWalletClientForChain(EChainId.Linea),
      [EChainId.Sepolia]: createWalletClientForChain(EChainId.Sepolia),
    };
  }
  return _clientMap;
}

export function getViemWalletClientByChain(chainId: EChainId) {
  return getClientMap()[chainId];
}
