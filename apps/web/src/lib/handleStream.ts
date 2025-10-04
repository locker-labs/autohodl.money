import type { IWebhook } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import { verifySignature } from './moralis';
import { handleSavingsExecution } from './handleSavingsExecution';

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

  // Process ERC20 transfers
  if (!payload.erc20Transfers || payload.erc20Transfers.length === 0) {
    console.warn('No ERC20 transfers to process.');
    return NextResponse.json({ message: 'No transfers to process.' });
  }

  let processedTransfers = 0;

  for (const transfer of payload.erc20Transfers) {
    console.log(`Processing ERC20 transfer: ${transfer.transactionHash}`);
    const txHash = await handleSavingsExecution(transfer);

    if (txHash) {
      processedTransfers++;
    }
  }

  return NextResponse.json({
    message: 'Webhook processed successfully',
    erc20Transfers: payload.erc20Transfers.length,
    processedTransfers,
  });
}
