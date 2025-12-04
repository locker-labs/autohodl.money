import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { LoaderSecondary } from '@/components/ui/loader';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const yieldOptions = [
  {
    label: 'Earn yield',
    value: true,
    imgSrc: '/grow.svg',
    info: 'The change you save will be deposited to Aave and automatically earn yield',
  },
  {
    label: 'Idle savings',
    value: false,
    disabled: false,
    imgSrc: '/save.png',
    info: `The change you save will be deposited into an account of your choice but won't earn any yield`,
  },
];

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
            active: config.active,
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
    <div className='flex flex-col gap-1'>
      <label htmlFor={'Earn Yield'} className='text-sm font-medium text-black'>
        <div className='flex items-center justify-start gap-2'>
          <span className='text-sm'>What to do with savings:</span>
          {isPending && <LoaderSecondary />}
        </div>
      </label>
      <div className='w-full grid grid-cols-2 gap-2'>
        {yieldOptions.map((opt) => (
          <button
            type='button'
            onClick={() => {
              if (opt.disabled) {
                return;
              }
              setToYieldLocal(opt.value);
            }}
            disabled={opt.disabled}
            className={`flex flex-col items-center gap-4
                    border rounded-lg px-4 py-4 text-center
              ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
              ${opt.value === toYieldLocal ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold' : 'border-gray-300'}
              `}
            key={String(opt.value)}
          >
            <div className='max-w-[64px] max-h-[64px] flex items-center justify-center gap-2'>
              <Image
                className='h-[64px] w-auto aspect-auto'
                src={opt.imgSrc}
                alt={'img'}
                width={64}
                height={64}
                fetchPriority='high'
              />
            </div>
            <div className='flex items-center justify-center gap-2'>
              {opt.label}
              <Tooltip>
                <TooltipTrigger>
                  <Info size={16} className='h-4 w-4' />
                </TooltipTrigger>
                <TooltipContent>{opt.info}</TooltipContent>
              </Tooltip>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YieldSwitch;
