# Steps to add a new chain in apps/web

## 1. Update Constants
File: `src/lib/constants.ts`

1.  Add the new chain ID to `EChainId` enum.
2.  Update `ViemChainMap` with the chain object imported from `viem/chains`.
3.  Update `AlchemyChainMap` and `AlchemyApiUrlMap` with the Alchemy network key.
4.  Update Address Maps with the contract addresses for the new chain:
    - `UsdcAddressMap`
    - `SusdcAddressMap`
    - `TokenDecimalMap` (for both USDC and sUSDC)
    - `AutoHodlAddressMap`
    - `MMCardDelegateAddressMap`
    - `AutoHodlSupportedTokenMap`
5.  If the chain supports Aave, update:
    - `AavePoolAddressMap`
    - `AaveAdapterAddressMap`
    - `AavePoolAddressesProviderMap`
    - `AaveUiPoolDataProviderMap`
    - `AaveYieldTokenAddressMap`
    - `AaveApyConfig`

## 2. Update App Configuration
File: `src/config/index.ts`

1.  Import the chain definition from `@reown/appkit/networks` (for AppKit) and `viem/chains` (for Viem).
    - If the chain is not available in AppKit, define it manually using `defineChain`.
2.  Add the chain to the `networks` array (AppKit networks).
3.  Add the chain to the `chains` array.

## 3. Init Viem Public Client
File: `src/lib/clients/viemPublicClient.ts`

1.  Create a new public client instance for the chain using `createPublicClientForChain(EChainId.MyNewChain)`.
2.  Add the new client instance to `ViemPublicClientMap`.

## 4. Update Chain Preferences
File: `src/config/chainPreference.ts`

1.  Update `getPreferredChainId` to include the new chain in the priority logic.
