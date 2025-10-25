'use client';

import { Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import type { SupportedAccounts } from '@/lib/constants';
import { getSupportedAccounts } from '@/lib/userAccounts';

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

  if (loading || isConnecting || isReconnecting || !accounts.length) {
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
      {!config ? <UserOnboarding accounts={accounts} /> : <Dashboard />}
    </div>
  );
}
