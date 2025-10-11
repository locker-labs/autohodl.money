import { SupportedAccounts } from '@/lib/constants';

async function getSupportedAccounts() {
  // Write logic to determine supported accounts
  return [SupportedAccounts.MetaMask];
}

export { getSupportedAccounts };
