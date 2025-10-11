import { useState } from 'react';
import SetSavingConfig from '@/components/subcomponents/SetSavingConfig';
import DetectedCard from '@/components/view/DetectedCard';
import { SupportedAccounts } from '@/lib/constants';

const MetamaskCardSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const nextStep = () => {
    setCurrentStep(2);
  };

  // TODO: calculate these values based on user's transaction history
  const pastTxns = 23;
  const possibleSavings = 100;

  return (
    <div className='flex flex-col items-center gap-8'>
      {currentStep === 1 && (
        <DetectedCard
          title='MetaMask Card Detected'
          description={`Based on your history, you could have saved $${possibleSavings} from ${pastTxns} purchases.`}
          image='/SavingGrowth.png'
          buttonTitle='Continue to Setup'
          handleButtonClick={nextStep}
        />
      )}
      {currentStep === 2 && <SetSavingConfig account={SupportedAccounts.MetaMask} />}
    </div>
  );
};

export default MetamaskCardSetup;
