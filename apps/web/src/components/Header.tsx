'use client';
import Image from "next/image";
import { ConnectButton } from '@/components/ConnectButton';


export default function Header() {
  return (
    <div
      className={"p-4 w-full flex justify-between items-center"}
    >
      <Image
        src="/AutoHODL.png" // file at public/AutoHODL.png
        alt="AutoHodl logo"
        width={96} // set explicit dimensions
        height={96}
        className="rounded-md"
        priority // optional: preloads above-the-fold images
      />
      <ConnectButton />
    </div>
  );
}
