import type { IWebhook } from '@moralisweb3/streams-typings';
import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import { getAddress } from 'viem';
import { SavingConfigSetEventSigHash, TokenToTransferStreamIdMap } from '@/lib/constants';
import { handleSavingsExecution } from '@/lib/handleSavingsExecution';
import { addAddressToEoaErc20TransferMoralisStream, verifySignature } from '@/lib/moralis';

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

  if (payload.logs.length) {
    const configSetLogs = payload.logs.filter((log) => log.topic0 === SavingConfigSetEventSigHash);
    // if SavingConfigSet, then add user address to erc20 transfers stream

    for (const configSetLog of configSetLogs) {
      if (configSetLog?.topic1 && configSetLog.topic2) {
        const user: Address = getAddress(`0x${configSetLog.topic1.slice(26)}`);
        const token: Address = getAddress(`0x${configSetLog.topic2.slice(26)}`);
        console.log(`New saving config set for user: ${user}, token: ${token}`);
        const streamId: string | undefined = TokenToTransferStreamIdMap[token];
        if (!streamId) {
          console.error(`No stream ID configured for token: ${token}`);
          // TODO: send alert to dev team
        } else {
          await addAddressToEoaErc20TransferMoralisStream(streamId, user);
        }
      }
    }

    if (configSetLogs.length) {
      return NextResponse.json({ message: 'Processed SavingConfigSet event' });
    }
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
