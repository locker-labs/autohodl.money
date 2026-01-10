import { CreditCard, Loader2 } from 'lucide-react';
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
import { useMemo, useState } from 'react';
import { TokenTickerMap } from '@/lib/constants';
import { useConnection } from 'wagmi';

const valueLs = 'true';

export function TotalSavingsCard() {
  const [loading, setLoading] = useState(false);

  const { address } = useConnection();
  const { savingsChainId } = useAutoHodl();
  const { data: sTokenBalances, isReady } = useSTokenBalances();

  const ticker = TokenTickerMap[getSusdcAddressByChain(savingsChainId)];
  const keyLs = `${ticker}:${address}`;

  const tokenBalance = useMemo(() => {
    let sum = 0;
    for (const [cid, val] of sTokenBalances?.entries() || []) {
      sum += Number(formatUnits(val.balance, getTokenDecimalsByAddress(getSusdcAddressByChain(cid))));
    }
    return roundOff(sum, 2);
  }, [sTokenBalances]);

  async function handleAddToken() {
    setLoading(true);
    const client = await getWalletClient(config);
    if (!client) {
      setLoading(false);
      toastCustom('Wallet not connected');
      return;
    }

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
      console.warn(err);
      toastCustom(err instanceof Error ? err.message.split('.')[0] : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isTokenAdded = typeof window !== 'undefined' && localStorage.getItem(keyLs) === valueLs;

  return (
    <Card className='py-4 px-5 flex items-center justify-start rounded-xl border border-app-green'>
      <CardContent className='h-full w-full flex flex-row sm:flex-col items-start gap-3'>
        {/* Icon */}
        <CreditCard className='min-w-6 min-h-6' size={24} strokeWidth={1} color='#000000' />

        <div className='w-full flex sm:flex-col items-center sm:items-start justify-between gap-3'>
          <div>
            {!isReady ? (
              <PriceSkeleton />
            ) : (
              <div className='w-full flex flex-wrap items-center justify-between gap-3'>
                <div className='flex items-end gap-1'>
                  <div className='leading-none font-bold text-[#000000] text-2xl text-left sm:text-center md:text-left'>
                    <p>{formatAmount(tokenBalance)}</p>
                  </div>
                  <p className='font-light text-sm'>{ticker}</p>
                </div>

                <div>
                  {!isTokenAdded && (
                    <Button
                      className='px-[10px] py-[4px] transition-all duration-200 ease-in-out'
                      btnStyle='primary'
                      title={'Import token'}
                      onAction={handleAddToken}
                      disabled={loading}
                    >
                      <div className='flex items-center justify-center gap-1'>
                        <span>Import to wallet</span>
                        {loading && <Loader2 className='h-3 w-3 animate-spin' />}
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className='mt-1 flex items-center justify-start gap-2'>
              <p className='text-black text-lg text-left sm:text-center md:text-left'>Current Balance</p>

              <AdaptiveInfoTooltip
                content={`You automatically earn yield from your ${ticker} balance. When you send ${ticker} to another wallet, it converts into USDC.`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
