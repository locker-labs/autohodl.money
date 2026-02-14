'use server';

import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { aliasEvent, trackEvent, type TTrackEventProperties } from '@/lib/analytics';
import { EAnalyticsEvent } from '@/types/analytics';

export async function POST(request: NextRequest) {
  console.log('Received POST request to Rudderstack analytics endpoint');
  try {
    const userAgent = request.headers.get('user-agent');
    const rawIp =
      request.headers.get('x-vercel-forwarded-for') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    const ip = rawIp?.split(',')[0]?.trim();

    if (!ip) {
      console.error('Missing ip in headers', { rawIp });
      return NextResponse.json({ error: 'Missing ip in headers' }, { status: 400 });
    }

    if (!userAgent) {
      console.error('Missing userAgent in headers', { userAgent });
      return NextResponse.json({ error: 'Missing userAgent in headers' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const twclid = cookieStore.get('x_attr_id')?.value;
    const anonymousId: string | undefined = cookieStore.get('autohodl_anonymous_id')?.value;

    if (!anonymousId) {
      console.error('No anonymousId found in cookies');
      return NextResponse.json({ error: 'Missing anonymousId in cookies' }, { status: 400 });
    }

    // Get the raw body as json
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      console.error('Invalid content-type, expected application/json');
      return NextResponse.json({ error: 'Invalid content-type, expected application/json' }, { status: 400 });
    }

    const body = await request.json();

    const eventType = body.eventType;
    if (!eventType) {
      console.error('No eventType provided in body');
      return NextResponse.json({ error: 'Missing eventType in body' }, { status: 400 });
    }

    if (
      eventType === EAnalyticsEvent.AllowanceSet ||
      eventType === EAnalyticsEvent.ConfigSet ||
      eventType === EAnalyticsEvent.WalletConnected
    ) {
      if (!body.walletAddress) {
        console.error('No walletAddress provided in body');
        return NextResponse.json({ error: 'Missing walletAddress in body' }, { status: 400 });
      }
      if (!body.savingsChainId) {
        console.error('No savingsChainId provided in body');
        return NextResponse.json({ error: 'Missing savingsChainId in body' }, { status: 400 });
      }
    }

    const trackingProperties: TTrackEventProperties = {
      twclid,
      anonymousId,
      walletAddress: body.walletAddress?.toLowerCase(),
      savingsChainId: body.savingsChainId,
      userAgent: userAgent,
      ip: ip,
    };

    switch (eventType) {
      case EAnalyticsEvent.PageVisited:
      case EAnalyticsEvent.WalletConnected:
        break;
      case EAnalyticsEvent.AllowanceSet:
        if (!body.allowance) {
          console.error('Missing allowance in body');
          return NextResponse.json({ error: 'Missing allowance in body' }, { status: 400 });
        }
        trackingProperties.allowance = body.allowance;
        break;
      case EAnalyticsEvent.ConfigSet:
        if (!body.transactionHash) {
          console.error('Missing transactionHash in body');
          return NextResponse.json({ error: 'Missing transactionHash in body' }, { status: 400 });
        }
        trackingProperties.transactionHash = body.transactionHash;
        break;
      default:
        console.error('Unknown eventType:', eventType);
        return NextResponse.json({ error: 'Unknown eventType' }, { status: 400 });
    }

    if (eventType === EAnalyticsEvent.WalletConnected) {
      await aliasEvent(anonymousId, body.walletAddress?.toLowerCase(), {
        ip,
        userAgent,
        twclid,
      });
    }

    await trackEvent(eventType, trackingProperties);

    return NextResponse.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error processing Moralis webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Rudderstack analytics endpoint' });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
