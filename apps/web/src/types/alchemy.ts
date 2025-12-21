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

export interface IBlock {
  baseFeePerGas: Hex;
  blobGasUsed: Hex;
  difficulty: Hex;
  excessBlobGas: Hex;
  extraData: Hex;
  gasLimit: Hex;
  gasUsed: Hex;
  hash: Hex;
  logsBloom: Hex;
  miner: Hex;
  mixHash: Hex;
  nonce: Hex;
  number: Hex;
  parentBeaconBlockRoot: Hex;
  parentHash: Hex;
  receiptsRoot: Hex;
  requestsHash: Hex;
  sha3Uncles: Hex;
  size: Hex;
  stateRoot: Hex;
  timestamp: Hex;
  transactions: Hex[];
  transactionsRoot: Hex;
  uncles: unknown[];
  withdrawals: unknown[];
  withdrawalsRoot: Hex;
}
