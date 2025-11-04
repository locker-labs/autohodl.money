import EOASetup from '@/components/setup/EOASetup';
import MetamaskCardSetup from '@/components/setup/MetamaskCardSetup';
import { SupportedAccounts } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

function SetupRouter({ accounts }: { accounts: SupportedAccounts[] }) {
  if (accounts.includes(SupportedAccounts.MetaMask)) {
    return <MetamaskCardSetup />;
  }

  if (accounts.includes(SupportedAccounts.EOA)) {
    return <EOASetup />;
  }

  return (
    <div className='w-full flex items-center justify-center'>
      <Loader2 className='animate-spin' />
    </div>
  );
}

export { SetupRouter };
