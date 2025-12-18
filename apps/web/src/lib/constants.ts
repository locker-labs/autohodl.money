import type { Address } from 'viem';
import { chain } from '@/config';
import { secrets } from './secrets';

const chainId = chain.id;

/**
 * App supported Chains and Accounts config
 */

enum EChainId {
  ArcTestnet = 5042002,
  Linea = 59144,
  Sepolia = 11155111,
}

enum SupportedAccounts {
  MetaMask = 'MetaMask Card',
  EOA = 'EOA Wallet',
}

/**
 * MetaMask Card addresses
 */

const MetaMaskCard = {
  US: '0xA90b298d05C2667dDC64e2A4e17111357c215dD2',
  International: '0x9dd23A4a0845f10d65D293776B792af1131c7B30',
} as const;

/**
 * Alchemy constants
 */

const AlchemyChainMap: Record<EChainId, string> = {
  [EChainId.ArcTestnet]: 'arc-testnet',
  [EChainId.Linea]: 'linea-mainnet',
  [EChainId.Sepolia]: 'eth-sepolia',
} as const;

function getAlchemyApiUrl(chainId: EChainId): string {
  return `https://${AlchemyChainMap[chainId]}.g.alchemy.com/v2/${secrets.alchemyApiKey}`;
}

const AlchemyApiUrlMap = {
  [EChainId.ArcTestnet]: getAlchemyApiUrl(EChainId.ArcTestnet),
  [EChainId.Linea]: getAlchemyApiUrl(EChainId.Linea),
  [EChainId.Sepolia]: getAlchemyApiUrl(EChainId.Sepolia),
};

const ALCHEMY_API_URL = `https://${AlchemyChainMap[chain.id]}.g.alchemy.com/v2/${secrets.alchemyApiKey}`;

/**
 * Contract event constants
 */

const TransferEventSig = 'Transfer(address,address,uint256)';
const SavingConfigSetEventSigHash = '0x65ffc51d687a08ab0d99951353c570081e516436bbf9c43a74a3ac35987d8b7f';
const SavingDelegatedEventSigHash = '0x405126e05ad9b5ccd76214f859fe5de73a75910b25e4c4604aa0d4e6bac511f9';

/**
 * Token and Contract Addresses on supported chains
 */

type TChainIdMap<T> = Record<EChainId, T>;

/**
 * USDC
 */

const UsdcAddressMap = {
  [EChainId.ArcTestnet]: '0x3600000000000000000000000000000000000000',
  [EChainId.Linea]: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  [EChainId.Sepolia]: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // AAVE
} as const satisfies TChainIdMap<Address>;

type TUsdcAddress = (typeof UsdcAddressMap)[keyof typeof UsdcAddressMap];

const USDC_ADDRESSES: TUsdcAddress[] = Object.values(UsdcAddressMap);
const USDC_ADDRESS: TUsdcAddress = UsdcAddressMap[chainId];
const USDC_ADDRESS_SET = new Set<TUsdcAddress>(Object.values(UsdcAddressMap));

/**
 * SUSDC
 */

const SusdcAddressMap = {
  [EChainId.ArcTestnet]: '0x',
  [EChainId.Linea]: '0x060c1cBE54a34deCE77f27ca9955427c0e295Fd4',
  [EChainId.Sepolia]: '0x9480D1c619A92F5434204072bdFBb48f16915920',
} as const satisfies TChainIdMap<Address>;

type TSusdcAddress = (typeof SusdcAddressMap)[keyof typeof SusdcAddressMap];

const SUSDC_ADDRESS: TSusdcAddress = SusdcAddressMap[chainId];
const SUSDC_ADDRESS_SET = new Set<TSusdcAddress>(Object.values(SusdcAddressMap));

/**
 * Token Decimals
 */

type TTokenAddress = TUsdcAddress | TSusdcAddress;

const TokenDecimalMap = {
  [SusdcAddressMap[EChainId.ArcTestnet]]: 6,
  [SusdcAddressMap[EChainId.Linea]]: 6,
  [SusdcAddressMap[EChainId.Sepolia]]: 18,

  [UsdcAddressMap[EChainId.ArcTestnet]]: 6,
  [UsdcAddressMap[EChainId.Linea]]: 6,
  [UsdcAddressMap[EChainId.Sepolia]]: 18,
} as const satisfies Record<TTokenAddress, number>;

const TOKEN_DECIMALS = TokenDecimalMap[USDC_ADDRESS];

/**
 * AutoHodl Contract Address
 */

const AutoHodlAddressMap = {
  [EChainId.ArcTestnet]: '0x',
  [EChainId.Linea]: '0x315648b80bB18A5521440cC406E01eFE203B231f',
  [EChainId.Sepolia]: '0xD7262C19249A34Df21d7Ad509b4Ed19657d903D3',
} as const satisfies TChainIdMap<Address>;

const AUTOHODL_ADDRESS = AutoHodlAddressMap[chainId];

/**
 * Delegate Contract Address
 */

