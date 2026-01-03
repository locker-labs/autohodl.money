import { CreditCard } from 'lucide-react';
import { PriceSkeleton } from '@/components/ui/skeletons/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/math';
import Button from '@/components/subcomponents/Button';
import { getWalletClient } from '@wagmi/core';
import { config } from '@/config';
import { toastCustom } from '../toast';
import AdaptiveInfoTooltip from '@/components/ui/tooltips/AdaptiveInfoTooltip';
import { getSusdcAddressByChain, getTokenDecimalsByAddress } from '@/lib/helpers';
import { useAutoHodl } from '@/context/AutoHodlContext';

export function TotalSavingsCard({ loading, value, ticker }: { loading: boolean; value: number; ticker: string }) {
  const isTokenAdded = typeof window !== 'undefined' && localStorage.getItem('sUSDCAdded') === 'true';
  const { savingsChainId } = useAutoHodl();

  async function handleAddToken() {
    const client = await getWalletClient(config);
    if (!client) return;

    const SUSDC_ADDRESS = getSusdcAddressByChain(savingsChainId);

    try {
      const wasAdded = await client.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: SUSDC_ADDRESS,
            symbol: 'sUSDC',
            decimals: getTokenDecimalsByAddress(SUSDC_ADDRESS),
          },
        },
      });

      if (wasAdded) {
        localStorage.setItem('sUSDCAdded', 'true'); // Set the flag in localStorage
        toastCustom('sUSDC added!');
      } else {
        toastCustom('User rejected.');
      }
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
            <div className='mt-2 flex items-center justify-start gap-2'>
              <p className='text-black text-lg text-left sm:text-center md:text-left'>Current Balance</p>

              <AdaptiveInfoTooltip
                content={
                  'You automatically earn yield from your sUSDC balance. When you send sUSDC to another wallet, it converts into USDC.'
                }
              />
            </div>
          </div>
          <div>
            {!isTokenAdded && (
              <Button title={'Add to Wallet'} onAction={handleAddToken}>
                Import to Wallet
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
