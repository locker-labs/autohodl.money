'use server';

import { type NextRequest, NextResponse } from 'next/server';
import type { IWebhook } from '@moralisweb3/streams-typings';
import { handleNotifications } from '@/lib/handleNotifications';
import { secrets } from '@/lib/secrets';
import { type EChainId, ViemChainNameMap } from '@/lib/constants';
import { verifySignature } from '@/lib/moralis';
// Assuming you have a way to decode logs, e.g., via viem
import { decodeEventLog } from 'viem'; 

// Define your ABI for decoding
const SAVING_EXECUTED_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'SavingExecuted',
    type: 'event',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const streamSecret = secrets.MoralisStreamSecret;

    if (!streamSecret || !signature) {
      return NextResponse.json({ error: 'Security credentials missing' }, { status: 401 });
    }

    if (!verifySignature(body, signature, streamSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: IWebhook = JSON.parse(body);

    // 1. Log receipt
    console.log(`Stream ${payload.tag} received on chain ${payload.chainId}`);

    // 2. Filter for confirmed/unconfirmed based on your logic
    if (payload.confirmed) {
      return NextResponse.json({ message: 'Skipping confirmed log' });
    }

    // 3. Process Logs (Custom Events)
    if (!payload.logs || payload.logs.length === 0) {
      return NextResponse.json({ message: 'No logs found' });
    }

    for (const log of payload.logs) {
      try {
        // Decode the log using viem
        const topics = [log.topic0, log.topic1, log.topic2, log.topic3].filter(Boolean) as [`0x${string}`, ...`0x${string}`[]];
        const decoded = decodeEventLog({
          abi: SAVING_EXECUTED_ABI,
          data: log.data as `0x${string}`,
          topics,
        });

        if (decoded.eventName === 'SavingExecuted') {
          const { user, token, value } = decoded.args;

          console.log(`Processing SavingExecuted: User ${user}, Value ${value}`);

          await handleNotifications({
            user,
            token,
            value: value.toString(),
            transactionHash: log.transactionHash,
            chainId: payload.chainId
          });
        }
      } catch (decodeError) {
        // This log might be a different event; skip or log error
        console.warn('Could not decode log, skipping:', decodeError);
      }
    }

    return NextResponse.json({ message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Moralis webhook endpoint' });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
