import { MoveUpRight, Loader2, Lock, MoveDown } from 'lucide-react';
import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getTransactionLink } from '@/lib/blockExplorer';
import { formatUnits } from 'viem';
import { TOKEN_DECIMALS, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { SavingsInfoCards } from '@/components/feature/SavingsInfoCards';
// import { UpdateChainModeModal } from '@/components/feature/UpdateChainModeModal';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { useTransactions } from '@/hooks/useTransactions';
import RoundupAmountSelector from '@/components/subcomponents/RoundupAmountSelector';
import Button from '@/components/subcomponents/Button';
import ActiveSwitch from '@/components/subcomponents/ActiveSwitch';

const Dashboard = (): React.JSX.Element => {
  const { txs: transactions, loading } = useTransactions();
  const { config } = useAutoHodl();

  const { apy, loading: apyLoading } = useAaveAPY();

  return (
    <div className='max-w-[1080px] w-full px-2 sm:px-5 py-5 grid grid-cols-12 gap-5'>
      {/* Left side */}
      <div className='col-span-12 grid sm:grid-cols-3 gap-5'>
        {/* 1 - 2 - 3 */}
        <SavingsInfoCards />
      </div>

      {/* Right */}
      <div className='col-span-12 w-full flex flex-col md:flex-row gap-5'>
        {/* 4 - Recent Transactions Card */}
        <Card className='w-full m-0 p-5 h-full rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='m-0 p-0'>
            <div>
              <h2 className='mt-2 font-medium text-black text-2xl'>Recent Activity</h2>
              <p className='font-normal text-[#6b6b6b] text-base'>Your latest round-up savings</p>
            </div>

            {loading ? (
              <div className={'w-full h-full flex justify-center items-center'}>
                <Loader2 className={'animate-spin size-8'} color={'#ff7a45'} />
              </div>
            ) : transactions.length === 0 ? (
              <div className='mt-[15px] overflow-y-auto max-h-[274px] py-12 flex items-center justify-center w-full h-full '>
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className='mt-[15px] overflow-y-auto max-h-[274px]'>
                {transactions.map((transaction) => {
                  const hash = transaction.yieldDepositTxHash ?? transaction.spendTxHash;

                  return (
                    <Link
                      key={transaction.id}
                      href={getTransactionLink(transaction)}
                      target='_blank'
                      className='no-underline'
                    >
                      <div className='flex flex-col gap-5 mb-3 bg-[#f8f8f8] rounded-[5px] cursor-pointer hover:bg-[#f0f0f0] transition-colors duration-200'>
                        <div className='flex items-center justify-between px-3 py-3.5'>
                          <div className='flex items-center gap-[9px]'>
                            <div className='w-[23px] h-[23px] bg-[#d2e2fd] rounded-[11.5px] flex items-center justify-center'>
                              <MoveUpRight className='min-w-3 min-h-3' size={12} color='#1e40af' />
                            </div>
                            <div>
                              <p className='font-normal text-black text-base text-left'>
                                {`${hash.slice(0, 6)}...${hash.slice(-4)}`}
                              </p>
                              <p className='font-normal text-[#6b6b6b] text-xs text-left'>
                                {new Date(transaction.spendAt).toUTCString()}
                                {/* {moment().format('MMM D, hh:mm A')} */}
                              </p>
                            </div>
                          </div>

                          <div className='text-right'>
                            <p className='font-normal text-black text-base text-center'>
                              saved ${formatUnits(BigInt(transaction.yieldDepositAmount ?? 0), TOKEN_DECIMALS)}
                            </p>
                            <p className='font-normal text-[#6b6b6b] text-xs text-center'>
                              from ${formatUnits(BigInt(transaction.spendAmount), TOKEN_DECIMALS)}
                            </p>
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

        {/* 5 - Controls Card */}
        <Card className='w-full h-fit rounded-xl shadow-[0px_1px_4.2px_#00000040]'>
          <CardContent className='px-5'>
            <div>
              <h2 className='mt-2 font-medium text-black text-2xl'>Controls</h2>
            </div>

            <div className='mt-4 flex items-center justify-between gap-2'>
              <div>
                <p className='text-lg'>Auto HODL Status</p>
                <p className='text-[#4D4A4A] text-sm'>{config?.active ? 'Active' : 'Paused'}</p>
              </div>

              <ActiveSwitch />
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
              <div className='mt-2 w-full h-20 border border-black rounded-lg flex items-center justify-start gap-3 px-3'>
                <Lock className='min-w-5 min-h-5' size={20} />
                <div>
                  <p className='text-[15px]'>Aave Protocol</p>
                  <p className='mt-1 text-[#4D4A4A] text-sm'>Earning ~{apyLoading ? '--' : apy}% APY</p>
                </div>
              </div>
            </div>

            <div className='mt-4'>
              <Button title='Withdraw Savings' className='w-full'>
                <MoveDown strokeWidth={2} size={16} />
                <span>Withdraw Savings</span>
              </Button>
            </div>

            {/* <UpdateChainModeModal /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