const MMCardDelegateAddressMap = {
  [EChainId.ArcTestnet]: '0x',
  [EChainId.Linea]: '0xB6848Bc4953870c796032fc860dbc8a14794C5B7',
  [EChainId.Sepolia]: '0x7c334f35BF2B4a9e55f60CF3287c885598cF9A02',
} as const satisfies TChainIdMap<Address>;

const DELEGATE = MMCardDelegateAddressMap[chainId]; // User has to approve this delegate to allow MM Card to spend on their behalf

/**
 * Delegate and Supported Tokens
 */

const AutoHodlSupportedTokenMap = {
  [EChainId.ArcTestnet]: [UsdcAddressMap[EChainId.ArcTestnet]],
  [EChainId.Linea]: [UsdcAddressMap[EChainId.Linea]],
  [EChainId.Sepolia]: [UsdcAddressMap[EChainId.Sepolia]],
} as const satisfies TChainIdMap<Address[]>;

const AUTOHODL_SUPPORTED_TOKENS = AutoHodlSupportedTokenMap[chainId];

// type TokenDecimalMapType = ;

/**
 * Aave addresses
 */

// Aave Addresses: https://aave.com/docs/resources/addresses
// Aave Deployment Networks: https://aave.com/help/aave-101/accessing-aave
// Aave Pool: https://aave.com/docs/developers/smart-contracts/pool
// Aave Pool Address Provider: https://aave.com/docs/developers/smart-contracts/pool-addresses-provider
// Aave UI Pool Data Provider: https://aave.com/docs/developers/smart-contracts/view-contracts#uipooldataprovider

const AavePoolAddressMap = {
  [EChainId.Linea]: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac' as Address,
  [EChainId.Sepolia]: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address,
};
const AAVE_POOL_ADDRESS = AavePoolAddressMap[chainId];

const AaveAdapterAddressMap: Record<number, Address> = {
  59144: '0x8f700F57A33C7FA8d00648CE2eF9005b69030b51', // Linea
  11155111: '0xF6B9F6610bdcBbBaf4e959D66Df6cB587eCe6C8A', // Sepolia
};

const AavePoolAddressesProviderMap = {
  [EChainId.Linea]: '0x89502c3731F69DDC95B65753708A07F8Cd0373F4' as Address,
  [EChainId.Sepolia]: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A' as Address,
};
const AAVE_POOL_ADDRESSES_PROVIDER = AavePoolAddressesProviderMap[chainId];

const AaveUiPoolDataProviderMap = {
  [EChainId.Linea]: '0xf751969521E20A972A0776CDB0497Fad0F773F1F' as Address,
  [EChainId.Sepolia]: '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE' as Address,
};
const AAVE_UI_POOL_DATA_PROVIDER = AaveUiPoolDataProviderMap[chainId];

const AaveYieldTokenAddressMap = {
  [EChainId.Linea]: '0x374D7860c4f2f604De0191298dD393703Cce84f3',
  [EChainId.Sepolia]: '0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259', // aEthAAVE
};

/**
 * Moralis Streams constants
 */

// Supported tokens to Moralis Stream ID map
const TokenToTransferStreamIdMap: Record<TUsdcAddress, string> = {
  [UsdcAddressMap[EChainId.ArcTestnet]]: secrets.MoralisStreamIdEoaTransfer,
  [UsdcAddressMap[EChainId.Sepolia]]: secrets.MoralisStreamIdEoaTransfer,
  [UsdcAddressMap[EChainId.Linea]]: secrets.MoralisStreamIdEoaTransfer,
};

const MoralisStreamId = {
  MmcWithdrawal: secrets.MoralisStreamIdMmcWithdrawal,
  EoaTransfer: secrets.MoralisStreamIdEoaTransfer,
};

/**
 * App settings
 */

export const verboseLogs = secrets.VerboseLogs;

export {
  AAVE_POOL_ADDRESS,
  AAVE_POOL_ADDRESSES_PROVIDER,
  AAVE_UI_POOL_DATA_PROVIDER,
  AaveAdapterAddressMap,
  AaveYieldTokenAddressMap,
  ALCHEMY_API_URL,
  AlchemyApiUrlMap,
  AlchemyChainMap,
  AUTOHODL_ADDRESS,
  AUTOHODL_SUPPORTED_TOKENS,
  EChainId,
  DELEGATE,
  MetaMaskCard,
  MoralisStreamId,
  USDC_ADDRESS,
  USDC_ADDRESSES,
  USDC_ADDRESS_SET,
  UsdcAddressMap,
  TOKEN_DECIMALS,
  TokenDecimalMap,
  TokenToTransferStreamIdMap,
  TransferEventSig,
  SUSDC_ADDRESS,
  SUSDC_ADDRESS_SET,
  SavingConfigSetEventSigHash,
  SavingDelegatedEventSigHash,
  SupportedAccounts,
  SusdcAddressMap,
};

export type { TUsdcAddress, TSusdcAddress, TTokenAddress };
