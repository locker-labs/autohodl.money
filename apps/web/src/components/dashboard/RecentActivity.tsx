import { CircleArrowDown, CircleArrowRight, CircleArrowUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { formatUnits } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { useSavingsTxs } from '@/hooks/useSavingsTxs';
import { getTransactionLink } from '@/lib/blockExplorer';
import { formatAmount } from '@/lib/math';
import { timeAgoFromHex } from '@/lib/time';
import Image from 'next/image';
import { useWithdrawalTxs } from '@/hooks/useWithdrawalTxs';
import { formatAddress } from '@/lib/string';
import { EAutoHodlTxType } from '@/enums';
import { getTokenDecimalsByAddress, getUsdcAddressByChain } from '@/lib/helpers';
import { sortByTimestampDesc } from '@/lib/helpers/sort';
import { useMemo } from 'react';
import { ChainDisplay } from '@/components/ui/ChainDisplay';

export function RecentActivity(): React.JSX.Element {
  const { allTxs: allSavingsTxs, loading: loadingSavings } = useSavingsTxs();

  const { allTxsFiltered: allWithdrawalTxs, loading: loadingWithdrawals } = useWithdrawalTxs();

  const loading = loadingWithdrawals || loadingSavings;

  const allTxs = useMemo(
    () => [...allSavingsTxs, ...allWithdrawalTxs].sort(sortByTimestampDesc),
    [allSavingsTxs, allWithdrawalTxs],
  );

  return (
    // py-4 pl-4 pr-0 lg:py-5 lg:pl-5 lg:pr-1
    <Card className='w-full m-0 py-5 pl-5 pr-1.5 h-[600px] max-h-[600px] min-h-[600px] group/container'>
      <CardContent className='m-0 p-0'>
        <div>
          <h2 className='font-medium text-black text-2xl'>Recent Activity</h2>
          <p className='font-normal text-[#6b6b6b] text-base'>Your latest round-up savings</p>
        </div>

        {loading || allTxs.length === 0 ? (
          <div className={'mt-[15px] w-full h-[480px] flex justify-center items-center'}>
            {loading ? (
              <Loader2 className={'animate-spin'} color={'#78E76E'} />
            ) : (
              <div className='pr-3.5'>
                <Image
                  className='mx-auto max-w-[128px] max-h-[128px]'
                  src={'/no-savings.png'}
                  alt='No recent transactions'
                  width={128}
                  height={128}
                  priority
                  unoptimized
                />
                <p className='mt-3 text-center text-lg font-semibold'>No savings yet!</p>
                <p className='mt-3 text-center'>
                  Round ups happen when you spend. Make a purchase with your card and start building your balance.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`mt-[15px] max-h-[508px]
              overflow-y-scroll scrollbar-thin
              scrollbar-track-transparent scrollbar-thumb-transparent
              scrollbar-thumb-rounded-full
              scrollbar-hover:scrollbar-thumb-[#AAAAAA]
              group-hover/container:scrollbar-thumb-[#BBBBBB]
              group-hover/container:scrollbar-track-transparent
              p-[2px]
              `}
          >
            {allTxs.map((tx, idx) => {
              const isWithdrawalTx = tx.type === EAutoHodlTxType.Withdrawal;
              const isSelfWithdrawal = isWithdrawalTx && tx.to.toLowerCase() === tx.from.toLowerCase();
              return (
                <Link
                  key={tx.id}
                  href={getTransactionLink(tx.txHash, tx.chainId)}
                  target='_blank'
                  className='no-underline rounded-[14px] transition-all ease-out duration-150'
                >
                  <div
                    className={`group/tx border border-gray-300 flex flex-col gap-5 rounded-xl cursor-pointer hover:bg-[#F5F5F5]
                      ${allTxs.length - 1 === idx ? 'mb-5' : 'mb-3'}
                      mr-1.5
                    `}
                  >
                    <div className='flex items-center justify-between px-3 py-3.5'>
                      <div className='flex items-center gap-[9px]'>
                        {isSelfWithdrawal ? (
                          <CircleArrowDown
                            className='group-hover/tx:-rotate-135 transition-transform duration-300 ease-in min-size-fit'
                            strokeWidth={1.5}
                            size={38}
                            color='#6B7280'
                          />
                        ) : isWithdrawalTx ? (
                          <CircleArrowRight
                            className='-rotate-45 transition-transform duration-300 ease-in min-size-fit'
                            strokeWidth={1.5}
                            size={38}
                            color='#F59E0B'
                          />
                        ) : (
                          <CircleArrowUp
                            className='group-hover/tx:rotate-45 transition-transform duration-300 ease-in min-size-fit'
                            strokeWidth={1.5}
                            size={38}
                            color='#22C55E'
                          />
                        )}

                        {/* Left div: Amount, title, savings chain */}
                        <div className='grid grid-rows-3 gap-[6px]'>
                          <div className='row-start-1 flex justify-start items-end'>
                            <p className='font-semibold text-black text-base text-left leading-[16px]'>
                              {formatAmount(
                                formatUnits(
                                  BigInt(tx.value ?? 0),
                                  getTokenDecimalsByAddress(getUsdcAddressByChain(tx.chainId)),
                                ),
                              )}
                            </p>
                          </div>
                          <div className='row-start-2'>
                            <p className='font-normal text-[#6b6b6b] text-sm text-left leading-[16px]'>
                              {isSelfWithdrawal
                                ? `Self withdrawal`
                                : isWithdrawalTx
                                  ? `Sent to ${formatAddress(tx.to)}`
                                  : 'Round-up saved'}
                            </p>
                          </div>
                          <div className='row-start-3 flex justify-start items-start'>
                            <ChainDisplay chainId={tx.chainId} />
                          </div>
                        </div>
                      </div>

                      {/* Right div: Timestamp, Source chain, Purchase amount */}
                      <div className='grid grid-rows-3 gap-[6px]'>
                        <div className='row-start-1 flex justify-end items-end'>
                          {/* For savings tx, show purchase amount */}
                          {!isWithdrawalTx && (
                            <p className='font-normal text-[#6b6b6b] text-[10px] text-right leading-[16px]'>
                              purchase:{' '}
                              {formatAmount(
                                formatUnits(
                                  BigInt(tx.purchaseValue),
                                  getTokenDecimalsByAddress(getUsdcAddressByChain(tx.chainId)),
                                ),
                              )}
                            </p>
                          )}
                        </div>
                        <div className='row-start-2'>
                          <p className='font-normal text-[#0f0f0f] text-sm text-right leading-[16px]'>
                            {tx?.timestamp ? timeAgoFromHex(tx.timestamp) : null}
                          </p>
                        </div>
                        <div className='row-start-3 flex justify-end items-start'>
                          {/* For savings tx: show source & savings chain */}
                          {!isWithdrawalTx && <ChainDisplay chainId={tx.sourceChainId} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
