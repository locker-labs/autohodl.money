'use client';

import { Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';

export default function Home() {
  const { isConnected } = useAccount();
  const { loading, config } = useAutoHodl();

  if (loading) {
    return (
      <div className={'h-screen w-full flex flex-col items-center justify-center gap-4 p-8'}>
        <Loader2 className='animate-spin' color='#78E76E' />
        <p>App is loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div className={'h-screen w-full flex flex-col items-center gap-8 p-8'}>
      <Header />
      {!config ? <UserOnboarding /> : <Dashboard />}
    </div>
  );
}
