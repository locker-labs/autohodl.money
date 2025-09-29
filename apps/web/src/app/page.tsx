import { ConnectButton } from '@/components/ConnectButton';

export default function Home() {
  return (
    <div className={'min-h-screen flex flex-col items-center justify-center gap-4'}>
      <h1 className='text-4xl font-bold'>Welcome to AutoHodl</h1>
      <ConnectButton />
    </div>
  );
}
