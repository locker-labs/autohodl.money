import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['bull', '@rudderstack/rudder-sdk-node'],
  turbopack: {
    resolveAlias: {
      // @wagmi/core@3.4.x experimentally imports this optional peer at runtime.
      // We stub it so Turbopack's static resolver doesn't fail the build.
      accounts: './src/stubs/accounts.ts',
    },
  },
};

export default nextConfig;
