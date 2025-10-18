'use client';

import { useAppKit } from '@reown/appkit/react';

export const ConnectButton = ({ className }: { className?: string }) => {
  const { open } = useAppKit();

  return (
    <div>
      <button
        type='button'
        title='Connect Wallet'
        onClick={() => open()}
        className={[
          // 'w-[140px] h-[52px]',
          'h-[52px] font-bold',
          'transition-colors duration-300',
          'inline-flex items-center justify-center rounded-[8px]',
          'px-4 py-2 text-lg font-medium',
          'bg-[#78E76E] text-black hover:bg-white',
          'disabled:opacity-50 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black',
          className,
        ].join(' ')}
      >
        Connect
      </button>
      {/* <appkit-button /> */}
    </div>
  );
};
