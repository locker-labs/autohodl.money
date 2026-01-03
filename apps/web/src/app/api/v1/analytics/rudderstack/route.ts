'use server';

import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';
import { EAnalyticsEvent } from '@/types/analytics';

export async function POST(request: NextRequest) {
  console.log('Received POST request to Rudderstack analytics endpoint');
  try {
    const cookieStore = await cookies();
    const twclid = cookieStore.get('x_attr_id')?.value;

    if (!twclid) {
      console.error('No x_attr_id cookie found');
      return NextResponse.json({ error: 'Missing tracking cookie' }, { status: 400 });
    }

    console.log('twclid from cookie:', twclid);

    // Get the raw body as json
    if (request.headers.get('content-type') !== 'application/json') {
      console.error('Invalid content-type, expected application/json');
      return NextResponse.json({ error: 'Invalid content-type, expected application/json' }, { status: 400 });
    }

    const body = await request.json();

    const eventType = body.eventType;
    if (!eventType) {
      console.error('No eventType provided in body');
      return NextResponse.json({ error: 'Missing eventType in body' }, { status: 400 });
    }

    const trackingProperties: Record<string, string | number> = {
      twclid: twclid,
    };

    switch (eventType) {
      case EAnalyticsEvent.WalletConnected:
        if (!body.walletAddress) {
          console.error('No walletAddress provided for Wallet Connected event');
          return NextResponse.json({ error: 'Missing walletAddress for Wallet Connected event' }, { status: 400 });
        }
        trackingProperties.walletAddress = body.walletAddress;
        break;
      case EAnalyticsEvent.AllowanceSet:
        if (!body.walletAddress || !body.allowance) {
          console.error('Missing parameters for Allowance Set event');
          return NextResponse.json({ error: 'Missing parameters for Allowance Set event' }, { status: 400 });
        }
        trackingProperties.walletAddress = body.walletAddress;
        trackingProperties.allowance = body.allowance;
        break;
      case EAnalyticsEvent.ConfigSet:
        if (!body.walletAddress || !body.transactionHash) {
          console.error('Missing parameters for Config Set event');
          return NextResponse.json({ error: 'Missing parameters for Config Set event' }, { status: 400 });
        }
        trackingProperties.walletAddress = body.walletAddress;
        trackingProperties.transactionHash = body.transactionHash;
        break;
      default:
        console.error('Unknown eventType:', eventType);
        return NextResponse.json({ error: 'Unknown eventType' }, { status: 400 });
    }

    trackEvent(eventType, trackingProperties);

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
