import {
  ExternalLink,
  Lock,
  // MoveDown
} from 'lucide-react';
import type React from 'react';
import { formatUnits } from 'viem';
import ActiveSwitch from '@/components/subcomponents/ActiveSwitch';
import RoundupAmountSelector from '@/components/subcomponents/RoundupAmountSelector';
import { WithdrawSavings } from '@/components/subcomponents/WithdrawSavings';
import YieldSwitch from '@/components/subcomponents/YieldSwitch';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { SupportedAccounts, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { formatAddress } from '@/lib/string';
import { useAccount } from 'wagmi';
import { CopyContentButton } from '../feature/CopyContentButton';
import Link from 'next/link';
import { paths } from '@/lib/paths';
import { PriceSkeleton } from './PriceSkeleton';
import { useERC20BalanceOf } from '@/hooks/useERC20Token';

export function Controls(): React.JSX.Element {
  const { address: userAddress } = useAccount();
  const { config, accounts, token } = useAutoHodl();
  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  const savingsAddressToken = useERC20BalanceOf({
    token: USDC_ADDRESS,
    address: config?.savingAddress,
    enabled: !!config?.savingAddress && !config?.toYield,
  });

  return (
    <Card className='w-full m-0 py-5 pl-5 pr-5 h-full'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>Settings</h2>
        </div>

        <div className='mt-4'>
          <ActiveSwitch />
        </div>

        <div className='mt-4'>
          <YieldSwitch />
        </div>

        <div className='mt-4'>
          <RoundupAmountSelector />

          <p className='mt-2 text-[#4D4A4A] text-sm'>
            Each purchase rounds up to the nearest $
            {formatUnits(BigInt(config?.roundUp || 0), TokenDecimalMap[USDC_ADDRESS])}
          </p>
        </div>

        <Link
          href={paths.GetMetaMaskCard}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-4 w-full text-base font-medium hover:underline inline-block decoration-[#661800]'
        >
          <div className='border-[#FF5C16]/50 text-[#661800] bg-gradient-to-br from-[#FF5C16]/30 to-[#FFA680]/30 h-10 border rounded-xl flex items-center justify-center gap-3 px-3'>
            {/* Get a MetaMask Card */}
            {accounts.includes(SupportedAccounts.MetaMask) ? null : (
              <div>
                <div className='flex items-center justify-center gap-1'>
                  <p>MetaMask Card not found! Get now</p>
                  <ExternalLink size={16} />
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Source of Funds */}
        <div className='mt-4 w-full'>
          <p className='text-lg'>Source of Funds</p>

          <div className='mt-2 w-full h-20 border border-gray-300 rounded-xl flex items-center justify-between gap-3 px-3'>
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
            <p className='text-lg'>Savings Destination</p>
          </div>
          <div className='mt-2 w-full h-20 border border-gray-300 rounded-xl flex items-center justify-between gap-3 px-3'>
            <div className='flex items-center justify-start gap-3'>
              <Lock className='min-w-5 min-h-5' size={20} />
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

        <div className='mt-4'>
          <WithdrawSavings />
        </div>
      </CardContent>
    </Card>
  );
}
