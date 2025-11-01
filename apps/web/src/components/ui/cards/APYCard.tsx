import { TrendingUp } from 'lucide-react';
import { PriceSkeleton } from '@/components/subcomponents/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';

export function APYCard({
  loading,
  value,
  showWarning = false,
}: {
  loading: boolean;
  value: string | undefined;
  showWarning?: boolean;
}) {
  return (
    <Card
      className={`flex items-center justify-start rounded-xl border 
    ${showWarning ? 'border-red-500' : 'border-[#1CB01C]'}`}
    >
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <TrendingUp
          className={`min-w-10 min-h-10
          ${showWarning ? 'text-red-500' : 'text-[#1CB01C]'}`}
          size={40}
          strokeWidth={1}
          // color='#1CB01C'
        />
        <div>
          <div className='flex items-end gap-1'>
            <div
              className={`leading-none font-bold ${showWarning ? 'text-red-500' : 'text-[#78E76E]'} text-2xl text-left sm:text-center md:text-left`}
            >
              {loading ? <PriceSkeleton /> : <p>{value ? `${value}%` : '-'}</p>}
            </div>
          </div>

          {showWarning ? (
            <div className='mt-2'>
              <p className='text-lg font-semibold text-left sm:text-center md:text-left text-red-500'>
                You are missing out on yield!
              </p>
              <p className='text-base text-left sm:text-center md:text-left text-red-500'>
                Enable yield to maximize your savings
              </p>
            </div>
          ) : (
            <p className='mt-2 text-base text-left sm:text-center md:text-left text-black'>Current APY</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
