'use client';

import { useEffect } from 'react';
import { zeroAddress } from 'viem';
import Button from '@/components/subcomponents/Button';
import { toastCustom } from '@/components/ui/toast';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useERC20Transfer } from '@/hooks/useERC20Token';
import { S_USDC_ADDRESS } from '@/lib/constants';

export const WithdrawSavings = (): React.JSX.Element => {
  const { address, sToken } = useAutoHodl();

  const { transfer, isPending, isConfirmed, isConfirming } = useERC20Transfer({
    token: S_USDC_ADDRESS,
    to: address || zeroAddress,
    amount: sToken.balanceFormatted,
    enabled: !!address && sToken.isReady,
  });

  useEffect(() => {
    if (isConfirmed) {
      toastCustom('Savings withdrawn successfully!');
      sToken.refetch();
    }
  }, [isConfirmed, sToken.refetch]);

  useEffect(() => {
    if (isConfirming) toastCustom('Confirming withdrawal...');
  }, [isConfirming]);

  return (
    <Button
      title={'Withdraw Savings'}
      className='w-full h-[40px]'
      disabled={!sToken.isReady || !sToken.balanceFormatted}
      onAction={transfer}
      loading={isPending || isConfirming}
    >
      <span>Withdraw Savings</span>
    </Button>
  );
};
