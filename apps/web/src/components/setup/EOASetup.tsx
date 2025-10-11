import { useState } from 'react';
import SetSavingConfig from '@/components/subcomponents/SetSavingConfig';
import { SupportedAccounts } from '@/lib/constants';
import DetectedCard from '@/components/view/DetectedCard';
import { paths } from '@/lib/paths';

const EOASetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const handleButtonClick = () => {
    setCurrentStep(2);
  };

  return (
    <div className='flex flex-col items-center gap-8'>
      {currentStep === 1 && (
        <DetectedCard
          title='Oh no, we didn’t find a MetaMask Card!'
          description={`Auto HODL works whenever you spend with your MetaMask Card. Don’t worry  it only takes a few minutes to get one.`}
          image='/Gear.png'
          imageWidth={200}
          imageHeight={120}
          buttonTitle={'Continue without card'}
          handleButtonClick={handleButtonClick}
        >
          {/* Link to get a MetaMask Card */}
          <a
            href={paths.GetMetaMaskCard}
            target='_blank'
            className='underline decoration-black decoration-2 underline-offset-4 hover:decoration-4 transition-colors'
          >
            Get a MetaMask Card
          </a>
        </DetectedCard>
      )}
      {currentStep === 2 && <SetSavingConfig account={SupportedAccounts.EOA} />}
    </div>
  );
};

export default EOASetup;
