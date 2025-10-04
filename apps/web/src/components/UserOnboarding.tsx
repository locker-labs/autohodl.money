import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePublicClient, useWalletClient } from 'wagmi';
import { AUTOHODL_ADDRESS, USDC_ADDRESS, DELEGATE, TokenDecimalMap } from '../lib/constants';
import { AutoHodlAbi } from '../lib/abis/AutoHodl';
import { type Address, type Hex, isAddress } from 'viem';
import type { SavingsConfig } from '@/types/autohodl';
import ConfigDisplay from './ConfigDisplay';
import ErrorDisplay from './ErrorDisplay';

// Helper: default config values
const DEFAULT_CONFIG = {
  delegate: DELEGATE,
  roundUp: 1, // a dollar
  active: true,
  toYield: false,
  extraData: '0x',
};

const UserOnboarding: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const [config, setConfig] = useState<null | SavingsConfig>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingsAddress, setSavingsAddress] = useState('');
  // Only $1 is selectable, but keep state for future extensibility
  const [roundUp] = useState<1 | 5 | 10>(1);

  const isInvalidAddress = savingsAddress !== '' && !isAddress(savingsAddress);

  // Check if user has savings config for USDC
  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (!publicClient) return;
        const result = await publicClient.readContract({
          address: AUTOHODL_ADDRESS,
          abi: AutoHodlAbi,
          functionName: 'savings',
          args: [address as Address, USDC_ADDRESS],
        });

        // result: [savingAddress, delegate, roundUp, active, toYield, extraData]
        const found = result && result[0] !== '0x0000000000000000000000000000000000000000';
        setHasConfig(found);
        setConfig(found ? (result as SavingsConfig) : null);
      } catch (e) {
        console.error(e);
        setError('Failed to check savings config.');
        setHasConfig(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [isConnected, address, publicClient]);

  // Handler to create savings config
  const handleCreateConfig = async () => {
    if (!walletClient || !address) return;
    setLoadingTx(true);
    setError(null);
    try {
      // Ensure types for contract call
      const args = [
        USDC_ADDRESS,
        savingsAddress as Address,
        DEFAULT_CONFIG.delegate as Address,
        BigInt(roundUp * 10 ** TokenDecimalMap[USDC_ADDRESS]),
        DEFAULT_CONFIG.active,
        DEFAULT_CONFIG.toYield,
        DEFAULT_CONFIG.extraData as Hex,
      ] as const;
      await walletClient.writeContract({
        address: AUTOHODL_ADDRESS,
        abi: AutoHodlAbi,
        functionName: 'setSavingConfig',
        args,
      });
      setHasConfig(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create config.');
    } finally {
      setLoadingTx(false);
    }
  };

  if (!isConnected) return <div>Please connect your wallet to continue.</div>;
  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div className='max-w-md mx-auto mt-4'>
        <ErrorDisplay error={error} />
      </div>
    );

  if (hasConfig) {
    return <ConfigDisplay config={config} />;
  }

  const disabled = loading || loadingTx || !savingsAddress || isInvalidAddress;

  return (
    <div className='max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-200'>
      <h2 className='text-2xl font-bold mb-2 text-gray-900'>Set up your Savings</h2>
      <p className='text-gray-600 mb-6'>
        No savings config found for USDC. Enter your savings address and create a config.
      </p>
      <div className='mb-5'>
        <label htmlFor='savings-address' className='block font-medium mb-1 text-black/70'>
          Savings Address
        </label>
        <input
          id='savings-address'
          type='text'
          placeholder='0x...'
          value={savingsAddress}
          onChange={(e) => setSavingsAddress(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-base outline-none mb-1 transition-colors ${loading ? 'bg-gray-100' : 'bg-white'} text-gray-900 border-gray-300 focus:border-blue-500`}
          disabled={loading}
        />
        {isInvalidAddress && <p className='text-red-500 text-sm mb-4'>Please enter a valid Ethereum address</p>}
      </div>
      <span className='font-medium mr-2 text-black/70'>Roundup amount:</span>
      <div className='mb-6 flex items-center'>
        <button
          type='button'
          disabled
          className={`mr-1 px-4 py-1 rounded-md font-semibold border-none ${roundUp === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`}
        >
          $1
        </button>
        <button
          type='button'
          disabled
          className='mr-1 px-4 py-1 rounded-md font-semibold border-none bg-gray-200 text-gray-600 opacity-50 cursor-not-allowed'
        >
          $5
        </button>
        <button
          type='button'
          disabled
          className='px-4 py-1 rounded-md font-semibold border-none bg-gray-200 text-gray-600 opacity-50 cursor-not-allowed'
        >
          $10
        </button>
        <span className='ml-2 text-xs text-gray-400'>(Only $1 is available for now)</span>
      </div>
      <button
        onClick={handleCreateConfig}
        disabled={disabled}
        type='button'
        className={`w-full rounded-lg py-3 font-bold text-lg mt-2 transition-colors ${disabled ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md'}`}
      >
        {loadingTx ? 'Creating...' : 'Create Savings Config'}
      </button>
    </div>
  );
};

export default UserOnboarding;
