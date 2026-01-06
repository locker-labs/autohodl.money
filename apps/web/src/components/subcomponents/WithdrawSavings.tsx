'use client';

import { useEffect, useState } from 'react';
import { zeroAddress } from 'viem';
import Button from '@/components/subcomponents/Button';
import { toastCustom } from '@/components/ui/toast';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useERC20Transfer } from '@/hooks/useERC20Token';
import { getSusdcAddressByChain } from '@/lib/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const WithdrawSavings = (): React.JSX.Element => {
  const { address, sToken, savingsChainId } = useAutoHodl();
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const maxBalance = sToken.balanceFormatted ?? 0;

  // Parse the amount to use for transfer
  const amountToTransfer = withdrawAmount ? Number(withdrawAmount) : 0;
  const isAmountExceedsBalance = amountToTransfer > maxBalance;
  const isValidAmount = amountToTransfer > 0 && !isAmountExceedsBalance;

  const { transfer, isPending, isConfirmed, isConfirming } = useERC20Transfer({
    chainId: savingsChainId,
    token: getSusdcAddressByChain(savingsChainId),
    to: address || zeroAddress,
    amount: amountToTransfer,
    enabled: !!address && sToken.isReady && isValidAmount,
  });

  useEffect(() => {
    if (isConfirmed) {
      toastCustom('Savings withdrawn successfully!');
      sToken.refetch();
      setIsOpen(false);
      setWithdrawAmount('');
    }
  }, [isConfirmed, sToken.refetch]);

  useEffect(() => {
    if (isConfirming) toastCustom('Confirming withdrawal...');
  }, [isConfirming]);

  // Set default value when dialog opens
  useEffect(() => {
    if (isOpen && maxBalance > 0) {
      setWithdrawAmount(maxBalance.toString());
    }
  }, [isOpen, maxBalance]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string or valid positive numbers
    if (val === '' || (!Number.isNaN(Number(val)) && Number(val) >= 0)) {
      setWithdrawAmount(val);
    }
  };

  const handleMaxClick = () => {
    setWithdrawAmount(maxBalance.toString());
  };

  const handleWithdraw = () => {
    if (isValidAmount) {
      transfer();
    }
  };

  return (
    <>
      <Button
        title={'Withdraw Savings'}
        className='w-full h-[40px]'
        disabled={!sToken.isReady || !sToken.balanceFormatted}
        onAction={() => setIsOpen(true)}
      >
        <span>Withdraw Savings</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle className='text-black'>Withdraw Savings</DialogTitle>
            <DialogDescription>Enter the amount you want to withdraw from your savings.</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 pt-2'>
            {/* Amount Input */}
            <div className='flex flex-col gap-2'>
              <label htmlFor='withdrawAmount' className='text-sm font-medium text-black'>
                Amount (sUSDC)
              </label>
              <div className='relative flex items-center'>
                <input
                  id='withdrawAmount'
                  type='text'
                  inputMode='decimal'
                  value={withdrawAmount}
                  onChange={handleInputChange}
                  placeholder='0.00'
                  className={`w-full h-10 rounded-md border px-3 pr-16 text-base focus-visible:outline-none focus-visible:border-gray-400 transition-colors ${
                    isAmountExceedsBalance ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type='button'
                  onClick={handleMaxClick}
                  className='absolute right-2 px-2 py-1 text-xs font-medium text-[#78E76E] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer'
                >
                  MAX
                </button>
              </div>
              {isAmountExceedsBalance && (
                <p className='text-xs text-red-500'>Amount exceeds available balance ({maxBalance} sUSDC)</p>
              )}
              <p className='text-xs text-gray-500'>Available: {maxBalance} sUSDC</p>
            </div>

            {/* Withdraw Button */}
            <Button
              title='Withdraw'
              className='w-full h-[40px]'
              disabled={!isValidAmount || isPending || isConfirming}
              onAction={handleWithdraw}
              loading={isPending || isConfirming}
            >
              <span>{isConfirming ? 'Confirming...' : isPending ? 'Processing...' : 'Withdraw'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
