'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';
import Loading from '@/app/loading';
import { Footer } from '@/components/subcomponents/Footer';
import { trackWalletConnected } from '@/hooks/trackWalletConnected';

export default function Home() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { loading, config, accounts } = useAutoHodl();

  trackWalletConnected();

  if (loading || isConnecting || isReconnecting || (isConnected && !accounts.length)) {
    return <Loading />;
  }

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center
      ${config ? 'justify-between' : 'bg-[#F9FBED]'}
     `}
    >
      <Header className={config ? 'lg:border-0' : ''} />
      {!config ? <UserOnboarding /> : <Dashboard />}
      {!config ? null : <Footer className='w-full' />}
    </div>
  );
}
