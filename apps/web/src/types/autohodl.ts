import type { Address, Hex } from 'viem';

export type SavingsConfig = [
  Address, // savingAddress
  Address, // delegate
  bigint, // roundUp
  boolean, // active
  boolean, // toYield
  Hex, // extraData
];
