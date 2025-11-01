import { SetupRouter } from '@/components/setup/SetupRouter';
import StepContainer from '@/components/view/StepContainer';
import type { SupportedAccounts } from '@/lib/constants';

const UserOnboarding = ({ accounts }: { accounts: SupportedAccounts[] }) => {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <StepContainer>
        <SetupRouter accounts={accounts} />
      </StepContainer>
    </div>
  );
};

export default UserOnboarding;
