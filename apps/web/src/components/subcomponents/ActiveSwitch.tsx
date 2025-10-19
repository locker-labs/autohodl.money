import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';

const ActiveSwitch = () => {
  const { config, setConfig } = useAutoHodl();
  const { createConfig } = useCreateConfig();
  //   TODO: add error toast

  const [activeLocal, setActiveLocal] = useState(config?.active ?? false);

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
    <div className='flex items-center justify-end gap-2'>
      {activeLocal !== config?.active && <Loader2 className={`animate-spin size-5`} color={'#000000'} />}
      <Switch checked={activeLocal} onCheckedChange={setActiveLocal} />
    </div>
  );
};

export default ActiveSwitch;
