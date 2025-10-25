export const secrets = {
  MoralisApiKey: process.env.MORALIS_API_KEY || '',
  MoralisStreamSecret: process.env.MORALIS_STREAM_SECRET || '',
  env: process.env.NEXT_PUBLIC_ENV || 'development',
  reownProjectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  delegate: process.env.NEXT_PUBLIC_DELEGATE || '',
  privateKeyDelegate: process.env.PRIVATE_KEY_DELEGATE || '',
  rpcUrl: process.env.RPC_URL || '',
  savingsFrom: process.env.SAVINGS_FROM_ADDRESS || '',
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
};
