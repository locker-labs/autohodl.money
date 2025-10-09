'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import USDCApprovalChecker from "@/components/ApproveUSDC";
import UserOnboarding from "@/components/UserOnboarding";
import Header from "@/components/Header";

export default function Home() {
  const { isConnected } = useAppKitAccount();
  return (
    <div className={"h-screen w-full flex flex-col items-center gap-8 p-8"}>
      <Header />
      {isConnected && <UserOnboarding />}
    </div>
  );
}
