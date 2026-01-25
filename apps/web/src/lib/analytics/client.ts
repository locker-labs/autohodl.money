import Analytics from '@rudderstack/rudder-sdk-node';
import { secrets } from '@/lib/secrets';

const client = new Analytics(secrets.rudderstackWriteKey, {
  dataPlaneUrl: secrets.rudderstackDataPlaneUrl,
  flushAt: 1, // Send immediately for serverless
  flushInterval: 1000, // Flush every 1 second
  logLevel: 'info',
});

export { client as rudderanalytics };
