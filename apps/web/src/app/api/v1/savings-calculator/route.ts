'use server';

import { createPublicClient, http, parseAbiItem, parseUnits, formatUnits, getAddress } from 'viem';
import { type NextRequest, NextResponse } from 'next/server';
import { linea } from 'viem/chains';
import { computeRoundUpAndSavings } from '@/lib/helpers';

const TRANSFER_EVENT_ABI = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const CHUNK_SIZE = BigInt(10000);
const USDC_LINEA_ADDRESS = '0x176211869cA2b568f2A7D4EE941E073a821EE1ff';
const USDT_LINEA_ADDRESS = '0xA219439258ca9da29E9Cc4cE5596924745e12B93';
const WETH_ADDRESS = '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f';

const client = createPublicClient({
  chain: linea,
  transport: http("https://rpc.linea.build"),
});

export async function POST(request: NextRequest) {
  try {
    const { userAddress, tokens } = await request.json();
    if (!userAddress) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    const currentBlock = await client.getBlockNumber();
    const blocksIn30Days = BigInt(Math.floor((60 * 60 * 24 * 30) / 2)); // ~2s blocks
    const startBlock = currentBlock - blocksIn30Days;

      let fromBlock = startBlock;
      const savingsMapping: Record<string, number[]> = {};

    for (const tokenAddress of tokens) {
            let allTransfers: any[] = [];
          console.log(`Processing token at address ${tokenAddress}...`);
          fromBlock = startBlock; // Reset fromBlock for each token
          // PAGINATION LOGIC
          while (fromBlock < currentBlock) {
              const toBlock = fromBlock + CHUNK_SIZE > currentBlock ? currentBlock : fromBlock + CHUNK_SIZE;

              console.log(`Fetching blocks ${fromBlock} to ${toBlock}...`);

              const logs = await client.getLogs({
                  address: tokenAddress,
                  event: TRANSFER_EVENT_ABI,
                  args: { from: getAddress(userAddress) }, // Only transfers SENT by user
                  fromBlock,
                  toBlock,
              });

              // EXTRACT DATA
              // EXTRACT DATA
              const formattedLogs = logs.map((log) => {
                  // Viem decodes 'args' automatically if 'event' is provided in getLogs
                  const { value } = log.args;
        
                  return {
                      transactionHash: log.transactionHash,
                      blockNumber: log.blockNumber,
                      tokenAddress: log.address,
                      // Convert BigInt to string/number (BigInts can't be JSON serialized directly)
                      amountRaw: BigInt(value?.toString() || '0'),
                      amountFormatted: value ? formatUnits(value, 6) : '0', // Assuming 18 decimals
                  };
              });
              allTransfers = [...allTransfers, ...formattedLogs];
              fromBlock = toBlock + BigInt(1);
          }
          const savingsArray: number[] = [0, 0, 0];

          for (const transfer of allTransfers) {
              console.log(`Transfer of ${transfer.amountFormatted} USDC at tx ${transfer.transactionHash}`);
              console.log(transfer.amountRaw);
              const { roundUpAmount: a, savingsAmount: one } = computeRoundUpAndSavings(transfer.amountRaw, parseUnits('1', 6));
              savingsArray[0] += Number(one);
              const { roundUpAmount: b, savingsAmount: two } = computeRoundUpAndSavings(transfer.amountRaw, parseUnits('1', 7));
              savingsArray[1] += Number(two);
              const { roundUpAmount: c, savingsAmount: three } = computeRoundUpAndSavings(transfer.amountRaw, parseUnits('1', 8));
              savingsArray[2] += Number(three);
          }
          console.log(`Total savings for token ${tokenAddress}:`, savingsArray);
          savingsMapping[tokenAddress] = savingsArray;
      }
      
    return NextResponse.json({ 
        savings: savingsMapping,
    });

  } catch (error) {
    console.error('Logic Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}