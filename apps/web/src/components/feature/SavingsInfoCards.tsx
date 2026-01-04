import { formatUnits } from 'viem';
import {
  APYCard,
  LifetimeSavingsCard,
  TotalSavingsCard,
} from '@/components/ui/cards';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { useLifetimeSavings } from '@/hooks/useLifetimeSavings';
import { useSTokenBalances } from '@/hooks/useSTokenBalances';
import { getSusdcAddressByChain, getTokenDecimalsByAddress } from '@/lib/helpers';
import { roundOff } from '@/lib/math';

export function SavingsInfoCards(): React.JSX.Element {
  const { config } = useAutoHodl();

  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  const { changeSaved, isReady: readyChange } = useLifetimeSavings();

  const { data: sTokenBalances, isLoading: loadingSTokenBalances, isFetched: fetchedSTokenBalances } = useSTokenBalances();
  const readySTokenBalances = fetchedSTokenBalances && !loadingSTokenBalances;
  let sum = 0;
  for (const [cid, val] of sTokenBalances?.entries() || []) {
    sum += Number(formatUnits(val.balance, getTokenDecimalsByAddress(getSusdcAddressByChain(cid))));
  }
  const tokenBalance = roundOff(sum, 2);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5'>
      <TotalSavingsCard loading={!readySTokenBalances} value={tokenBalance} ticker={'sUSDC'} />
      <LifetimeSavingsCard loading={!readyChange} value={changeSaved} />
      <APYCard loading={apyLoading} value={apy} showWarning={!!config && !config.toYield} />
    </div>
  );
}
