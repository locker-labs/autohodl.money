export const getBlockExplorerTxUrl = (chainId: number, txHash: string): string => {
  switch (chainId) {
    case 59144:
      return `https://lineascan.build/tx/${txHash}`;
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    default:
      return `https://explorer.com/tx/${txHash}`;
  }
};
