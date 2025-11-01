import {
  APYCard,
  RoundupSavingsCard,
  TotalSavingsCard,
  // YieldCard
} from '@/components/ui/cards';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useAaveAPY } from '@/hooks/useAaveAPY';
// import { useAaveYieldBalance } from '@/hooks/useAaveYieldBalance';
import { useSpareChange } from '@/hooks/useSpareChange';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { S_USDC_ADDRESS, USDC_ADDRESS } from '@/lib/constants';
import { useAccount } from 'wagmi';

export function SavingsInfoCards(): React.JSX.Element {
  const { address: userAddress } = useAccount();
  const { config } = useAutoHodl();

  const tokenConfig = config?.toYield
    ? {
        token: S_USDC_ADDRESS,
        tokenBalanceAddr: userAddress,
        ticker: 'sUSDC',
      }
    : {
        token: USDC_ADDRESS,
        tokenBalanceAddr: config?.savingAddress,
        ticker: 'USDC',
      };
  // if yield is enabled, show sUSDC Balance (SYT)
  // if yield is disabled, show USDC Balance -> or sum of total transfers into savings address
  // if yield is disabled, show yield red which should tell users that they are missing out on y% yield

  const { data: apy, isLoading: apyLoading } = useAaveAPY();

  const { changeSaved, isReady: readyChange } = useSpareChange();

  const { balanceFormatted: tokenBalance, isReady: readyTokenBalance } = useTokenBalance({
    token: tokenConfig.token,
    address: tokenConfig.tokenBalanceAddr,
  });

  // const { balanceFormatted: yieldBalance, isReady: readyYield } = useAaveYieldBalance();

  // Calculate yield earned = yield balance - spare change saved
  // let yieldEarned = 0;
  // if (readyYield && readyChange) {
  //   yieldEarned = yieldBalance - changeSaved;
  // }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5'>
      <TotalSavingsCard loading={!readyTokenBalance} value={tokenBalance} ticker={tokenConfig.ticker} />
      {/* <YieldCard loading={!readyYield} value={yieldEarned} /> */}
      <RoundupSavingsCard loading={!readyChange} value={changeSaved} />
      <APYCard loading={apyLoading} value={apy} showWarning={!!config && !config.toYield} />
    </div>
  );
}
