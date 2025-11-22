'use client';

import Image from 'next/image';
import { ConnectButton } from '@/components/ConnectButton';

export default function Header() {
  return (
    <div
      className={
        'z-10 border-b lg:border-0 border-gray-300 sticky top-0 bg-white max-w-[1080px] p-4 w-full flex justify-between items-center'
      }
    >
      <Image src='/AutoHODL.png' alt='AutoHodl logo' width={96} height={26} priority />
      <ConnectButton />
    </div>
  );
}
