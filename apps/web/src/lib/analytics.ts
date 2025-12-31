import RudderAnalytics from '@rudderstack/rudder-sdk-node';
import { secrets } from './secrets';

const rudderanalytics = new RudderAnalytics(secrets.rudderstackWriteKey, {
  dataPlaneUrl: secrets.rudderstackDataPlaneUrl,
});

export function trackEvent(event: string, properties: Record<string, string | number>) {
  try {
    const params = {
      event,
      userId: properties.walletAddress ? String(properties.walletAddress) : 'anonymous',
      properties: {
        contents: properties,
      },
    };
    rudderanalytics.track(params);
    console.log('Event tracked successfully with params:', params);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export default rudderanalytics;
