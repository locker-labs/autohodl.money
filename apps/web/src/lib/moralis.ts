import { concat, keccak256, toBytes } from 'viem';
import { MM_CARD_ADDRESSES, USDC_ADDRESSES } from '@/lib/constants';

// Helper function to verify webhook signature
export function verifySignature(body: string, secret: string, signature: string) {
  console.log('verifySignature', body, signature, secret);
  if (!signature) {
    throw new Error('Signature not provided');
  }

  // Compute keccak256 hash of body + secret
  const generatedSignature = keccak256(concat([toBytes(body), toBytes(secret)]));

  // Ensure input signature has 0x prefix
  const cleanSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

  return generatedSignature === cleanSignature;
}

// Helper function to check if address is a MetaMask Card address
export function isMetaMaskCardAddress(address: string): boolean {
  return MM_CARD_ADDRESSES.some((cardAddress: string) => cardAddress.toLowerCase() === address.toLowerCase());
}

// Helper function to check if token is USDC
export function isUSDC(tokenAddress: string): boolean {
  return USDC_ADDRESSES.some((usdcAddress: string) => usdcAddress.toLowerCase() === tokenAddress.toLowerCase());
}

/**
 * Add an address to the Moralis stream to monitor transactions
 * @param streamId - The Moralis stream ID
 * @param address - The address to monitor (triggerAddress)
 * @returns Promise<boolean> - Success status
 */
export async function addAddressToMoralisStream(streamId: string, address: string): Promise<boolean> {
  try {
    // Import Moralis dynamically to avoid issues if not installed
    const Moralis = await import('moralis');

    // Initialize Moralis if not already done
    if (!Moralis.default.Core.isStarted) {
      await Moralis.default.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }

    // Add the address to the stream
    await Moralis.default.Streams.addAddress({
      id: streamId,
      address: [address],
    });

    console.log(`Successfully added address ${address} to Moralis stream ${streamId}`);
    return true;
  } catch (error) {
    console.error('Error adding address to Moralis stream:', error);
    return false;
  }
}
