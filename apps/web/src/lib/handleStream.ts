import type { IWebhook } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import { SavingConfigSetEventSigHash } from '@/lib/constants';
import { handleSavingsExecution } from '@/lib/handleSavingsExecution';
import { verifySignature } from '@/lib/moralis';
import { handleSavingConfigSetEvent } from './handleSavingConfigSetEvent';

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

  // Only process unconfirmed transactions
  // TODO: Handle only confirmed transactions for production
  if (payload.confirmed) {
    console.log('Skipping confirmed transaction.');
    return NextResponse.json({ message: 'Confirmed transactions are ignored.' });
  }

  /**
   * Handle SavingConfigSet events, if any
   */
  if (payload.logs.length) {
    const configSetLogs = payload.logs.filter((log) => log.topic0 === SavingConfigSetEventSigHash);
    if (configSetLogs.length) {
      return await handleSavingConfigSetEvent(configSetLogs);
    }
  }

  // Process ERC20 transfers
  if (!payload.erc20Transfers || payload.erc20Transfers.length === 0) {
    console.warn('No ERC20 transfers to process.');
    return NextResponse.json({ message: 'No transfers to process.' });
  }

  let processedTransfers = 0;

  for (const transfer of payload.erc20Transfers) {
    console.log(`Processing ERC20 transfer with txHash: ${transfer.transactionHash}`);
    let txHash: string | undefined;

    try {
      txHash = await handleSavingsExecution(transfer);
    } catch (error) {
      console.error(
        `Error processing savings execution for transfer with txHash ${transfer.transactionHash}:`,
        error instanceof Error ? error.message : error,
      );
    }

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
