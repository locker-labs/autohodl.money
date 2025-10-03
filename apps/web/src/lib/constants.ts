import { chain } from '@/config';
import { secrets } from './secrets';

const chainId = chain.id;

export const AUTOHODL_ADDRESSES = [
  // Linea
  '0x0',
  // Sepolia
  '0x2F5A51BE7fA829038eF58305Ef332ae1c003Ebe1',
];

export const AUTOHODL_ADDRESS = AUTOHODL_ADDRESSES[1] as `0x${string}`;

export const MM_CARD_ADDRESSES = [
  // US
  '0xA90b298d05C2667dDC64e2A4e17111357c215dD2',

  // International
  '0x9dd23A4a0845f10d65D293776B792af1131c7B30',

  // Locker checking
  '0x1ECF3f51A771983C150b3cB4A2162E89c0A046Fc',
];

export const MMC_TOKENS = [
  // USDC on Linea
  '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
];

// https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_ADDRESSES = [
  // Linea
  '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',

  // Ethereum Sepolia
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',

  // Linea Sepolia
  '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',

  // AAVE on Sepolia
  '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
];

export const USDC_ADDRESS = USDC_ADDRESSES[1] as `0x${string}`;

// Aave Addresses
// https://aave.com/docs/resources/addresses

// Aave Deployment Networks
// https://aave.com/help/aave-101/accessing-aave

// https://aave.com/docs/developers/smart-contracts/pool

export const AavePoolAddressMap: Record<number, `0x${string}`> = {
  59144: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac', // Linea
  // Not available on linea sepolia
  11155111: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Sepolia
};

// https://aave.com/docs/developers/smart-contracts/pool-addresses-provider

export const AavePoolAddressesProviderMap: Record<number, `0x${string}`> = {
  59144: '0x89502c3731F69DDC95B65753708A07F8Cd0373F4', // Linea
  // Not available on linea sepolia
  11155111: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A', // Sepolia
};

// https://aave.com/docs/developers/smart-contracts/view-contracts#uipooldataprovider

export const AaveUiPoolDataProviderMap: Record<number, `0x${string}`> = {
  59144: '0xf751969521E20A972A0776CDB0497Fad0F773F1F', // Linea
  // Not available on linea sepolia
  11155111: '0x69529987FA4A075D0C00B0128fa848dc9ebbE9CE', // Sepolia
};

export const TokenAddressMap: Record<number, `0x${string}`> = {
  59144: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC Linea
  59141: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7', // USDC Linea Sepolia
  11155111: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // AAVE Sepolia
};

export const TokenDecimalMap: Record<`0x${string}`, number> = {
  '0x176211869cA2b568f2A7D4EE941E073a821EE1ff': 6, // USDC Linea
  '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7': 6, // USDC Linea Sepolia
  '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a': 18, // AAVE Sepolia
};

export const AAVE_POOL_ADDRESS = AavePoolAddressMap[chainId];

export const AAVE_POOL_ADDRESSES_PROVIDER = AavePoolAddressesProviderMap[chainId];

export const AAVE_UI_POOL_DATA_PROVIDER = AaveUiPoolDataProviderMap[chainId];

export const TOKEN_ADDRESS = TokenAddressMap[chainId];

export const TOKEN_DECIMALS = TokenDecimalMap[TOKEN_ADDRESS];

export const TOKEN_DECIMAL_MULTIPLIER = 10 ** TOKEN_DECIMALS;

export const DELEGATE = secrets.delegate;
