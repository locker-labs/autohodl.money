'use client';

import Image from 'next/image';
import { ConnectButton } from '@/components/ConnectButton';

export default function Header() {
  return (
    <div className={'p-4 w-full flex justify-between items-center'}>
      <Image src='/AutoHODL.png' alt='AutoHodl logo' width={96} height={96} priority />
      <ConnectButton />
    </div>
  );
}
