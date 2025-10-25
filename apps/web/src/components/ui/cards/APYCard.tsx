import { TrendingUp } from 'lucide-react';
import { PriceSkeleton } from '@/components/subcomponents/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';

export function APYCard({ loading, value }: { loading: boolean; value: string }) {
  return (
    <Card className='flex items-center justify-start rounded-xl border border-[#1CB01C]'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <TrendingUp className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#1CB01C' />
        <div>
          <div className='flex items-end gap-1'>
            <div className='leading-none font-bold text-[#78E76E] text-2xl text-left sm:text-center md:text-left'>
              {loading ? <PriceSkeleton /> : <p>{value}%</p>}
            </div>
          </div>
          <p className='mt-2 text-black text-base text-left sm:text-center md:text-left'>Current APY</p>
        </div>
      </CardContent>
    </Card>
  );
}
