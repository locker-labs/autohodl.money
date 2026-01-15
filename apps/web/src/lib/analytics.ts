import RudderAnalytics from '@rudderstack/rudder-sdk-node';
import { secrets } from './secrets';

const rudderanalytics = new RudderAnalytics(secrets.rudderstackWriteKey, {
  dataPlaneUrl: secrets.rudderstackDataPlaneUrl,
});

export type TTrackEventProperties = {
  twclid: string;
  walletAddress: string;
  savingsChainId: number;
  allowance?: number;
  transactionHash?: string;
  ip?: string;
  userAgent?: string;
};

export function trackEvent(event: string, properties: TTrackEventProperties) {
  try {
    const params = {
      event,
      userId: properties.walletAddress,
      properties: {
        twclid: properties.twclid,
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
    rudderanalytics.track(params);
    console.log(`${event} event tracked:`, params);
  } catch (error) {
    console.error(`${event} event tracking failed:`, error);
  }
}

export default rudderanalytics;
