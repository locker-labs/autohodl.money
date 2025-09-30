'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import USDCApprovalChecker from '@/components/ApproveUSDC';
import { ConnectButton } from '@/components/ConnectButton';

export default function Home() {
  const { isConnected } = useAppKitAccount();
  return (
    <div className={'min-h-screen flex flex-col items-center justify-center gap-4'}>
      <h1 className='text-4xl font-bold'>Welcome to AutoHodl</h1>
      <ConnectButton />
      {isConnected ? <USDCApprovalChecker /> : null}
    </div>
  );
}
