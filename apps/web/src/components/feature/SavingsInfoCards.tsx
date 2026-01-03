import { APYCard, RoundupSavingsCard, TotalSavingsCard } from '@/components/ui/cards';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { useSpareChange } from '@/hooks/useSpareChange';

export function SavingsInfoCards(): React.JSX.Element {
  const { config, sToken } = useAutoHodl();

  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  const { changeSaved, isReady: readyChange } = useSpareChange();

  const { balanceFormatted: tokenBalance, isReady: readyTokenBalance } = sToken;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5'>
      <TotalSavingsCard loading={!readyTokenBalance} value={tokenBalance} ticker={'sUSDC'} />
      <RoundupSavingsCard loading={!readyChange} value={changeSaved} />
      <APYCard loading={apyLoading} value={apy} showWarning={!!config && !config.toYield} />
    </div>
  );
}
