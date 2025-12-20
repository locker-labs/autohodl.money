import type { Address, Hex } from 'viem';

export interface ITransactionReceipt {
  blockHash: Hex;
  blockNumber: Hex;
  contractAddress: Address | null;
  cumulativeGasUsed: Hex;
  effectiveGasPrice: Hex;
  from: Address;
  gasUsed: Hex;
  logs: {
    address: Address;
    topics: Hex[];
    data: Hex;
    blockNumber: Hex;
    transactionHash: Hex;
    transactionIndex: Hex;
    blockHash: Hex;
    logIndex: Hex;
    removed: boolean;
  }[];
  logsBloom: Hex;
  status: Hex;
  to: Address | null;
  transactionHash: Hex;
  transactionIndex: Hex;
  type: Hex;
}
