'use client';

import { useConnection } from 'wagmi';
import Loading from '@/app/loading';
import Header from '@/components/subcomponents/Header';
import { Footer } from '@/components/subcomponents/Footer';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { trackWalletConnected } from '@/hooks/trackWalletConnected';

export default function Home() {
  const { isConnected, isConnecting, isReconnecting } = useConnection();
  const { loading, config } = useAutoHodl();
  trackWalletConnected();

  if (loading || isConnecting || isReconnecting) {
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
