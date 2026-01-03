import { Lock } from 'lucide-react';
import type React from 'react';
import ActiveSwitch from '@/components/subcomponents/ActiveSwitch';
import RoundupAmountSelector from '@/components/subcomponents/RoundupAmountSelector';
import SavingsModeSelector from '@/components/subcomponents/SavingsModeSelector';
import { WithdrawSavings } from '@/components/subcomponents/WithdrawSavings';
import YieldSwitch from '@/components/subcomponents/YieldSwitch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { SupportedAccounts } from '@/lib/constants';
import { formatAddress } from '@/lib/string';
import { useConnection } from 'wagmi';
import { CopyContentButton } from '@/components/feature/CopyContentButton';
import { PriceSkeleton } from '@/components/ui/skeletons/PriceSkeleton';
import { useERC20BalanceOf } from '@/hooks/useERC20Token';
import Image from 'next/image';
import SavingsLimit from './SavingsLimit';
import { formatAmount } from '@/lib/math';
import { getUsdcAddressByChain } from '@/lib/helpers';

export function Controls(): React.JSX.Element {
  const title = `Controls`;

  return (
    <Card className='w-full m-0 p-5 h-full'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>{title}</h2>
        </div>
        {/* <div className='mt-4'>
          <p className='mt-2 text-[#4D4A4A] text-sm'>
            Each purchase rounds up to the nearest $
            {formatUnits(BigInt(config?.roundUp || 0), TokenDecimalMap[USDC_ADDRESS])}
          </p>
        </div> */}
        <div className='mt-4'>
          <ControlsMobile />
        </div>
      </CardContent>
    </Card>
  );
}

export function ControlsMobile(): React.JSX.Element {
  const { address: userAddress } = useConnection();
  const { accounts, config, token, savingsChainId } = useAutoHodl();
  const { data: apy, isLoading: apyLoading } = useAaveAPY();
  const hasMetaMaskCard: boolean = accounts.some((acc) => acc === SupportedAccounts.MetaMask);

  const displayAccount = hasMetaMaskCard
    ? {
        Logo: (
          <Image
            src={'/MetaMask-icon-fox.svg'}
            alt='metamask card'
            width={24}
            height={24}
            className='min-w-6 min-h-6 max-h-6 max-w-6'
          />
        ),
        title: 'MetaMask Card',
      }
    : {
        Logo: <Lock className='min-w-5 min-h-5' size={20} />,
        title: 'Connected Account',
      };

  const savingsAddressToken = useERC20BalanceOf({
    token: getUsdcAddressByChain(savingsChainId),
    chainId: savingsChainId,
    address: config?.savingAddress,
    enabled: !!config?.savingAddress && !config?.toYield,
  });

  return (
    <div>
      <Accordion type='multiple' defaultValue={['account-details']}>
        <AccordionItem value='account-details' className='border-b-0'>
          <AccordionTrigger className='px-6 py-4 border border-gray-300 rounded-lg'>Account Details</AccordionTrigger>
          <AccordionContent className='mt-4 px-6 py-4 border border-gray-300 rounded-lg'>
            {/* Source of Funds */}
            <div className='w-full'>
              <p className='text-sm font-medium'>Source of Funds</p>

              <div className='mt-2 w-full h-20 border border-gray-300 rounded-lg flex items-center justify-between gap-3 px-3'>
                <div className='flex items-center justify-start gap-3'>
                  {displayAccount.Logo}
                  <div>
                    <div>
                      <p className='text-[15px] whitespace-nowrap'>{displayAccount.title}</p>
                      <CopyContentButton textToCopy={userAddress || ''} onCopyMessage='Address copied to clipboard'>
                        {formatAddress(userAddress)}
                      </CopyContentButton>
                    </div>
                  </div>
                </div>

                <div className='flex flex-wrap items-center justify-end gap-1 px-3'>
                  <p>Balance: </p>
                  {!token.isReady ? (
                    <PriceSkeleton />
                  ) : (
                    <p className='whitespace-nowrap'>{formatAmount(token.balanceFormatted, '')} USDC</p>
                  )}
                </div>
              </div>
            </div>

            {/* Savings Destination */}
            <div className='mt-4 mb-1'>
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
                      <p className='text-[15px] whitespace-nowrap'>Aave Protocol</p>
                      <p className='mt-1 text-[#4D4A4A] text-sm'>Earning ~{apyLoading ? '--' : apy}% APY</p>
                    </div>
                  ) : (
                    <div>
                      <p className='text-[15px] whitespace-nowrap'>Savings Account</p>
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
                  <div className='flex flex-wrap items-center justify-end gap-1 px-3'>
                    <p>Balance: </p>
                    {!savingsAddressToken.isReady ? (
                      <PriceSkeleton />
                    ) : (
                      <p className='whitespace-nowrap'>{formatAmount(savingsAddressToken.balanceFormatted, '')} USDC</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='roundup-config' className='border-b-0'>
          <AccordionTrigger className='mt-6 px-6 py-4 border border-gray-300 rounded-lg'>
            Round-up Settings
          </AccordionTrigger>
          <AccordionContent className='mt-4 px-6 py-4 border border-gray-300 rounded-lg'>
            <div className='mt-1'>
              <RoundupAmountSelector />
            </div>

            <div className='mt-4'>
              <SavingsModeSelector />
            </div>

            <div className='mt-4 mb-1'>
              <YieldSwitch />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='advanced-options'>
          <AccordionTrigger className='mt-6 px-6 py-4 border border-gray-300 rounded-lg'>
            Advanced Options
          </AccordionTrigger>
          <AccordionContent className='mt-4 px-6 py-4 border border-gray-300 rounded-lg'>
            <div className='mt-1'>
              <ActiveSwitch />
            </div>

            <div className='mt-2'>
              <SavingsLimit />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className='mt-4'>
        <WithdrawSavings />
      </div>
    </div>
  );
}
