import type { Address, Chain } from 'viem';
import { base, arcTestnet, linea, sepolia } from 'viem/chains';
import { secrets } from '@/lib/secrets';
import { AaveV3Base, AaveV3Linea, AaveV3Sepolia } from '@bgd-labs/aave-address-book';

/**
 * App supported Chains and Accounts config
 */

enum EChainId {
  Base = 8453,
  ArcTestnet = 5042002,
  Linea = 59144,
  Sepolia = 11155111,
}

const mockDefaultChainId = EChainId.Linea;

enum SupportedAccounts {
  MetaMask = 'MetaMask Card',
  EOA = 'EOA Wallet',
}

const ViemChainMap: Record<EChainId, Chain> = {
  [EChainId.Base]: base,
  [EChainId.ArcTestnet]: arcTestnet,
  [EChainId.Linea]: linea,
  [EChainId.Sepolia]: sepolia,
};

const ViemChainNameMap: Record<EChainId, string> = {
  [EChainId.Base]: 'Base',
  [EChainId.ArcTestnet]: 'Arc Testnet',
  [EChainId.Linea]: 'Linea',
  [EChainId.Sepolia]: 'Sepolia',
};

const ViemChainImageMap: Record<EChainId, string> = {
  [EChainId.Base]: '/base-logo.jpeg',
  [EChainId.Linea]: '/LineaLogomarkBlueBG.svg',
  [EChainId.Sepolia]: '/ethereum-eth.svg',
  [EChainId.ArcTestnet]: '/arc-logo.png',
};

/**
 * MetaMask Card addresses
 */

const MetaMaskCardAddressMap: Record<EChainId, { US: Address; International: Address } | null> = {
  [EChainId.Base]: null,
  [EChainId.Linea]: {
    US: '0xA90b298d05C2667dDC64e2A4e17111357c215dD2',
    International: '0x9dd23A4a0845f10d65D293776B792af1131c7B30',
  },
  [EChainId.Sepolia]: null,
  [EChainId.ArcTestnet]: null,
};

/**
 * Alchemy constants
 */

const AlchemyChainMap: Record<EChainId, string> = {
  [EChainId.Base]: 'base-mainnet',
  [EChainId.ArcTestnet]: 'arc-testnet',
  [EChainId.Linea]: 'linea-mainnet',
  [EChainId.Sepolia]: 'eth-sepolia',
} as const;

function getAlchemyApiUrl(chainId: EChainId): string {
  return `https://${AlchemyChainMap[chainId]}.g.alchemy.com/v2/${secrets.alchemyApiKey}`;
}

const AlchemyApiUrlMap: Record<EChainId, string> = {
  [EChainId.Base]: getAlchemyApiUrl(EChainId.Base),
  [EChainId.ArcTestnet]: getAlchemyApiUrl(EChainId.ArcTestnet),
  [EChainId.Linea]: getAlchemyApiUrl(EChainId.Linea),
  [EChainId.Sepolia]: getAlchemyApiUrl(EChainId.Sepolia),
};

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
  [EChainId.Base]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [EChainId.ArcTestnet]: '0x3600000000000000000000000000000000000000',
  [EChainId.Linea]: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  [EChainId.Sepolia]: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // AAVE
} as const satisfies TChainIdMap<Address>;

type TUsdcAddress = (typeof UsdcAddressMap)[keyof typeof UsdcAddressMap];

const USDC_ADDRESSES: TUsdcAddress[] = Object.values(UsdcAddressMap);
const USDC_ADDRESS_SET = new Set<TUsdcAddress>(Object.values(UsdcAddressMap));

const SUPPORTED_TOKENS = [...USDC_ADDRESSES];

/**
 * SUSDC
 */

const SusdcAddressMap = {
  [EChainId.Base]: '0xd10ce4b20f4e00EB9402A83932b6eD45E9C7c1a5',
  [EChainId.ArcTestnet]: '0x',
  [EChainId.Linea]: '0x060c1cBE54a34deCE77f27ca9955427c0e295Fd4',
  [EChainId.Sepolia]: '0x9480D1c619A92F5434204072bdFBb48f16915920',
} as const satisfies TChainIdMap<Address>;

type TSusdcAddress = (typeof SusdcAddressMap)[keyof typeof SusdcAddressMap];

const SUSDC_ADDRESS_SET = new Set<TSusdcAddress>(Object.values(SusdcAddressMap));

/**
 * Token Decimals
 */

type TTokenAddress = TUsdcAddress | TSusdcAddress;

