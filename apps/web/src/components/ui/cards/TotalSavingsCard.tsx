import { CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TotalSavingsCard({ loading, value }: { loading: boolean; value: string }) {
  return (
    <Card className='flex items-center justify-start rounded-xl border border-[#1CB01C]'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <CreditCard className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />
        <div>
          <div className='flex items-end gap-1'>
            <p className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
              {loading ? <Loader2 className={'animate-spin size-8'} color={'#000000'} /> : `$${value}`}
            </p>
            <p className='font-light text-sm'>USDC</p>
          </div>
          <p className='mt-2 text-black text-base text-left sm:text-center md:text-left'>Total Savings</p>
        </div>
      </CardContent>
    </Card>
  );
}
