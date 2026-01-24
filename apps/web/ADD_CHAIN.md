# Steps to Add a New Chain in apps/web

This guide walks through all the files and configurations needed to add support for a new chain.

---

## 1. Update Constants (`src/lib/constants.ts`)

This is the main file containing chain-related mappings.

### 1.1 Add Chain Import

```typescript
import { base, arcTestnet, linea, sepolia } from 'viem/chains';
import { AaveV3Base, AaveV3Linea, AaveV3Sepolia } from '@bgd-labs/aave-address-book';
```

### 1.2 Add Chain ID to Enum

```typescript
enum EChainId {
  Base = 8453,        // <-- Add your new chain
  ArcTestnet = 5042002,
  Linea = 59144,
  Sepolia = 11155111,
}
```

### 1.3 Update Chain Maps

Add entries to **all** of the following maps:

| Map | Description | Example Value |
|-----|-------------|---------------|
| `ViemChainMap` | Viem chain object | `[EChainId.Base]: base` |
| `ViemChainNameMap` | Human-readable name | `[EChainId.Base]: 'Base'` |
| `ViemChainImageMap` | Chain logo path (in `/public`) | `[EChainId.Base]: '/base-logo.png'` |
| `MetaMaskCardAddressMap` | MetaMask Card addresses or `null` | `[EChainId.Base]: null` |
| `AlchemyChainMap` | Alchemy network identifier | `[EChainId.Base]: 'base-mainnet'` |
| `AlchemyApiUrlMap` | Alchemy API URL | `[EChainId.Base]: getAlchemyApiUrl(EChainId.Base)` |

### 1.4 Update Token Address Maps

| Map | Description |
|-----|-------------|
| `UsdcAddressMap` | USDC token address on the chain |
| `SusdcAddressMap` | sUSDC (savings USDC) token address |
| `TokenDecimalMap` | Decimals for both USDC and sUSDC |
| `TokenTickerMap` | Ticker symbols (`'USDC'`, `'sUSDC'`) |

### 1.5 Update Contract Address Maps

| Map | Description |
|-----|-------------|
| `AutoHodlAddressMap` | AutoHodl contract address |
| `MMCardDelegateAddressMap` | MetaMask Card delegate address |
| `AutoHodlSupportedTokenMap` | Array of supported tokens for AutoHodl |

### 1.6 Update Aave Maps (if chain supports Aave)

| Map | Description |
|-----|-------------|
| `AavePoolAddressMap` | Aave Pool address |
| `AaveAdapterAddressMap` | Aave Adapter address (uses raw chain ID number) |
| `AavePoolAddressesProviderMap` | Aave Pool Addresses Provider |
| `AaveUiPoolDataProviderMap` | Aave UI Pool Data Provider |
| `AaveYieldTokenAddressMap` | Aave yield token (aToken) address |
| `AaveApyConfig` | USDC address and Aave pool for APY calculations |

### 1.7 Update Moralis Stream Map

| Map | Description |
|-----|-------------|
| `ChainToMoralisStreamIdMap` | Maps chain to `EoaTransfer` and `MmcWithdrawal` stream IDs |

### 1.8 Update Block Explorer

Add the chain's block explorer URL:

```typescript
const chainIdToBlockExplorer: Record<EChainId, string> = {
  [EChainId.Base]: 'https://basescan.org',
  [EChainId.Linea]: 'https://lineascan.build',
  // ...
};
```

---

## 2. Update Secrets (`src/lib/secrets.ts`)

Add new environment variables for Moralis stream IDs:

```typescript
MoralisStreamIdEoaTransferBase: process.env.MORALIS_STREAM_ID_EOA_TRANSFER_BASE || '',
MoralisStreamIdMmcWithdrawalBase: process.env.MORALIS_STREAM_ID_MMC_WITHDRAWAL_BASE || '',
```

**Don't forget** to add these env vars to:
- `.env.local` (local development)
- `.env.example` (documentation)
- Deployment environments (Vercel, etc.)

---

## 3. Update App Configuration (`src/config/index.ts`)

### 3.1 Import Chain Definitions

```typescript
// AppKit network
import {
  base as baseAppKit,
  linea as lineaAppKit,
  sepolia as sepoliaAppKit,
} from '@reown/appkit/networks';

// Viem chain
import {
  base,
  linea,
  sepolia,
} from 'viem/chains';
```

> **Note**: If the chain is not available in `@reown/appkit/networks`, define it manually using `defineChain()`.

### 3.2 Add to Network Arrays

```typescript
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [baseAppKit, lineaAppKit, sepoliaAppKit];
export const chains: Chain[] = [base, linea, sepolia];
```

---

## 4. Update Viem Public Client (`src/lib/clients/viemPublicClient.ts`)

Create and export a public client for the chain:

```typescript
const baseClient = createPublicClientForChain(EChainId.Base);

export const ViemPublicClientMap: Record<EChainId, PublicClient> = {
  [EChainId.Base]: baseClient,
};
```

---

## 5. Update Viem Wallet Client (`src/lib/clients/server/viemWalletClient.ts`)

Create and export a wallet client for the chain:

```typescript
const baseClient = createWalletClientForChain(EChainId.Base);

export const ViemWalletClientMap: Record<EChainId, WalletClient> = {
  [EChainId.Base]: baseClient,
};
```

---

## 6. Add Chain Logo Asset

Add the chain's logo image to `/public`:
- Example: `/public/base-logo.png`
- Ensure the path matches what you set in `ViemChainImageMap`

---

## Required Contract Addresses

When adding a new chain, you'll need the following addresses:

| Address Type | Source |
|--------------|--------|
| USDC Token | Chain's token list or explorer |
| sUSDC Token | Your deployment |
| AutoHodl Contract | Your deployment |
| MMCard Delegate | Your deployment |
| Aave Pool | [Aave Address Book](https://github.com/bgd-labs/aave-address-book) or Aave docs |
| Aave Adapter | Your deployment |
| Aave aToken (yield token) | Aave docs for the chain |
