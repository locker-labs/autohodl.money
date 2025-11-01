import {
  Lock,
  // MoveDown
} from 'lucide-react';
import type React from 'react';
import { formatUnits } from 'viem';
import ActiveSwitch from '@/components/subcomponents/ActiveSwitch';
import Button from '@/components/subcomponents/Button';
import RoundupAmountSelector from '@/components/subcomponents/RoundupAmountSelector';
import YieldSwitch from '@/components/subcomponents/YieldSwitch';
import { Card, CardContent } from '@/components/ui/card';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { formatAddress } from '@/lib/string';
import { useAccount } from 'wagmi';
import { CopyContentButton } from '../feature/CopyContentButton';
import { AccountBadge } from '../ui/account-badge';

export function Controls(): React.JSX.Element {
  const { address: userAddress } = useAccount();
  const { config, accounts } = useAutoHodl();
  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  return (
    <Card className='w-full m-0 py-5 pl-5 pr-5 h-full'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>Settings</h2>
        </div>

        <div className='mt-4 w-full'>
          <p className='text-lg'>Connected Account</p>
          <div className='mt-2 w-full border border-gray-300 rounded-xl px-3 py-3'>
            <div className='flex gap-2'>
              <CopyContentButton textToCopy={userAddress || ''} onCopyMessage='Address copied to clipboard'>
                {formatAddress(userAddress)}
              </CopyContentButton>
              {accounts.map((account) => {
                return <AccountBadge key={account} type={account} />;
              })}
            </div>
          </div>
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

        {/* Deposit Destination */}
        <div className='mt-4'>
          <div>
            <p className='text-lg'>Deposit Destination</p>
          </div>
          <div className='mt-2 w-full h-20 border border-gray-300 rounded-xl flex items-center justify-start gap-3 px-3'>
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
        </div>

        <div className='mt-4'>
          {/* TODO: implement withdraws savings */}
          <Button title='Withdraw Savings' className='w-full h-[40px]'>
            <span>Withdraw Savings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
