import type { Address } from 'viem';
import Web3 from 'web3';
import { AUTOHODL_ADDRESS, MM_CARD_ADDRESSES, TransferEventSig, USDC_ADDRESSES } from '@/lib/constants';
import { secrets } from '@/lib/secrets';

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
        apiKey: secrets.MoralisApiKey,
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

/**
 * Add an address to the EOA ERC20 Transfer Moralis stream to monitor transactions
 * @param streamId - The Moralis stream ID
 * @param address - The address to monitor (triggerAddress)
 * @returns Promise<boolean> - Success status
 */
export async function addAddressToEoaErc20TransferMoralisStream(streamId: string, address: Address): Promise<boolean> {
  const addressLowerCase = address.toLowerCase() as Address;
  try {
    // Import Moralis dynamically to avoid issues if not installed
    const Moralis = await import('moralis');

    // Initialize Moralis if not already done
    if (!Moralis.default.Core.isStarted) {
      await Moralis.default.start({
        apiKey: secrets.MoralisApiKey,
      });
    }

    // Get the stream
    const stream = await Moralis.default.Streams.getById({
      id: streamId,
    });

    const defaultAdvancedOptions = [
      {
        topic0: TransferEventSig,
        filter: {
          and: [
            {
              ne: ['to', AUTOHODL_ADDRESS.toLowerCase()],
            },
            {
              in: ['from', [addressLowerCase]],
            },
          ],
        },
        includeNativeTxs: false,
      },
    ];

    const advancedOptions = stream.result.advancedOptions;

    // Extract existing address list from advancedOptions
    if (advancedOptions) {
      const transferObject = advancedOptions.find((option) => option.topic0 === TransferEventSig);
      if (Array.isArray(transferObject?.filter?.and)) {
        const inFilter = transferObject.filter.and.find((f) => f.in && Array.isArray(f.in) && f.in[0] === 'from');
        if (inFilter) {
          if (inFilter[1].includes(addressLowerCase)) {
            // Address already exists
            return true;
          }

          // Add the existing list to the new address
          (defaultAdvancedOptions[0].filter.and[1].in as [string, Address[]])[1] = inFilter[1].concat(addressLowerCase);
        }
      }
    }

    /**
     * @note There can be a race condition where another process added a new address between our get and update calls.
     * And we are updating with an old list that doesn't include that new address.
     * This will result in loss of the address that was added by another process.
     */

    // Update the stream with the new list of addresses
    await Moralis.default.Streams.update({ id: streamId, advancedOptions: defaultAdvancedOptions });

    console.log(`Successfully added address ${address} to Moralis stream ${streamId}`);
    return true;
  } catch (error) {
    console.error('Error adding address to Moralis stream:', error);
    // TODO: send alert to dev team
    return false;
  }
}
