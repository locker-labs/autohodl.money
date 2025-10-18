import { APYCard, RoundupSavingsCard, YieldCard } from '@/components/ui/cards';
// import { chain } from '@/config';
// import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { useAaveYieldBalance } from '@/hooks/useAaveYieldBalance';
import { useSpareChange } from '@/hooks/useSpareChange';
// import { useTokenBalance } from '@/hooks/useTokenBalance';
// import { UsdcAddressMap } from '@/lib/constants';
// import type { Address } from 'viem';

export function SavingsInfoCards(): React.JSX.Element {
  // const { config } = useAutoHodl();

  // Yield balance from Aave Yield
  const {
    balanceFormatted: yieldBalance,
    isLoading: yieldBalanceLoading,
    isFetched: yieldBalanceFetched,
  } = useAaveYieldBalance();

  // APY from Aave
  const { apy, loading: apyLoading } = useAaveAPY();

  // Savings address balance
  // const {
  // balance: savingsBalanceBigInt,
  // isFetched: savingsBalanceFetched,
  // isFetching: savingsBalanceFetching,
  // balanceNumber: savingsBalance,
  // balanceString: savingsBalanceString,
  // } = useTokenBalance({
  //   token: UsdcAddressMap[chain.id],
  //   address: config?.savingAddress as Address,
  // });

  const { changeSaved, isFetched: changeFetched, isFetching: changeFetching } = useSpareChange();

  return (
    <div className='grid grid-cols-1 sm:col-span-3 sm:grid-cols-3 gap-5'>
      {/* Current yield balance - spare change saved */}
      <YieldCard loading={!yieldBalanceFetched && yieldBalanceLoading} value={String(yieldBalance)} />
      <APYCard loading={apyLoading} value={apy} />
      <RoundupSavingsCard loading={!changeFetched && changeFetching} value={String(changeSaved)} />
    </div>
  );
}
