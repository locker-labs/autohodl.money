import { useEffect, useState } from 'react';
import { SetupRouter } from '@/components/setup/SetupRouter';
import StepContainer from '@/components/view/StepContainer';
import type { SupportedAccounts } from '@/lib/constants';
import { getSupportedAccounts } from '@/lib/userAccounts';

const UserOnboarding: React.FC = () => {
  const [accounts, setAccounts] = useState<SupportedAccounts[]>([]);

  useEffect(() => {
    async function fetchAccounts() {
      const fetchedAccounts = await getSupportedAccounts();
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
