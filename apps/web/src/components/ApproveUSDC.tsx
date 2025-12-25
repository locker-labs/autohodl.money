import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { USDC_ADDRESS, AUTOHODL_ADDRESS } from '@/lib/constants';
import { useErc20Allowance, useERC20Approve } from '@/hooks/useERC20Token';
import { chain } from '@/config';
import { getTransactionLink } from '@/lib/blockExplorer';
import ErrorDisplay from './ErrorDisplay';

export default function USDCApprovalChecker() {
  const { address, isConnected } = useAccount();
  const [autohodlAllowance, setAutohodlAllowance] = useState<number>(20);
  const {
    allowance,
    allowanceFormatted,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useErc20Allowance({
    token: USDC_ADDRESS,
    owner: address,
    spender: AUTOHODL_ADDRESS,
    enabled: isConnected,
  });

  const { approve, isPending, isConfirming, isConfirmed, writeError, hash } = useERC20Approve({
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
    amount: autohodlAllowance,
    enabled: isConnected,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  const handleApprove = () => {
    if (!AUTOHODL_ADDRESS) return;
    approve();
  };
  const needsApproval = allowanceFormatted !== undefined ? Number(allowanceFormatted) < autohodlAllowance : false;

  if (!isConnected) {
    return (
      <div className='max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg'>
        <div className='flex items-center gap-2 text-amber-600'>
          <AlertCircle className='w-5 h-5' />
          <p className='font-medium'>Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold text-gray-800'>Approve USDC</h2>
      <p className='text-sm text-gray-600 mb-4'>Automate savings upon spending with MM Card</p>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Delegate Address
            <input
              type='text'
              placeholder='0x...'
              value={AUTOHODL_ADDRESS}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              readOnly
            />
          </label>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            autoHODL Allowance (USDC)
            <input
              type='number'
              value={autohodlAllowance}
              onChange={(e) => setAutohodlAllowance(Number(e.target.value))}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </label>
        </div>

        {AUTOHODL_ADDRESS && (
          <div className='p-4 bg-gray-50 rounded-md'>
            <p className='text-sm text-gray-600'>Current Allowance:</p>
            <p className='text-2xl font-bold text-gray-800'>{allowanceFormatted} USDC</p>
          </div>
        )}

        {isLoadingAllowance && (
          <button
            type='button'
            onClick={() => {}}
            disabled={true}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2'
          >
            <Loader2 className='w-5 h-5 animate-spin' />
            Loading...
          </button>
        )}

        {allowance !== undefined && needsApproval && AUTOHODL_ADDRESS && (
          <button
            type='button'
            onClick={handleApprove}
            disabled={isPending || isConfirming || autohodlAllowance === 0}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2'
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                {isPending ? 'Waiting for approval...' : 'Confirming...'}
              </>
            ) : (
              `${autohodlAllowance === 0 ? 'Enter autohodlAllowance' : `Approve ${autohodlAllowance} USDC`}`
            )}
          </button>
        )}

        {allowance !== undefined && !needsApproval && AUTOHODL_ADDRESS && (
          <div className='flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md'>
            <CheckCircle className='w-5 h-5' />
            <p className='font-medium'>autoHODL can now save up to {autohodlAllowance} USDC</p>
          </div>
        )}

        {isConfirmed && (
          <div className='p-4 bg-green-50 text-green-700 rounded-md'>
            <p className='font-medium'>Approval successful!</p>
            <a
              href={getTransactionLink(hash as string)}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm underline'
            >
              View on{' '}
              {chain.id === 59144 ? 'Lineascan' : chain.id === 11155111 ? 'Sepolia Etherscan' : 'Block Explorer'}
            </a>
          </div>
        )}

        <ErrorDisplay error={writeError} />
      </div>
    </div>
  );
}
