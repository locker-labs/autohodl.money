import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { LoaderSecondary } from '@/components/ui/loader';

const ActiveSwitch = () => {
  const { config, setConfig } = useAutoHodl();
  const { createConfig } = useCreateConfig();
  //   TODO: add error toast
  const [activeLocal, setActiveLocal] = useState(config?.active ?? false);
  const isPending = activeLocal !== config?.active;

  useEffect(() => {
    async function iife() {
      if (!config?.savingAddress) return;

      const active = config.active;

      if (active !== activeLocal) {
        try {
          await createConfig({
            active: activeLocal,
            roundUp: Number(formatUnits(config.roundUp, TokenDecimalMap[USDC_ADDRESS])),
            savingsAddress: config.savingAddress,
          });
          setConfig((prev) => (prev ? { ...prev, active: activeLocal } : prev));
        } catch {
          setActiveLocal(active);
        }
      }
    }
    iife();
  }, [activeLocal, config?.savingAddress, createConfig]);

  return (
    <div className='flex items-center justify-between gap-2'>
      <div>
        <div className='flex items-center justify-start gap-2'>
          <p className='text-lg'>Savings Status</p>
          {isPending && <LoaderSecondary />}
        </div>
        <p className='text-[#4D4A4A] text-sm'>{config?.active ? 'Active' : 'Paused'}</p>
      </div>

      <Switch
        className={isPending ? 'cursor-progress' : 'disabled:cursor-not-allowed'}
        disabled={isPending}
        checked={activeLocal}
        onCheckedChange={setActiveLocal}
      />
    </div>
  );
};

export default ActiveSwitch;
