'use client';

import { LoaderPrimary } from '@/components/ui/loader';

const Loading = () => {
  return (
    <div className='w-full min-h-screen overflow-x-hidden'>
      <div className='h-screen flex flex-col items-center justify-center gap-4 p-8'>
        <LoaderPrimary />
        <p>App is loading...</p>
      </div>
    </div>
  );
};

export default Loading;
