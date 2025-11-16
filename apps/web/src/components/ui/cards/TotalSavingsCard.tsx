import { CreditCard } from 'lucide-react';
import { PriceSkeleton } from '@/components/subcomponents/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/math';
import Button from '@/components/subcomponents/Button';
import { getWalletClient } from '@wagmi/core';
import { config } from '@/config';
import { S_USDC_ADDRESS, TokenDecimalMap } from '@/lib/constants';
import { toastCustom } from '../toast';

export function TotalSavingsCard({ loading, value, ticker }: { loading: boolean; value: number; ticker: string }) {
  async function handleAddToken() {
    const client = await getWalletClient(config);
    if (!client) return;

    try {
      const wasAdded = await client.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: S_USDC_ADDRESS,
            symbol: 'sUSDC',
            decimals: TokenDecimalMap[S_USDC_ADDRESS],
          },
        },
      });

      toastCustom(wasAdded ? 'sUSDC added!' : 'User rejected.');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card className='flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <CreditCard className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />

        <div className='w-full flex sm:flex-col items-center sm:items-start justify-between gap-3'>
          <div>
            {loading ? (
              <PriceSkeleton />
            ) : (
              <div className='flex items-end gap-1'>
                <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
                  <p>{formatAmount(value)}</p>
                </div>
                <p className='font-light text-sm'>{ticker}</p>
              </div>
            )}
            <p className='mt-2 text-black text-lg text-left sm:text-center md:text-left'>Total Savings</p>
          </div>
          <div>
            <Button title={'Add to Wallet'} onAction={handleAddToken}>
              Add to Wallet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
