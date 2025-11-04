'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import Dashboard from '@/components/view/Dashboard';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';

export default function Home() {
  const { isConnected } = useAccount();
  const { loading, config } = useAutoHodl();

  return (
    <div className={'h-screen w-full flex flex-col items-center gap-8 p-8'}>
      <Header />
      {loading ? (
        <div>App is loading...</div>
      ) : !isConnected ? (
        <div>Please connect your wallet to continue</div>
      ) : !config ? (
        <UserOnboarding />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
