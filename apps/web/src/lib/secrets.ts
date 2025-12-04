export const secrets = {
  MoralisApiKey: process.env.MORALIS_API_KEY || '',
  MoralisStreamSecret: process.env.MORALIS_STREAM_SECRET || '',
  env: process.env.NEXT_PUBLIC_ENV || 'development',
  reownProjectId: process.env.NEXT_PUBLIC_PROJECT_ID || '',
  privateKeyExecutor: process.env.PRIVATE_KEY_EXECUTOR || '',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
  savingsFrom: process.env.SAVINGS_FROM_ADDRESS || '',
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '',
  MoralisStreamIdEoaTransfer: process.env.MORALIS_STREAM_ID_EOA_TRANSFER || '',
  MoralisStreamIdMmcWithdrawal: process.env.MORALIS_STREAM_ID_MMC_WITHDRAWAL || '',
};
