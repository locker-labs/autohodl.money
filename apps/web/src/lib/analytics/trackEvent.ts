import { rudderanalytics as client } from './client';

export type TTrackEventProperties = {
  twclid?: string;
  walletAddress: string;
  savingsChainId: number;
  allowance?: number;
  transactionHash?: string;
  ip?: string;
  userAgent?: string;
};

export async function trackEvent(event: string, properties: TTrackEventProperties) {
  try {
    const params: {
      event: string;
      userId: string;
      properties: {
        twclid?: string;
        ip_address?: string;
        user_agent?: string;
        conversionId: string;
        description: string;
      };
    } = {
      event,
      userId: properties.walletAddress,
      properties: {
        ip_address: properties.ip,
        user_agent: properties.userAgent,
        conversionId: `${event.split(' ').join('_').toLowerCase()}:${properties.walletAddress}`,
        description: `chain:${properties.savingsChainId} ${
          properties.allowance
            ? `allowance:${properties.allowance}`
            : properties.transactionHash
              ? `transaction_hash:${properties.transactionHash}`
              : 'wallet_connected'
        }`,
      },
    };
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
