'use client';
// This hook should be called only once in the app

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAnalytics } from '@/hooks/useAnalytics';

export function trackWalletConnected() {
  const { address: walletAddress } = useAccount();
  const { trackWalletConnectedEvent } = useAnalytics();

  useEffect(() => {
    const handleWalletConnected = async () => {
      const keyLs = `autohodl.wallet_connected:${walletAddress}`;
      const valueLs = 'true';

      if (walletAddress) {
        // check key in local storage
        if (typeof window !== 'undefined') {
          console.log('valueLs', valueLs);
          console.log('localStorage.getItem(keyLs)', localStorage.getItem(keyLs));
          if (localStorage.getItem(keyLs) && localStorage.getItem(keyLs) === valueLs) {
            return;
          }

          await trackWalletConnectedEvent();

          localStorage.setItem(keyLs, valueLs);
        }
      }
    };

    handleWalletConnected();
  }, [walletAddress]);
}
