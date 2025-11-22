import { useState } from 'react';
import SetSavingConfig from '@/components/subcomponents/SetSavingConfig';
import DetectedCard from '@/components/view/DetectedCard';
import { SupportedAccounts } from '@/lib/constants';
import Button from '../subcomponents/Button';

const MetamaskCardSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const nextStep = () => {
    setCurrentStep(2);
  };

  // TODO: calculate these values based on user's transaction history
  // description={`Based on your history, you could have saved $${possibleSavings} from ${pastTxns} purchases.`}

  return (
    <div className='flex flex-col items-center gap-8'>
      {currentStep === 1 && (
        <DetectedCard
          title='MetaMask Card Detected'
          description={`Continue to round up any time you spend USDC from your crypto card`}
          image='/SavingGrowth.png'
        >
          <Button className='text-[16px]' title={'Continue with Card'} onAction={nextStep} />
        </DetectedCard>
      )}
      {currentStep === 2 && <SetSavingConfig account={SupportedAccounts.MetaMask} />}
    </div>
  );
};

export default MetamaskCardSetup;
