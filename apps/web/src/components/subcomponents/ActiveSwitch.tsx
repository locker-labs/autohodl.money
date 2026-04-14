import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { LoaderSecondary } from '@/components/ui/loader';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap } from '@/lib/constants';
import { getUsdcAddressByChain } from '@/lib/helpers';
import { SavingsConfig, ScheduleConfig } from "@/types/autohodl";
import useCreateScheduleConfig from "@/hooks/useCreateScheduleConfig";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { useConnection } from "wagmi";

const ActiveSwitch = () => {
  const { address, chainId, connector } = useConnection();
  const { data: isSmartWallet } = useSmartWallet(address, chainId);
  const isCoinbaseFlow = connector?.id === "coinbaseWalletSDK" && isSmartWallet;
  const {
    config: roundUpConfig,
    setConfig,
    savingsChainId,
    scheduleConfig,
  } = useAutoHodl();
  const isScheduleSaving: boolean = !!scheduleConfig && !!isCoinbaseFlow;
  const config = roundUpConfig || scheduleConfig;
  const { createConfig } = useCreateConfig();
  const { createScheduleConfig } = useCreateScheduleConfig();
  //   TODO: add error toast
  const [activeLocal, setActiveLocal] = useState(config?.active ?? false);
  const isPending = activeLocal !== config?.active;

  useEffect(() => {
    async function iife() {
      if (!config?.savingAddress || !savingsChainId) return;
      const usdc = getUsdcAddressByChain(savingsChainId);

      const active = config.active;

      if (active !== activeLocal) {
        if (isScheduleSaving) {
          try {
            await createScheduleConfig({
              active: activeLocal,
              scheduleAmount: Number((config as ScheduleConfig).scheduleAmount),
              cycle: (config as ScheduleConfig).scheduleCycle,
              savingsAddress: config.savingAddress,
              mode: config.mode,
              toYield: config.toYield,
              savingsChainId,
            });
            setConfig((prev) =>
              prev ? { ...prev, active: activeLocal } : prev,
            );
          } catch {
            setActiveLocal(active);
          }
          return;
        }
        try {
          await createConfig({
            active: activeLocal,
            roundUp: Number(
              formatUnits(
                (config as SavingsConfig).roundUp,
                TokenDecimalMap[usdc],
              ),
            ),
            savingsAddress: config.savingAddress,
            mode: config.mode,
            toYield: config.toYield,
            savingsChainId,
          });
          setConfig((prev) => (prev ? { ...prev, active: activeLocal } : prev));
        } catch {
          setActiveLocal(active);
        }
      }
    }
    iife();
  }, [activeLocal]);

  useEffect(() => {
    if (config?.active !== undefined) {
      setActiveLocal(config?.active);
    }
  }, [config?.active]);

  return (
    <div className='flex items-center justify-between gap-2'>
      <div>
        <div className='flex items-center justify-start gap-2'>
          <p className='text-sm font-medium leading-[20px]'>Enable autoHODL</p>
          {isPending && <LoaderSecondary />}
        </div>
        <p className='text-[#4D4A4A] text-sm leading-[20px]'>{config?.active ? 'Active' : 'Paused'}</p>
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
