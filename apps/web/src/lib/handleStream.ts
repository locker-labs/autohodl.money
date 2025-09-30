import type { IWebhook } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import { verifySignature } from './moralis';

export async function handleStream(body: string, signature: string, webhookSecret: string): Promise<NextResponse> {
  try {
    if (!verifySignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  // Parse the JSON payload
  let payload: IWebhook;
  try {
    payload = JSON.parse(body);
  } catch (error) {
    console.error('Error parsing webhook payload:', error);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  console.log('handleStream payload:', payload);

  // Log incoming webhook for debugging
  console.log('Received Moralis webhook:', {
    chainId: payload.chainId,
    streamId: payload.streamId,
    tag: payload.tag,
    confirmed: payload.confirmed,
    transferCount: payload.erc20Transfers.length,
  });

  // Only process confirmed transactions
  if (!payload.confirmed) {
    console.log('Skipping unconfirmed transaction.');
    return NextResponse.json({ message: 'Unconfirmed transactions are ignored.' });
  }

  return NextResponse.json({
    message: 'Webhook processed successfully',
    processedTransfers: 0,
  });
}
