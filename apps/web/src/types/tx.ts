import type { Hex } from 'viem';
import type { EAutoHodlTxType } from '@/enums';
import type { EChainId } from '@/lib/constants';

export interface IWithdrawalTx {
  id: string;
  timestamp?: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  blockNum: Hex;
  type: EAutoHodlTxType.Withdrawal;
  chainId: EChainId;
}

export interface ISavingsTx {
  id: string;
  timestamp?: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  blockNum: Hex;
  type: EAutoHodlTxType.Savings;
  sourceTxHash: Hex;
  purchaseValue: bigint;
  chainId: EChainId;
  sourceChainId: EChainId;
}

export type ITx = IWithdrawalTx | ISavingsTx;
