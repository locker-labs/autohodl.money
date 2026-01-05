import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PriceSkeleton } from '@/components/ui/skeletons/PriceSkeleton';
import AdaptiveInfoTooltip from '@/components/ui/tooltips/AdaptiveInfoTooltip';
import { useLifetimeSavings } from '@/hooks/useLifetimeSavings';
import { formatAmount, roundOff } from '@/lib/math';

export function LifetimeSavingsCard() {
  const { data: savingsMap, isReady } = useLifetimeSavings();
  console.log('lifetimeSavingsMap', savingsMap?.entries());

  const total = savingsMap
    ? roundOff(
        Array.from(savingsMap.values()).reduce((acc, val) => acc + val, 0),
        2,
      )
    : 0;

  return (
    <Card className='flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <Wallet className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />
        <div>
          {!isReady ? (
            <PriceSkeleton />
          ) : (
            <div className='flex items-end gap-1'>
              <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
                <p>{formatAmount(total)}</p>
              </div>
              <p className='font-light text-sm'>USD</p>
            </div>
          )}
          <div className='mt-2 flex items-center justify-start gap-2'>
            <p className='text-black text-lg text-left sm:text-center md:text-left'>Lifetime Savings</p>
            <AdaptiveInfoTooltip content={'Lifetime spare change saved. Does not include yield.'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
