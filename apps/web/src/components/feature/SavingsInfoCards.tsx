import { APYCard, RoundupSavingsCard, YieldCard } from '@/components/ui/cards';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { useAaveYieldBalance } from '@/hooks/useAaveYieldBalance';
import { useSpareChange } from '@/hooks/useSpareChange';

export function SavingsInfoCards(): React.JSX.Element {
  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  const { changeSaved, isReady: readyChange } = useSpareChange();

  const { balanceFormatted: yieldBalance, isReady: readyYield } = useAaveYieldBalance();

  // Calculate yield earned = yield balance - spare change saved
  let yieldEarned = 0;
  if (readyYield && readyChange) {
    yieldEarned = yieldBalance - changeSaved;
  }

  return (
    <div className='grid grid-cols-1 sm:col-span-3 sm:grid-cols-3 gap-5'>
      <YieldCard loading={!readyYield} value={yieldEarned} />
      <APYCard loading={apyLoading} value={apy} />
      <RoundupSavingsCard loading={!readyChange} value={changeSaved} />
    </div>
  );
}
