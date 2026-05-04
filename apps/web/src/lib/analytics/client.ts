import Analytics from '@rudderstack/rudder-sdk-node';
import { secrets } from '@/lib/secrets';

let _client: Analytics | null = null;

function getClient(): Analytics {
  if (!_client) {
    _client = new Analytics(secrets.rudderstackWriteKey, {
      dataPlaneUrl: secrets.rudderstackDataPlaneUrl,
      flushAt: 1,
      flushInterval: 1000,
      logLevel: 'info',
    });
  }
  return _client;
}

export { getClient as rudderanalytics };
