'use client';

import Image from 'next/image';
import { ConnectButton } from '@/components/feature/ConnectButton';
import { ChainSelector } from '@/components/feature/ChainSelector';

export default function Header({ className }: { className?: string }) {
  return (
    <div
      className={`border-gray-300 w-full sticky top-0 z-10 flex items-center justify-center bg-white border-b ${className}`}
    >
      <div className={'max-w-[1080px] p-4 w-full flex justify-between items-center gap-3'}>
        <Image src='/AutoHODL.png' alt='autoHODL' width={96} height={26} priority />
        <div className='flex items-center gap-3'>
          <ChainSelector />
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
