import { EAnalyticsEvent } from '@/types/analytics';
import { rudderanalytics as client } from './client';

export type TTrackEventProperties = {
  twclid?: string;
  anonymousId: string;
  walletAddress: string;
  savingsChainId: number;
  allowance?: number;
  transactionHash?: string;
  ip: string;
  userAgent: string;
};

export async function aliasEvent(
  previousId: string,
  userId: string,
  properties: { ip: string; userAgent: string; twclid?: string },
) {
  try {
    const aliasParams = {
      previousId,
      userId,
      context: {
        ip: properties.ip,
        userAgent: properties.userAgent,
      },
      traits: {},
    };

    if (properties.twclid) {
      aliasParams.traits = { twclid: properties.twclid };
    }

    client.alias(aliasParams);
    console.log('Alias call tracked:', aliasParams);

    await client.flush();
    console.log('Alias call flushed successfully');
  } catch (error) {
    console.error('Alias call tracking/flushing failed:', error);
  }
}

export async function trackEvent(event: string, properties: TTrackEventProperties) {
  try {
    let params:
      | {
          event: string;
          anonymousId: string;
          context: {
            ip: string;
            userAgent: string;
          };
          properties: {
            twclid?: string;
            conversionId: string;
            description: string;
          };
        }
      | {
          event: string;
          userId: string;
          context: {
            ip: string;
            userAgent: string;
          };
          properties: {
            twclid?: string;
            conversionId: string;
            description: string;
          };
        };

    if (event === EAnalyticsEvent.PageVisited) {
      params = {
        event,
        anonymousId: properties.anonymousId || '',
        context: {
          ip: properties.ip,
          userAgent: properties.userAgent,
        },
        properties: {
          conversionId: `${event.split(' ').join('_').toLowerCase()}`,
          description: 'page_visited',
        },
      };
    } else {
      params = {
        event,
        userId: properties.walletAddress,
        context: {
          ip: properties.ip,
          userAgent: properties.userAgent,
        },
        properties: {
          conversionId: `${event.split(' ').join('_').toLowerCase()}:${properties.walletAddress}`,
          description: `chain:${properties.savingsChainId} ${
            properties.allowance
              ? `allowance:${properties.allowance}`
              : properties.transactionHash
                ? `transaction_hash:${properties.transactionHash}`
                : event === EAnalyticsEvent.WalletConnected
                  ? 'wallet_connected'
                  : 'unknown_event'
          }`,
        },
      };
    }

    if (properties.twclid) {
      params.properties.twclid = properties.twclid;
    }

    client.track(params);
    console.log(`${event} event tracked:`, params);

    await client.flush();
    console.log(`${event} event flushed successfully`);
  } catch (error) {
    console.error(`${event} event tracking/flushing failed:`, error);
  }
}
