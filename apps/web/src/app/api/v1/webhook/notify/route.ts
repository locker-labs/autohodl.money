'use server';

import { type NextRequest, NextResponse } from 'next/server';
import type { IWebhook } from '@moralisweb3/streams-typings';
import { handleNotifications } from '@/lib/handleNotifications';
import { secrets } from '@/lib/secrets';
import { verifySignature } from '@/lib/moralis';
import { decodeEventLog } from 'viem'; 

const SAVING_EXECUTED_ABI = [
  {
    name: 'SavingExecuted',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'token', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  },
] as const;

const SAVING_EXECUTED_TOPIC0 = '0x8d49b5ed017ceed9d5a9cffcf1e3e49fe216f324a40089bb800ebd6d3f319f2f';

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

    if (!payload.confirmed) {
      console.log('Skipping unconfirmed log (waiting for confirmation).');
      return NextResponse.json({ message: 'Unconfirmed logs ignored' });
    }

    if (!payload.logs || payload.logs.length === 0) {
      return NextResponse.json({ message: 'No logs found' });
    }

    let processedCount = 0;

    for (const log of payload.logs) {
      // Only decode if the topic matches SavingExecuted
      if (log.topic0 === SAVING_EXECUTED_TOPIC0) {
        try {
          // Reconstruct the topics array, filtering out nulls (like topic3 in your payload)
          const topics = [log.topic0, log.topic1, log.topic2, log.topic3].filter(
            (t): t is `0x${string}` => t !== null
          );

          const decoded = decodeEventLog({
            abi: SAVING_EXECUTED_ABI,
            data: log.data as `0x${string}`,
            topics: topics as [`0x${string}`, ...`0x${string}`[]],
          });

          const { user, token, value } = decoded.args;

          console.log(`Processing SavingExecuted: User ${user}, Value ${value}`);

          await handleNotifications({
            user,
            token,
            value: value.toString(), // BigInt to string
            transactionHash: log.transactionHash,
            chainId: payload.chainId
          });

          processedCount++;
        } catch (decodeError) {
          console.warn('Failed to decode SavingExecuted log:', decodeError);
        }
      }
    }
    return NextResponse.json({ 
      message: 'Webhook processed', 
      processedEvents: processedCount 
    });

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
