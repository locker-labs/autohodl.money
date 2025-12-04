'use client';

import Image from 'next/image';
import { ConnectButton } from '@/components/ConnectButton';

export default function Header({ className }: { className?: string }) {
  return (
    <div className={`w-full z-10 flex items-center justify-center bg-white border-b ${className}`}>
      <div
        className={' border-gray-300 sticky top-0 bg-white max-w-[1080px] p-4 w-full flex justify-between items-center'}
      >
        <Image src='/AutoHODL.png' alt='AutoHodl logo' width={96} height={26} priority />
        <ConnectButton />
      </div>
    </div>
  );
}
