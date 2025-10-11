import EOASetup from '@/components/setup/EOASetup';
import MetamaskCardSetup from '@/components/setup/MetamaskCardSetup';
import { SupportedAccounts } from '@/lib/constants';

function SetupRouter({ accounts }: { accounts: SupportedAccounts[] }) {
  if (accounts.includes(SupportedAccounts.MetaMask)) {
    return <MetamaskCardSetup />;
  }

  if (accounts.includes(SupportedAccounts.EOA)) {
    return <EOASetup />;
  }

  return <div>Unsupported account type</div>;
}

export { SetupRouter };
