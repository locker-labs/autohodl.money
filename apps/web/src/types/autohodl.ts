import type { Address, Hex } from 'viem';

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
};

export function parseSavingsConfig(arr: SavingsConfigArray | Readonly<SavingsConfigArray>): SavingsConfig {
  return {
    savingAddress: arr[0],
    delegate: arr[1],
    roundUp: arr[2],
    active: arr[3],
    toYield: arr[4],
    extraData: arr[5],
  };
}
