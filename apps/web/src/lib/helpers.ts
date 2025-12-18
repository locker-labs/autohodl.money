import { type Address, getAddress } from 'viem';
import {
  AUTOHODL_SUPPORTED_TOKENS,
  type TSusdcAddress,
  type TUsdcAddress,
  SUSDC_ADDRESS_SET,
  USDC_ADDRESS_SET,
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

function isAutoHodlSupportedToken(token: Address): boolean {
  let isTokenSupported = false;
  for (const supportedToken of AUTOHODL_SUPPORTED_TOKENS) {
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

export {
  computeRoundUpAndSavings,
  isAutoHodlSupportedToken,
  isSusdcAddress,
  isUsdcAddress,
  getSusdcAddress,
  getUsdcAddress,
};
