import Image from 'next/image';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { SupportedAccounts } from '@/lib/constants';

const OnboardingBanner: React.FC = () => {
  const { accounts } = useAutoHodl();

  const hasMetamaskCard = accounts.some((account) => account === SupportedAccounts.MetaMask);

  const config = hasMetamaskCard
    ? {
        img: '/mmc.png',
        title: 'You have a MetaMask Card!',
        description: 'Start savings with your everyday spending.',
      }
    : {
        img: '/wallet.png',
        title: 'No MetaMask Card? No Problem.',
        description: "Start savings with your wallet's USDC transfers.",
      };

  return (
    <div className='flex items-center justify-start gap-3 w-full p-3 rounded-[24px] border border-[#71a56a] bg-[#b8edad]'>
      <Image src={config.img} width={80} height={80} alt='Wallet' />
      <div>
        <p className='font-medium text-lg'>{config.title}</p>
        <p>{config.description}</p>
      </div>
    </div>
  );
};

export default OnboardingBanner;
