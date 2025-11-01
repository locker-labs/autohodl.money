import { CreditCard } from 'lucide-react';
import { PriceSkeleton } from '@/components/subcomponents/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/math';

export function YieldCard({ loading, value }: { loading: boolean; value: number }) {
  return (
    <Card className='flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <CreditCard className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />
        <div>
          <div className='flex items-end gap-1'>
            <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
              {loading ? <PriceSkeleton /> : <p>{formatAmount(value)}</p>}
            </div>
            <p className='font-light text-sm'>USDC</p>
          </div>
          <p className='mt-2 text-black text-base text-left sm:text-center md:text-left'>Yield Earned</p>
        </div>
      </CardContent>
    </Card>
  );
}
