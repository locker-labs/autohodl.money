'use client';

import { useConnection } from 'wagmi';
import Loading from '@/app/loading';
import Header from '@/components/subcomponents/Header';
import { Footer } from '@/components/subcomponents/Footer';
import Dashboard from '@/components/view/Dashboard';
import LandingPage from '@/components/view/Landing';
import UserOnboarding from '@/components/view/UserOnboarding';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { trackPageVisited } from '@/hooks/trackPageVisited';
import { trackWalletConnected } from '@/hooks/trackWalletConnected';
import ScheduleOnboarding from "@/components/view/ScheduleOnboarding";

export default function Home() {
  const { connector } = useConnection();
  const { isConnected, isConnecting, isReconnecting } = useConnection();
  const { loading, config, scheduleConfig } = useAutoHodl();
  const isOnboarded = !!config || !!scheduleConfig;
  console.log(isOnboarded);
  trackPageVisited();
  trackWalletConnected();
  const isCoinbaseFlow = connector?.id === "coinbaseWalletSDK";
  if (loading || isConnecting || isReconnecting) {
    return <Loading />;
  }

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center
      ${isOnboarded ? "justify-between" : "bg-[#F9FBED]"}
     `}
    >
      <Header className={isOnboarded ? "lg:border-0" : ""} />
      {!isOnboarded ? (
        isCoinbaseFlow ? (
          <ScheduleOnboarding />
        ) : (
          <UserOnboarding />
        )
      ) : (
        <Dashboard />
      )}
      {!isOnboarded ? null : <Footer className="w-full" />}
    </div>
  );
}
