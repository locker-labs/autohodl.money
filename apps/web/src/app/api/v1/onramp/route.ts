import { NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

export async function POST(request: Request) {
  try {
    const { address, asset, network } = await request.json();

    const apiKeyId = process.env.CDP_API_KEY_ID;
    let apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      return NextResponse.json(
        { error: "Server missing CDP API credentials" }, 
        { status: 500 }
      );
    }

    // Safely parse newline characters from the .env file
    apiKeySecret = apiKeySecret.replace(/\\n/g, '\n');

    // Define the exact request details required by the Onramp endpoint
    const requestMethod = "POST";
    const requestHost = "api.developer.coinbase.com";
    const requestPath = "/onramp/v1/token";

    // 1. Generate the JWT using the official CDP SDK
    const cdpJwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod,
      requestHost,
      requestPath,
      expiresIn: 120 // Token valid for 2 minutes
    });

    // 2. Exchange the CDP JWT for an Onramp session token
    const response = await fetch(`https://${requestHost}${requestPath}`, {
      method: requestMethod,
      headers: {
        'Authorization': `Bearer ${cdpJwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses: [{ address, blockchains: [network] }],
        assets: [asset],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coinbase API error: ${errorText}`);
    }

    const data = await response.json();
    
    // Return the single-use sessionToken to the frontend UI
    return NextResponse.json({ token: data.token });
    
  } catch (error: any) {
    console.error("Token generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}