const TokenDecimalMap = {
  [SusdcAddressMap[EChainId.Base]]: 6,
  [SusdcAddressMap[EChainId.ArcTestnet]]: 6,
  [SusdcAddressMap[EChainId.Linea]]: 6,
  [SusdcAddressMap[EChainId.Sepolia]]: 18,

  [UsdcAddressMap[EChainId.Base]]: 6,
  [UsdcAddressMap[EChainId.ArcTestnet]]: 6,
  [UsdcAddressMap[EChainId.Linea]]: 6,
  [UsdcAddressMap[EChainId.Sepolia]]: 18,
} as const satisfies Record<TTokenAddress, number>;

/**
 * Token Tickers
 */

const TokenTickerMap = {
  [SusdcAddressMap[EChainId.Base]]: 'sUSDC',
  [SusdcAddressMap[EChainId.ArcTestnet]]: 'sUSDC',
  [SusdcAddressMap[EChainId.Linea]]: 'sUSDC',
  [SusdcAddressMap[EChainId.Sepolia]]: 'sAAVE',

  [UsdcAddressMap[EChainId.Base]]: 'USDC',
  [UsdcAddressMap[EChainId.ArcTestnet]]: 'USDC',
  [UsdcAddressMap[EChainId.Linea]]: 'USDC',
  [UsdcAddressMap[EChainId.Sepolia]]: 'AAVE',
} as const satisfies Record<TTokenAddress, string>;

/**
 * AutoHodl Contract Address
 */

const AutoHodlAddressMap = {
  [EChainId.Base]: '0xEa303aCD2c6BCeF98E9Db0475cD1db9A713A0FEc',
  [EChainId.ArcTestnet]: '0x3FF0D0Ce4B404c350872D0649F0207573e592C2b',
  [EChainId.Linea]: '0x315648b80bB18A5521440cC406E01eFE203B231f',
  [EChainId.Sepolia]: '0xD7262C19249A34Df21d7Ad509b4Ed19657d903D3',
} as const satisfies TChainIdMap<Address>;

/**
 * Delegate Contract Address
 */

const MMCardDelegateAddressMap = {
  [EChainId.Base]: '0x391F3E72C62B382e3724694dC3f04366a5922953',
  [EChainId.ArcTestnet]: '0xccb62b9449574bbda504709081919be5af34d1d0',
  [EChainId.Linea]: '0xB6848Bc4953870c796032fc860dbc8a14794C5B7',
  [EChainId.Sepolia]: '0xd247D46BC01067EcB5b94FC3Cb73A18A38Db5C33',
} as const satisfies TChainIdMap<Address>;

/**
 * Delegate and Supported Tokens
 */

const AutoHodlSupportedTokenMap = {
  [EChainId.Base]: [UsdcAddressMap[EChainId.Base]],
  [EChainId.ArcTestnet]: [UsdcAddressMap[EChainId.ArcTestnet]],
  [EChainId.Linea]: [UsdcAddressMap[EChainId.Linea]],
  [EChainId.Sepolia]: [UsdcAddressMap[EChainId.Sepolia]],
} as const satisfies TChainIdMap<Address[]>;

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
  [EChainId.Base]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as Address,
  [EChainId.Linea]: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac' as Address,
  [EChainId.Sepolia]: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address,
};

const AaveAdapterAddressMap: Record<number, Address> = {
  8453: '0x9e7456510A194043f5b9244BD9CdBfFb62C559D1', // Base
  59144: '0x8f700F57A33C7FA8d00648CE2eF9005b69030b51', // Linea
  11155111: '0xF6B9F6610bdcBbBaf4e959D66Df6cB587eCe6C8A', // Sepolia
};

const AavePoolAddressesProviderMap = {
  [EChainId.Base]: AaveV3Base.POOL_ADDRESSES_PROVIDER as Address,
  [EChainId.Linea]: '0x89502c3731F69DDC95B65753708A07F8Cd0373F4' as Address,
  [EChainId.Sepolia]: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A' as Address,
};

const AaveUiPoolDataProviderMap = {
  [EChainId.Base]: AaveV3Base.UI_POOL_DATA_PROVIDER as Address,
  [EChainId.Linea]: '0xf751969521E20A972A0776CDB0497Fad0F773F1F' as Address,
  [EChainId.Sepolia]: '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE' as Address,
};

const AaveYieldTokenAddressMap = {
  [EChainId.Base]: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB',
  [EChainId.Linea]: '0x374D7860c4f2f604De0191298dD393703Cce84f3',
  [EChainId.Sepolia]: '0x6b8558764d3b7572136F17174Cb9aB1DDc7E1259', // aEthAAVE
};

