import { Wallet } from 'lucide-react';
import { PriceSkeleton } from '@/components/subcomponents/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/math';
import AdaptiveInfoTooltip from '@/components/ui/tooltips/AdaptiveInfoTooltip';

export function RoundupSavingsCard({ loading, value }: { loading: boolean; value: number }) {
  return (
    <Card className='flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <Wallet className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />
        <div>
          {loading ? (
            <PriceSkeleton />
          ) : (
            <div className='flex items-end gap-1'>
              <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
                <p>{formatAmount(value)}</p>
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
