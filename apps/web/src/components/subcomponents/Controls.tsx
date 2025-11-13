import { Lock } from 'lucide-react';
import type React from 'react';
import { type Address, formatUnits } from 'viem';
import ActiveSwitch from '@/components/subcomponents/ActiveSwitch';
import RoundupAmountSelector from '@/components/subcomponents/RoundupAmountSelector';
import SavingsModeSelector from '@/components/subcomponents/SavingsModeSelector';
import { WithdrawSavings } from '@/components/subcomponents/WithdrawSavings';
import YieldSwitch from '@/components/subcomponents/YieldSwitch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { AUTOHODL_ADDRESS, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { formatAddress } from '@/lib/string';
import { useAccount } from 'wagmi';
import { CopyContentButton } from '../feature/CopyContentButton';
import { PriceSkeleton } from './PriceSkeleton';
import { useErc20Allowance, useERC20Approve, useERC20BalanceOf } from '@/hooks/useERC20Token';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from './Button';

export function Controls(): React.JSX.Element {
  const { address: userAddress } = useAccount();
  const { config, token } = useAutoHodl();
  const { data: apy, isLoading: apyLoading } = useAaveAPY();
  const [savingsCap, setSavingsCap] = useState<number | null>(100); // default 100 USDC

  const savingsAddressToken = useERC20BalanceOf({
    token: USDC_ADDRESS,
    address: config?.savingAddress,
    enabled: !!config?.savingAddress && !config?.toYield,
  });

  const { allowanceFormatted, isLoading: isLoadingAllowance } = useErc20Allowance({
    owner: userAddress as Address,
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
  });

  useEffect(() => {
    if (!isLoadingAllowance) {
      setSavingsCap(allowanceFormatted);
    }
  }, [isLoadingAllowance, allowanceFormatted]);

  const {
    approve,
    isPending,
    isConfirming: isConfirmingAllowance,
  } = useERC20Approve({
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
    amount: savingsCap ?? 0,
  });

  const handleApprove = () => {
    approve();
  };

  const title = `Setup Round-Up Savings`;

  return (
    <Card className='w-full m-0 py-5 pl-5 pr-5 h-full'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>{title}</h2>
        </div>

        <div className='mt-4'>
          <RoundupAmountSelector />
        </div>

        <div className='mt-4'>
          <SavingsModeSelector />
        </div>

        <div className='mt-4'>
          <YieldSwitch />
        </div>

        <div className='mt-4'>
          <p className='mt-2 text-[#4D4A4A] text-sm'>
            Each purchase rounds up to the nearest $
            {formatUnits(BigInt(config?.roundUp || 0), TokenDecimalMap[USDC_ADDRESS])}
          </p>
        </div>

        {/* Source of Funds */}
        <div className='mt-4 w-full'>
          <p className='text-sm font-medium'>Source of Funds</p>

          <div className='mt-2 w-full h-20 border border-gray-300 rounded-lg flex items-center justify-between gap-3 px-3'>
            <div className='flex items-center justify-start gap-3'>
              <Lock className='min-w-5 min-h-5' size={20} />
              <div>
                <div>
                  <p className='text-[15px]'>Connected Wallet</p>
                  <CopyContentButton textToCopy={userAddress || ''} onCopyMessage='Address copied to clipboard'>
                    {formatAddress(userAddress)}
                  </CopyContentButton>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-1 px-3'>
              <p>Balance: </p>
              {!token.isReady ? <PriceSkeleton /> : <p>{token.balanceFormatted} USDC</p>}
            </div>
          </div>
        </div>

        {/* Savings Destination */}
        <div className='mt-4'>
          <div>
            <p className='text-sm font-medium'>Savings Destination</p>
          </div>
          <div className='mt-2 w-full h-20 border border-gray-300 rounded-lg flex items-center justify-between gap-3 px-3'>
            <div className='flex items-center justify-start gap-3'>
              {config?.toYield ? (
                <Image
                  src={'/aave.svg'}
                  alt='aave'
                  width={20}
                  height={20}
                  className='min-w-5 min-h-5 max-h-5 max-w-5'
                />
              ) : (
                <Lock className='min-w-5 min-h-5' size={20} />
              )}
              {config?.toYield ? (
                <div>
                  <p className='text-[15px]'>Aave Protocol</p>
                  <p className='mt-1 text-[#4D4A4A] text-sm'>Earning ~{apyLoading ? '--' : apy}% APY</p>
                </div>
              ) : (
                <div>
                  <p className='text-[15px]'>Savings Account</p>
                  <CopyContentButton
                    textToCopy={config?.savingAddress || ''}
                    onCopyMessage='Savings address copied to clipboard'
                    className='mt-1'
                  >
                    {formatAddress(config?.savingAddress)}
                  </CopyContentButton>
                </div>
              )}
            </div>

            {config?.toYield ? null : (
              <div className='flex items-center justify-end gap-1 px-3'>
                <p>Balance: </p>
                {!savingsAddressToken.isReady ? <PriceSkeleton /> : <p>{savingsAddressToken.balanceFormatted} USDC</p>}
              </div>
            )}
          </div>
        </div>

        <Accordion className='mt-4' type='single' collapsible>
          <AccordionItem value='item-1'>
            <AccordionTrigger className='px-6 py-4 border border-gray-300 rounded-lg'>
              Advanced Options
            </AccordionTrigger>
            <AccordionContent className='mt-6 px-6 py-4 border border-gray-300 rounded-lg'>
              {/* Toggle if savings are enabled or disabled */}
              <div>
                <ActiveSwitch />
              </div>

              {/* Savings limit input */}
              <div className='mt-4 flex flex-col gap-2'>
                <label htmlFor={'savingsCap'} className='text-sm font-medium text-black'>
                  Savings limit (USDC)
                </label>
                <input
                  id={'savingsCap'}
                  type='text'
                  value={savingsCap !== null ? savingsCap : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Number(val);
                    if (val === '') {
                      setSavingsCap(null);
                    } else if (!Number.isNaN(num) && num >= 0) {
                      setSavingsCap(num);
                    }
                  }}
                  className='h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-app-green-dark transition-colors'
                />
                <Button
                  className='rounded-lg w-full'
                  title={'Add token allowance'}
                  onAction={handleApprove}
                  disabled={!savingsCap}
                >
                  {isConfirmingAllowance ? 'Confirming...' : isPending ? 'Processing...' : 'Set Limit'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='mt-4'>
          <WithdrawSavings />
        </div>
      </CardContent>
    </Card>
  );
}
