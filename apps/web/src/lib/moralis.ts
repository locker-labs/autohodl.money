import Web3 from 'web3';
import { MM_CARD_ADDRESSES, USDC_ADDRESSES } from '@/lib/constants';

// Helper function to verify webhook signature
export function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!signature) {
    throw new Error('Signature not provided');
  }

  // Generate signature using the same method as Moralis
  // Use web3.utils.sha3 (which is actually keccak256) as per Moralis documentation
  const web3 = new Web3();
  const generatedSignature = web3.utils.sha3(body + secret);

  // Both signatures should include the '0x' prefix
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
