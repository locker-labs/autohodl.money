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
  SUPPORTED_TOKENS,
  ScheduleAutoHodlAddressMap
} from '@/lib/constants';
import { chains } from '@/config';

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

function isAutoHodlSupportedToken(token: Address): boolean {
  let isTokenSupported = false;
  for (const supportedToken of SUPPORTED_TOKENS) {
    if (getAddress(supportedToken) === getAddress(token)) {
      isTokenSupported = true;
      break;
    }
  }
  return isTokenSupported;
}

function isAutoHodlSupportedTokenByChain(token: Address, chainId: EChainId): boolean {
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

function isValidSourceChain(chainId: number): boolean {
  for (let idx = 0; idx < chains.length; idx++) {
    if (chains[idx].id === chainId) {
      return true;
    }
  }

  return false;
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
function getScheduleAutoHodlAddressByChain(chainId: EChainId | null): Address {
  if (!chainId) throw new Error('Missing chain');
  return ScheduleAutoHodlAddressMap[chainId];
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

// Shared constants for time calculations (in seconds)
const SECONDS_IN_A_MINUTE = 60;
const SECONDS_IN_AN_HOUR = 3600;
const SECONDS_IN_A_DAY = 86400;
const SECONDS_IN_A_WEEK = 604800;
const SECONDS_IN_TWO_WEEKS = 1209600;
const SECONDS_IN_A_MONTH = 2592000;

function convertCycle(period: bigint | null): string {
  let remainingSeconds = Number(period);

  // Fallback for 0 or negative
  if (remainingSeconds <= 0) return '0 seconds';

  // Exact matches for your preset UI buttons to ensure they highlight correctly
  if (remainingSeconds === SECONDS_IN_A_DAY) return 'daily';
  if (remainingSeconds === SECONDS_IN_A_WEEK) return 'weekly';
  if (remainingSeconds === SECONDS_IN_A_WEEK * 2) return 'biweekly';
  if (remainingSeconds === SECONDS_IN_A_DAY * 30) return 'monthly';

  // Dynamic calculation for custom periods
  const weeks = Math.floor(remainingSeconds / SECONDS_IN_A_WEEK);
  remainingSeconds %= SECONDS_IN_A_WEEK;

  const days = Math.floor(remainingSeconds / SECONDS_IN_A_DAY);
  remainingSeconds %= SECONDS_IN_A_DAY;

  const hours = Math.floor(remainingSeconds / SECONDS_IN_AN_HOUR);
  remainingSeconds %= SECONDS_IN_AN_HOUR;

  const minutes = Math.floor(remainingSeconds / SECONDS_IN_A_MINUTE);
  remainingSeconds %= SECONDS_IN_A_MINUTE;

  const parts = [];

  if (weeks > 0) parts.push(`${weeks} ${weeks === 1 ? 'week' : 'weeks'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
  
  // Only show seconds if the interval is less than a minute
  if (remainingSeconds > 0 && parts.length === 0) {
    parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'sec' : 'secs'}`);
  }

  return parts.join(' '); // Returns formats like "1 week 2 days" or "12 hrs 30 mins"
}

function convertCycleToBigInt(cycle: string): bigint {
  const normalizedCycle = cycle.toLowerCase().trim();

  // 1. Handle the exact preset matches from your UI
  switch (normalizedCycle) {
    case 'daily':
      return BigInt(SECONDS_IN_A_DAY);
    case 'weekly':
      return BigInt(SECONDS_IN_A_WEEK);
    case 'biweekly':
      return BigInt(SECONDS_IN_TWO_WEEKS);
    case 'monthly':
      return BigInt(SECONDS_IN_A_MONTH);
  }

  // 2. Parse custom dynamic strings (e.g., "1 week 2 days 5 hrs")
  let totalSeconds = 0;

  // Regex matches a number followed by a unit (handling optional 's' for plurals)
  const regex = /(\d+)\s*(week|day|hr|hour|min|minute|sec|second)s?/g;
  let match;

  while ((match = regex.exec(normalizedCycle)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'week':
        totalSeconds += value * SECONDS_IN_A_WEEK;
        break;
      case 'day':
        totalSeconds += value * SECONDS_IN_A_DAY;
        break;
      case 'hr':
      case 'hour':
        totalSeconds += value * SECONDS_IN_AN_HOUR;
        break;
      case 'min':
      case 'minute':
        totalSeconds += value * SECONDS_IN_A_MINUTE;
        break;
      case 'sec':
      case 'second':
        totalSeconds += value;
        break;
    }
  }

  // 3. Fallback safety check
  if (totalSeconds === 0) {
    console.error(`Failed to parse schedule cycle: "${cycle}". Falling back to daily.`);
    return BigInt(SECONDS_IN_A_DAY); 
  }

  return BigInt(totalSeconds);
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
  isValidSourceChain,
  isAutoHodlSupportedTokenByChain,
  getScheduleAutoHodlAddressByChain,
  convertCycle,
  convertCycleToBigInt
};
