import { useState } from 'react';
import SetSavingConfig from '@/components/subcomponents/SetSavingConfig';
import { SupportedAccounts } from '@/lib/constants';
import DetectedCard from '@/components/view/DetectedCard';
import { paths } from '@/lib/paths';
import Button from '@/components/subcomponents/Button';
import { ExternalLink } from 'lucide-react';

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
          description={`Auto HODL works whenever you spend with your MetaMask Card.
             Don’t worry  it only takes a few minutes to get one.`}
          image='/not-found.svg'
        >
          {/* Link to get a MetaMask Card */}
          <Button className='text-[16px]' title={'Continue without Card'} onAction={handleButtonClick} />
          <a
            href={paths.GetMetaMaskCard}
            target='_blank'
            className={`flex items-center gap-1
              hover:underline decoration-black decoration-1 underline-offset-4
               transition-all duration-300`}
          >
            <p>Get a card</p>
            <ExternalLink size={16} />
          </a>
        </DetectedCard>
      )}
      {currentStep === 2 && <SetSavingConfig account={SupportedAccounts.EOA} />}
    </div>
  );
};

export default EOASetup;
