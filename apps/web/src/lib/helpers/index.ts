import { type Address, type Chain, getAddress, type PublicClient } from 'viem';
import { ViemPublicClientMap } from '@/lib/clients/viemPublicClient';
import {
  type TSusdcAddress,
  type TUsdcAddress,
  SUSDC_ADDRESS_SET,
  USDC_ADDRESS_SET,
  type EChainId,
  AlchemyApiUrlMap,
  AutoHodlAddressMap,
  MMCardDelegateAddressMap,
  SusdcAddressMap,
  UsdcAddressMap,
  TokenDecimalMap,
  type TTokenAddress,
  AutoHodlSupportedTokenMap,
  AaveUiPoolDataProviderMap,
  AavePoolAddressesProviderMap,
  ViemChainMap,
  ViemChainImageMap,
} from '@/lib/constants';

function computeRoundUpAndSavings(
  transferAmount: bigint,
  roundUpTo: bigint,
): { roundUpAmount: bigint; savingsAmount: bigint } {
  if (roundUpTo <= BigInt(0)) {
    throw new Error('roundUpTo must be > 0');
  }
  // Equivalent to: ((transferAmount + roundUpTo - 1) / roundUpTo) * roundUpTo
  const roundUpAmount = ((transferAmount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;

  const savingsAmount = roundUpAmount - transferAmount;

  return { roundUpAmount, savingsAmount };
}

function isAutoHodlSupportedToken(token: Address, chainId: EChainId): boolean {
  const autohodlTokens = getAutoHodlSupportedTokens(chainId);

  let isTokenSupported = false;
  for (const supportedToken of autohodlTokens) {
    if (getAddress(supportedToken) === getAddress(token)) {
      isTokenSupported = true;
      break;
    }
  }
  return isTokenSupported;
}

function isUsdcAddress(token: Address) {
  return USDC_ADDRESS_SET.has(getAddress(token) as TUsdcAddress);
}

function getUsdcAddress(token: Address): TUsdcAddress | null {
  const normalizedToken = getAddress(token);
  for (const usdcAddress of USDC_ADDRESS_SET) {
    if (getAddress(usdcAddress) === normalizedToken) {
      return usdcAddress;
    }
  }

  return null;

  // throw new Error(`Token address ${token} is not a supported USDC address.`);
}

function getSusdcAddress(token: Address): TSusdcAddress {
  const normalizedToken = getAddress(token);
  for (const susdcAddress of SUSDC_ADDRESS_SET) {
    if (getAddress(susdcAddress) === normalizedToken) {
      return susdcAddress;
    }
  }

  throw new Error(`Token address ${token} is not a supported SUSDC address.`);
}

function isSusdcAddress(token: Address) {
  return SUSDC_ADDRESS_SET.has(getAddress(token) as TSusdcAddress);
}

function getUsdcAddressByChain(chainId: EChainId | null): TUsdcAddress {
  if (!chainId) throw new Error('Missing chain');
  return UsdcAddressMap[chainId];
}

function getSusdcAddressByChain(chainId: EChainId | null): TSusdcAddress {
  if (!chainId) throw new Error('Missing chain');
  return SusdcAddressMap[chainId];
}

function getAutoHodlAddressByChain(chainId: EChainId | null): Address {
  if (!chainId) throw new Error('Missing chain');
  return AutoHodlAddressMap[chainId];
}

function getDelegateAddressByChain(chainId: EChainId | null): Address {
  if (!chainId) throw new Error('Missing chain');
  return MMCardDelegateAddressMap[chainId];
}

function getAutoHodlSupportedTokens(chainId: EChainId | null): Address[] {
  if (!chainId) throw new Error('Missing chain');
  return AutoHodlSupportedTokenMap[chainId] || [];
}

function getViemPublicClientByChain(chainId: EChainId | null): PublicClient {
  if (!chainId) throw new Error('Missing chain');
  return ViemPublicClientMap[chainId];
}

function getAlchemyApiUrlByChain(chainId: EChainId): string {
  return AlchemyApiUrlMap[chainId];
}

function getViemChain(chainId: EChainId): Chain {
  return ViemChainMap[chainId];
}

function getViemChainImage(chainId: EChainId | null): string {
  if (!chainId) throw new Error('Missing chainId');
  return ViemChainImageMap[chainId];
}

function getSavingsChainAddresses(chainId: EChainId | null) {
  if (!chainId) throw new Error('Missing chainId');
  return {
    autohodl: getAutoHodlAddressByChain(chainId),
    delegate: getDelegateAddressByChain(chainId),
    usdc: getUsdcAddressByChain(chainId),
    susdc: getSusdcAddressByChain(chainId),
    autohodlTokens: getAutoHodlSupportedTokens(chainId),
  };
}

function getTokenDecimalsByAddress(tokenAddress: TTokenAddress): number {
  if (!tokenAddress) throw new Error('Missing token address');
  return TokenDecimalMap[tokenAddress];
}

// NOTE: Not all savings chains will have aave supported.
// TODO: handle types accordingly.

function getAaveUiPoolDataProviderByChain(chainId: EChainId | null): Address {
  if (!chainId) throw new Error('Missing chain');

  const uiPoolDataProvider = AaveUiPoolDataProviderMap[chainId as keyof typeof AaveUiPoolDataProviderMap];

  if (!uiPoolDataProvider) {
    throw new Error('Missing Aave Ui Pool Data Provider for chain');
  }

  return uiPoolDataProvider;
}

function getAavePoolAddressesProviderByChain(chainId: EChainId | null): Address {
  if (!chainId) throw new Error('Missing chain');

  const poolAddressesProvider = AavePoolAddressesProviderMap[chainId as keyof typeof AavePoolAddressesProviderMap];

  if (!poolAddressesProvider) {
    throw new Error('Missing Aave Pool Addresses Provider for chain');
  }

  return poolAddressesProvider;
}

export {
  computeRoundUpAndSavings,
  isAutoHodlSupportedToken,
  isSusdcAddress,
  isUsdcAddress,
  getSusdcAddress,
  getUsdcAddress,
  getUsdcAddressByChain,
  getSusdcAddressByChain,
  getAlchemyApiUrlByChain,
  getAutoHodlAddressByChain,
  getDelegateAddressByChain,
  getTokenDecimalsByAddress,
  getSavingsChainAddresses,
  getAutoHodlSupportedTokens,
  getAaveUiPoolDataProviderByChain,
  getAavePoolAddressesProviderByChain,
  getViemPublicClientByChain,
  getViemChain,
  getViemChainImage,
};
