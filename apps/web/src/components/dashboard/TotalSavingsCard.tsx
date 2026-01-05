import { CreditCard } from 'lucide-react';
import { PriceSkeleton } from '@/components/ui/skeletons/PriceSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount, roundOff } from '@/lib/math';
import Button from '@/components/subcomponents/Button';
import { getWalletClient } from '@wagmi/core';
import { config } from '@/config';
import { toastCustom } from '@/components/ui/toast';
import AdaptiveInfoTooltip from '@/components/ui/tooltips/AdaptiveInfoTooltip';
import { getSusdcAddressByChain, getTokenDecimalsByAddress } from '@/lib/helpers';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useSTokenBalances } from '@/hooks/useSTokenBalances';
import { formatUnits } from 'viem';
import { useMemo } from 'react';
const ticker='sUSDC';
const keyLs = `${ticker}Added`;
const valueLs = 'true';

export function TotalSavingsCard() {
  const { savingsChainId } = useAutoHodl();
  const { data: sTokenBalances, isReady } = useSTokenBalances();

  const tokenBalance = useMemo(() => {
    let sum = 0;
    for (const [cid, val] of sTokenBalances?.entries() || []) {
      sum += Number(formatUnits(val.balance, getTokenDecimalsByAddress(getSusdcAddressByChain(cid))));
    }
    return roundOff(sum, 2);
  }, [sTokenBalances]);

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
            symbol: ticker,
            decimals: getTokenDecimalsByAddress(SUSDC_ADDRESS),
          },
        },
      });

      if (wasAdded) {
        localStorage.setItem(keyLs, valueLs);
        toastCustom(`${ticker} added!`);
      } else {
        toastCustom('User rejected.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const isTokenAdded = typeof window !== 'undefined' && localStorage.getItem(keyLs) === valueLs;

  return (
    <Card className='flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <CreditCard className='min-w-10 min-h-10' size={40} strokeWidth={1} color='#000000' />

        <div className='w-full flex sm:flex-col items-center sm:items-start justify-between gap-3'>
          <div>
            {!isReady ? (
              <PriceSkeleton />
            ) : (
              <div className='flex items-end gap-1'>
                <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
                  <p>{formatAmount(tokenBalance)}</p>
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
              <Button title={'Import to Wallet'} onAction={handleAddToken}>
                Import to Wallet
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
