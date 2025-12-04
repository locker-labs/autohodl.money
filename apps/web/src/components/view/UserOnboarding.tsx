import OnboardingBanner from '../subcomponents/OnboardingBanner';
import SetSavingConfig from '../subcomponents/SetSavingConfig';

const UserOnboarding = () => {
  return (
    <div className='w-full h-full flex flex-col justify-center items-center px-3 lg:px-4 py-3 lg:py-5'>
      <div className='max-w-md'>
        <OnboardingBanner />
      </div>

      <div className='lg:min-w-[698px] min-h-[500px] my-4 pt-2 lg:p-6 flex flex-col justify-center'>
        <div className='flex flex-col items-center gap-8'>
          <SetSavingConfig />
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
