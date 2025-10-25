import { CircleArrowUp, CircleChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { formatUnits } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { useSavingsTxs } from '@/hooks/useSavingsTxs';
import { getTransactionLink } from '@/lib/blockExplorer';
import { TOKEN_DECIMALS } from '@/lib/constants';
import { truncateToTwoDecimals } from '@/lib/math';
import { timeAgo } from '@/lib/time';

export function RecentActivity(): React.JSX.Element {
  const { allTxs, loading, fetchNext, hasNext } = useSavingsTxs();

  return (
    <Card className='w-full m-0 py-5 pl-5 pr-5 h-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>Recent Activity</h2>
          <p className='font-normal text-[#6b6b6b] text-base'>Your latest round-up savings</p>
        </div>

        {allTxs.length === 0 ? (
          <div className={'mt-[15px] w-full h-[393px] flex justify-center items-center'}>
            {loading ? <Loader2 className={'animate-spin'} color={'#78E76E'} /> : <p>No recent transactions</p>}
          </div>
        ) : (
          <div className='mt-[15px] overflow-y-auto max-h-[393px]'>
            {allTxs.map((tx) => (
              <Link key={tx.id} href={getTransactionLink(tx.txHash)} target='_blank' className='no-underline'>
                <div className='group border border-black/50 flex flex-col gap-5 mb-3 rounded-xl cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-300'>
                  <div className='flex items-center justify-between px-3 py-3.5'>
                    <div className='flex items-center gap-[9px]'>
                      <CircleArrowUp
                        className='group-hover:rotate-45 transition-transform duration-300 min-size-fit'
                        strokeWidth={1.5}
                        size={38}
                        color='#1B8111'
                      />
                      <div>
                        <p className='font-semibold text-black text-base text-left'>
                          ${truncateToTwoDecimals(formatUnits(BigInt(tx.value ?? 0), TOKEN_DECIMALS))}
                        </p>
                        <p className='font-normal text-left'>Deposited to aave</p>
                      </div>
                    </div>

                    <div>
                      <p className='font-normal text-[#0f0f0f] text-base text-right'>{timeAgo(tx.timestamp)}</p>
                      <p className='font-normal text-black text-base text-right'>
                        purchase - ${truncateToTwoDecimals(formatUnits(BigInt(tx.purchaseValue), TOKEN_DECIMALS))}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {hasNext && (
              <button
                type='button'
                title='Load more'
                onClick={fetchNext}
                className='w-full py-2 px-2 flex items-center justify-center border border-black/50 gap-5 rounded-xl cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-300'
              >
                {loading ? (
                  <Loader2 className={'animate-spin'} color='#78E76E' />
                ) : (
                  <CircleChevronDown strokeWidth={1.5} />
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
