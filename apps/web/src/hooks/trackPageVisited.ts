'use client';
// This hook should be called only once in the app

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

export function trackPageVisited() {
  const { trackPageVisitedEvent } = useAnalytics();

  useEffect(() => {
    const handlePageVisited = async () => {
      const keyLs = `autohodl.page_visited`;
      const valueLs = 'true';

      // check key in local storage
      if (typeof window !== 'undefined') {
        if (localStorage.getItem(keyLs) && localStorage.getItem(keyLs) === valueLs) {
          return;
        }

        await trackPageVisitedEvent();
        localStorage.setItem(keyLs, valueLs);
      }
    };

    handlePageVisited();
  }, []);
}
