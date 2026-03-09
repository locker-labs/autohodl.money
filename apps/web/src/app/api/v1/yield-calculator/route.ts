import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, formatUnits, getAddress } from "viem";
import { linea } from "viem/chains";
import {getSusdcAddressByChain} from "@/lib/helpers"

// --- CONFIGURATION ---
const RPC_URL = process.env.RPC_URL || "https://rpc.linea.build"; 
const SYT_ADDRESS = getSusdcAddressByChain(linea.id); 

// ABI Snippets
const SYT_ABI = [
  parseAbiItem('function balanceOf(address) view returns (uint256)'),
  parseAbiItem('function totalAssets() view returns (uint256)'),
  parseAbiItem('function totalSupply() view returns (uint256)'),
  parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')
] as const;

// Initialize Client
const client = createPublicClient({
  chain: linea,
  transport: http(RPC_URL),
});

export async function POST(req: NextRequest) {
  try {
    const { address, days } = await req.json();
    const fDays = days || "30";

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const userAddress = getAddress(address); // Checksum address
    
    // 1. Determine Block Range
    const currentBlock = await client.getBlockNumber();
    const blocksPerDay = BigInt(43200); // Approx for Linea (2s block time). Adjust for your chain!
    const startBlock = currentBlock - (BigInt(fDays) * blocksPerDay);
    
    console.log(`📊 Calculating yield for ${userAddress} | Blocks: ${startBlock} -> ${currentBlock}`);

    // 2. Fetch Snapshots (Start & End Balances)
    // "balanceOf" in your contract returns Asset Value (USDC), so no conversion needed here.
    const [startBalRaw, endBalRaw] = await Promise.all([
      client.readContract({ address: SYT_ADDRESS, abi: SYT_ABI, functionName: 'balanceOf', args: [userAddress], blockNumber: startBlock }),
      client.readContract({ address: SYT_ADDRESS, abi: SYT_ABI, functionName: 'balanceOf', args: [userAddress], blockNumber: currentBlock })
    ]);
      console.log(startBalRaw, endBalRaw);

    const startBalance = parseFloat(formatUnits(startBalRaw, 6));
    const endBalance = parseFloat(formatUnits(endBalRaw, 6));

    // 3. Fetch History (Deposits & Withdrawals)
    const logs = await client.getLogs({
      address: SYT_ADDRESS,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      args: { 
        // We fetch ALL logs involving the user. 
        // Viem doesn't support "OR" in args, so we filter manually below or make 2 requests.
        // For individual user queries, fetching 2 requests is cleaner/safer.
      },
      fromBlock: startBlock,
      toBlock: currentBlock
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    // Filter logs for our specific user
    const userLogs = logs.filter(l => 
      l.args.from?.toLowerCase() === userAddress.toLowerCase() || 
      l.args.to?.toLowerCase() === userAddress.toLowerCase()
    );

    // 4. Process Each Transaction (Convert Shares -> Assets)
    // We must fetch the Share Price at the EXACT block of each transfer to get the real USD value moved.
    await Promise.all(userLogs.map(async (log) => {
      const { from, to, value } = log.args;
      if (!value) return;

      // Parallel fetch of assets/supply to determine price at that moment
      const [assetsAtBlock, supplyAtBlock] = await Promise.all([
        client.readContract({ address: SYT_ADDRESS, abi: SYT_ABI, functionName: 'totalAssets', blockNumber: log.blockNumber }),
        client.readContract({ address: SYT_ADDRESS, abi: SYT_ABI, functionName: 'totalSupply', blockNumber: log.blockNumber })
      ]);

      const shareAmount = parseFloat(formatUnits(value, 6));
      const totalAssets = parseFloat(formatUnits(assetsAtBlock, 6));
      const totalSupply = parseFloat(formatUnits(supplyAtBlock, 6));

      // Avoid division by zero
      const pricePerShare = totalSupply > 0 ? totalAssets / totalSupply : 1;
      const assetValue = shareAmount * pricePerShare;

      if (to?.toLowerCase() === userAddress.toLowerCase()) {
        totalDeposits += assetValue;
      } 
      if (from?.toLowerCase() === userAddress.toLowerCase()) {
        totalWithdrawals += assetValue;
      }
    }));

    // 5. The Golden Formula
    const netFlow = totalWithdrawals - totalDeposits;
    const balanceChange = endBalance - startBalance;
    const yieldEarned = balanceChange + netFlow;

    // 6. Return Data
    return NextResponse.json({
      address: userAddress,
      period: {
        days: Number(fDays),
        startBlock: Number(startBlock),
        endBlock: Number(currentBlock)
      },
      financials: {
        startBalance: startBalance,
        endBalance: endBalance,
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        netYield: yieldEarned
      },
      formatted: {
        yield: `$${yieldEarned.toFixed(6)}`,
        roi: startBalance > 0 ? `${((yieldEarned / startBalance) * 100).toFixed(2)}%` : "0%"
      }
    });

  } catch (error: any) {
    console.error("Yield API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate yield" }, { status: 500 });
  }
}