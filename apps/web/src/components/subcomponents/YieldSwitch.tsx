import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { LoaderSecondary } from '@/components/ui/loader';

const YieldSwitch = () => {
  const { config, setConfig } = useAutoHodl();
  const { createConfig } = useCreateConfig();
  //   TODO: add error toast

  const [toYieldLocal, setToYieldLocal] = useState(config?.toYield ?? false);
  const isPending = toYieldLocal !== config?.toYield;

  useEffect(() => {
    async function iife() {
      if (!config?.savingAddress) return;

      const toYield = config.toYield;

      if (toYield !== toYieldLocal) {
        try {
          await createConfig({
            toYield: toYieldLocal,
            roundUp: Number(formatUnits(config.roundUp, TokenDecimalMap[USDC_ADDRESS])),
            savingsAddress: config.savingAddress,
            mode: config.mode,
          });
          setConfig((prev) => (prev ? { ...prev, toYield: toYieldLocal } : prev));
        } catch {
          setToYieldLocal(toYield);
        }
      }
    }
    iife();
  }, [toYieldLocal]);

  return (
    <div className='flex items-center justify-between gap-2'>
      <div>
        <div className='flex items-center justify-start gap-2'>
          <p className='text-lg'>Earn Yield</p>
          {isPending && <LoaderSecondary />}
        </div>

        <p className='text-[#4D4A4A] text-sm'>{config?.toYield ? 'Active' : 'Paused'}</p>
      </div>

      <Switch
        className={isPending ? 'cursor-progress' : 'disabled:cursor-not-allowed'}
        disabled={isPending}
        checked={toYieldLocal}
        onCheckedChange={setToYieldLocal}
      />
    </div>
  );
};

export default YieldSwitch;