// Chain configurations
const AaveApyConfig = {
  [EChainId.Base]: {
    usdcAddress: AaveV3Base.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Base.POOL,
  },
  [EChainId.Linea]: {
    usdcAddress: AaveV3Linea.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Linea.POOL,
  },
  [EChainId.Sepolia]: {
    usdcAddress: AaveV3Sepolia.ASSETS.USDC.UNDERLYING,
    aavePoolAddress: AaveV3Sepolia.POOL,
  },
};

/**
 * Moralis Streams constants
 */

// Supported tokens to Moralis Stream ID map
const TokenToTransferStreamIdMap: Record<TUsdcAddress, string> = {
  [UsdcAddressMap[EChainId.Base]]: secrets.MoralisStreamIdEoaTransferBase,
  [UsdcAddressMap[EChainId.ArcTestnet]]: secrets.MoralisStreamIdEoaTransferArcTestnet,
  [UsdcAddressMap[EChainId.Sepolia]]: secrets.MoralisStreamIdEoaTransferSepolia,
  [UsdcAddressMap[EChainId.Linea]]: secrets.MoralisStreamIdEoaTransferLinea,
};

enum EMoralisStreamId {
  EoaTransfer = 'EoaTransfer',
  MmcWithdrawal = 'MmcWithdrawal',
}

// Chain, env specific stream IDs
const ChainToMoralisStreamIdMap = {
  [EChainId.Base]: {
    [EMoralisStreamId.EoaTransfer]: secrets.MoralisStreamIdEoaTransferBase,
    [EMoralisStreamId.MmcWithdrawal]: secrets.MoralisStreamIdMmcWithdrawalBase,
  },
  [EChainId.ArcTestnet]: {
    [EMoralisStreamId.EoaTransfer]: secrets.MoralisStreamIdEoaTransferArcTestnet,
    [EMoralisStreamId.MmcWithdrawal]: secrets.MoralisStreamIdMmcWithdrawalArcTestnet,
  },
  [EChainId.Sepolia]: {
    [EMoralisStreamId.EoaTransfer]: secrets.MoralisStreamIdEoaTransferSepolia,
    [EMoralisStreamId.MmcWithdrawal]: secrets.MoralisStreamIdMmcWithdrawalSepolia,
  },
  [EChainId.Linea]: {
    [EMoralisStreamId.EoaTransfer]: secrets.MoralisStreamIdEoaTransferLinea,
    [EMoralisStreamId.MmcWithdrawal]: secrets.MoralisStreamIdMmcWithdrawalLinea,
  },
} as const satisfies Record<EChainId, Record<EMoralisStreamId, string | null>>;

const chainIdToBlockExplorer: Record<EChainId, string> = {
  [EChainId.Base]: 'https://basescan.org',
  [EChainId.Linea]: 'https://lineascan.build',
  [EChainId.Sepolia]: 'https://sepolia.etherscan.io',
  [EChainId.ArcTestnet]: 'https://testnet.arcscan.app',
};

/**
 * App settings
 */

export const verboseLogs = secrets.VerboseLogs;
enum ERefetchInterval {
  FAST = 5000, // 5 seconds
  MEDIUM = 15000, // 15 seconds
  SLOW = 60000, // 60 seconds
}

export {
  AaveAdapterAddressMap,
  AaveYieldTokenAddressMap,
  AlchemyApiUrlMap,
  AlchemyChainMap,
  AutoHodlAddressMap,
  EChainId,
  MetaMaskCardAddressMap,
  MMCardDelegateAddressMap,
  USDC_ADDRESSES,
  USDC_ADDRESS_SET,
  UsdcAddressMap,
  TokenDecimalMap,
  TokenToTransferStreamIdMap,
  TransferEventSig,
  SUSDC_ADDRESS_SET,
  SavingConfigSetEventSigHash,
  SavingDelegatedEventSigHash,
  SUPPORTED_TOKENS,
  SupportedAccounts,
  SusdcAddressMap,
  ViemChainMap,
  AaveUiPoolDataProviderMap,
  AavePoolAddressMap,
  AavePoolAddressesProviderMap,
  AaveApyConfig,
  mockDefaultChainId,
  AutoHodlSupportedTokenMap,
  ViemChainImageMap,
  ViemChainNameMap,
  TokenTickerMap,
  EMoralisStreamId,
  ChainToMoralisStreamIdMap,
  ERefetchInterval,
  chainIdToBlockExplorer,
};

export type { TUsdcAddress, TSusdcAddress, TTokenAddress };
