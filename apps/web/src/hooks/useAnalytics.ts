import { useAccount } from 'wagmi';
import { EAnalyticsEvent } from '@/types/analytics';

export function useAnalytics() {
  const { address: walletAddress, chainId: savingsChainId } = useAccount();

  const trackAnalyticsEvent = async (event: EAnalyticsEvent, properties?: Record<string, string | number>) => {
    if (!event) {
      console.error('Event name is required to track analytics event');
      return;
    }
    if (!walletAddress) {
      console.error('Wallet address is required to track analytics event');
      return;
    }

    try {
      const response = await fetch('/api/v1/analytics/rudderstack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: event,
          walletAddress,
          savingsChainId: savingsChainId ?? null,
          ...(properties ?? {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }

    return;
  };

  const trackWalletConnectedEvent = async () => {
    await trackAnalyticsEvent(EAnalyticsEvent.WalletConnected);
  };

  const trackAllowanceSetEvent = async (allowance: number) => {
    if (allowance === null || allowance === undefined) {
      console.error('Allowance value is required to track allowance set event');
      return;
    }

    await trackAnalyticsEvent(EAnalyticsEvent.AllowanceSet, { allowance });
  };

  const trackConfigSetEvent = async (transactionHash: string) => {
    if (!transactionHash) {
      console.error('Transaction hash is required to track config set event');
      return;
    }
    await trackAnalyticsEvent(EAnalyticsEvent.ConfigSet, { transactionHash });
  };

  return {
    trackAllowanceSetEvent,
    trackAnalyticsEvent,
    trackConfigSetEvent,
    trackWalletConnectedEvent,
  };
}
