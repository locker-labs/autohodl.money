import { type Address, decodeAbiParameters, type Hex } from 'viem';

export type SavingsConfigArray = [
  Address, // savingAddress
  Address, // delegate
  bigint, // roundUp
  boolean, // active
  boolean, // toYield
  Hex, // extraData
];

export type SavingsConfig = {
  savingAddress: Address;
  delegate: Address;
  roundUp: bigint;
  active: boolean;
  toYield: boolean;
  extraData: Hex;
  mode: SavingsMode;
};

export enum SavingsMode {
  MetamaskCard = 'metamask-card',
  All = 'all',
}

export const extraDataParams = [{ type: 'string' }] as const;

export function parseSavingsConfig(arr: SavingsConfigArray | Readonly<SavingsConfigArray>): SavingsConfig {
  let mode: SavingsMode = SavingsMode.All;
  if (arr[5] && arr[5] !== '0x') {
    const decoded = decodeAbiParameters(extraDataParams, arr[5]);
    if (decoded[0]) {
      mode = decoded[0] as SavingsMode;
    }
  }

  return {
    savingAddress: arr[0],
    delegate: arr[1],
    roundUp: arr[2],
    active: arr[3],
    toYield: arr[4],
    extraData: arr[5],
    mode,
  };
}

export type SourceTxInfo = { sourceTxHash: Hex; purchaseAmount: bigint; sourceChainId: number };
