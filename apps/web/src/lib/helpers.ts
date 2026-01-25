import { type Address, getAddress } from 'viem';
import { AUTOHODL_SUPPORTED_TOKENS } from '@/lib/constants';

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

export { computeRoundUpAndSavings, isAutoHodlSupportedToken };
