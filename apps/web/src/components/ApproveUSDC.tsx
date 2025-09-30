import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USDC_ADDRESS, DELEGATE } from '@/lib/constants';

export default function USDCApprovalChecker() {
  const threshold = 10;
  const { address, isConnected } = useAccount();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && DELEGATE ? [address, DELEGATE as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(address && DELEGATE),
    },
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
    }
  }, [isSuccess, refetchAllowance]);

  const handleApprove = () => {
    if (!DELEGATE) return;

    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DELEGATE as `0x${string}`, parseUnits('20', 6)],
    });
  };

  const currentAllowance = allowance ? formatUnits(allowance as bigint, 6) : '0';
  const needsApproval = allowance !== undefined ? Number(formatUnits(allowance as bigint, 6)) < threshold : false;

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
              value={DELEGATE}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              readOnly
            />
          </label>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Threshold (USDC)
            <input
              type='number'
              value={threshold}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              readOnly
            />
          </label>
        </div>

        {DELEGATE && (
          <div className='p-4 bg-gray-50 rounded-md'>
            <p className='text-sm text-gray-600'>Current Allowance:</p>
            <p className='text-2xl font-bold text-gray-800'>{currentAllowance} USDC</p>
          </div>
        )}

        {allowance === undefined && (
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

        {allowance !== undefined && needsApproval && DELEGATE && (
          <button
            type='button'
            onClick={handleApprove}
            disabled={isPending || isConfirming}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2'
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                {isPending ? 'Waiting for approval...' : 'Confirming...'}
              </>
            ) : (
              'Approve 20 USDC'
            )}
          </button>
        )}

        {allowance !== undefined && !needsApproval && DELEGATE && (
          <div className='flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md'>
            <CheckCircle className='w-5 h-5' />
            <p className='font-medium'>Allowance is above threshold</p>
          </div>
        )}

        {isSuccess && (
          <div className='p-4 bg-green-50 text-green-700 rounded-md'>
            <p className='font-medium'>Approval successful!</p>
            <a
              href={`https://lineascan.build/tx/${hash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm underline'
            >
              View on Lineascan
            </a>
          </div>
        )}

        {error && (
          <div className='p-4 bg-red-50 text-red-700 rounded-md'>
            <p className='font-medium'>Error: {error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
