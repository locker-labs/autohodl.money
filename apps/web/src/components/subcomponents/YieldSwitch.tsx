import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';

const YieldSwitch = () => {
  const { config, setConfig } = useAutoHodl();
  const { createConfig } = useCreateConfig();
  //   TODO: add error toast

  const [toYieldLocal, setToYieldLocal] = useState(config?.toYield ?? false);

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
          });
          setConfig((prev) => (prev ? { ...prev, toYield: toYieldLocal } : prev));
        } catch {
          setToYieldLocal(toYield);
        }
      }
    }
    iife();
  }, [toYieldLocal, config?.savingAddress, createConfig]);

  return (
    <div className='flex items-center justify-end gap-2'>
      {toYieldLocal !== config?.toYield && <Loader2 className={`animate-spin size-5`} color={'#000000'} />}
      <Switch checked={toYieldLocal} onCheckedChange={setToYieldLocal} />
    </div>
  );
};

export default YieldSwitch;
