import { Lock, MoveDown } from 'lucide-react';
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

export function Controls(): React.JSX.Element {
  const { config } = useAutoHodl();
  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  return (
    <Card className='w-full m-0 py-5 pl-5 pr-5 h-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>Controls</h2>
        </div>

        <div className='mt-4 flex items-center justify-between gap-2'>
          <div>
            <p className='text-lg'>Savings Status</p>
            <p className='text-[#4D4A4A] text-sm'>{config?.active ? 'Active' : 'Paused'}</p>
          </div>

          <ActiveSwitch />
        </div>

        <div className='mt-4 flex items-center justify-between gap-2'>
          <div>
            <p className='text-lg'>Earn Yield</p>
            <p className='text-[#4D4A4A] text-sm'>{config?.toYield ? 'Active' : 'Paused'}</p>
          </div>

          <YieldSwitch />
        </div>

        <div className='mt-4'>
          <RoundupAmountSelector />

          <p className='mt-2 text-[#4D4A4A] text-sm'>
            Each purchase rounds up to the nearest $
            {formatUnits(BigInt(config?.roundUp || 0), TokenDecimalMap[USDC_ADDRESS])}
          </p>
        </div>

        <div className='mt-4'>
          <div>
            <p className='text-lg'>Deposit Destination</p>
          </div>
          <div className='mt-2 w-full h-20 border border-black rounded-xl flex items-center justify-start gap-3 px-3'>
            <Lock className='min-w-5 min-h-5' size={20} />
            <div>
              <p className='text-[15px]'>Aave Protocol</p>
              <p className='mt-1 text-[#4D4A4A] text-sm'>Earning ~{apyLoading ? '--' : apy}% APY</p>
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <Button title='Withdraw Savings' className='w-full h-[40px]'>
            <MoveDown strokeWidth={2} size={16} />
            <span>Withdraw Savings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
