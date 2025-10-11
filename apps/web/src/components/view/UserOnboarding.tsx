import { useEffect, useState } from 'react';
import { SetupRouter } from '@/components/setup/SetupRouter';
import StepContainer from '@/components/view/StepContainer';
import type { SupportedAccounts } from '@/lib/constants';
import { getSupportedAccounts } from '@/lib/userAccounts';
import { useAccount } from 'wagmi';

const UserOnboarding: React.FC = () => {
  const [accounts, setAccounts] = useState<SupportedAccounts[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchAccounts() {
      if (!address) return;
      const fetchedAccounts = await getSupportedAccounts(address);
      setAccounts(fetchedAccounts);
      console.log('Supported accounts:', fetchedAccounts);
    }
    fetchAccounts();
  }, []);

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <StepContainer>
        <SetupRouter accounts={accounts} />
      </StepContainer>
    </div>
  );
};

export default UserOnboarding;
