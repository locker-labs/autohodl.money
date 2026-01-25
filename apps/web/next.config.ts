import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['bull', '@rudderstack/rudder-sdk-node'],
};

export default nextConfig;
