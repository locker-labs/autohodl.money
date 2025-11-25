'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import type { SupportedAccounts } from '@/lib/constants';
import { getSupportedAccounts } from '@/lib/userAccounts';
import Loading from '@/app/loading';
import { Footer } from '@/components/subcomponents/Footer';

export default function Home() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { loading, config } = useAutoHodl();

  const [accounts, setAccounts] = useState<SupportedAccounts[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchAccounts() {
      if (!address) return;
      const fetchedAccounts = await getSupportedAccounts(address);
      setAccounts(fetchedAccounts);
    }
    fetchAccounts();
  }, [address]);

  if (loading || isConnecting || isReconnecting || (isConnected && !accounts.length)) {
    return <Loading />;
  }

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div className={'min-h-screen w-full flex flex-col items-center justify-between lg:gap-8'}>
      <Header />

      {!config ? <UserOnboarding accounts={accounts} /> : <Dashboard />}

      <Footer className='w-full' />
    </div>
  );
}
