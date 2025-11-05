import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { LoaderSecondary } from '@/components/ui/loader';

const savingOptions = [
  { label: '$1', value: 1, purchase: '$3.56', savings: '$0.44' },
  { label: '$10', value: 10, purchase: '$35', savings: '$5' },
  { label: '$100', value: 100, purchase: '$850', savings: '$50' },
];

const RoundupAmountSelector = () => {
  const [roundUpLocal, setRoundUpLocal] = useState(savingOptions[0].value);
  const { config, setConfig } = useAutoHodl();
  //   TODO: add error toast
  const { createConfig } = useCreateConfig();

  const roundUp = Number(formatUnits(config?.roundUp || BigInt(0), TokenDecimalMap[USDC_ADDRESS]));
  const isPending = roundUp !== roundUpLocal;

  useEffect(() => {
    async function iife() {
      if (!config?.savingAddress || !config?.roundUp) return;

      if (roundUp !== roundUpLocal) {
        try {
          await createConfig({
            roundUp: roundUpLocal,
            savingsAddress: config.savingAddress,
            mode: config.mode,
          });
          setConfig((prev) =>
            prev ? { ...prev, roundUp: BigInt(roundUpLocal * 10 ** TokenDecimalMap[USDC_ADDRESS]) } : prev,
          );
        } catch {
          setRoundUpLocal(roundUp);
        }
      }
    }
    iife();
  }, [roundUpLocal]);

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={String(roundUpLocal)} className='text-lg flex items-center gap-2'>
        <span>Round-up Amount</span>
        <span className='text-sm text-gray-500 block'>
          {roundUpLocal !== Number(formatUnits(config?.roundUp || BigInt(0), TokenDecimalMap[USDC_ADDRESS])) && (
            <LoaderSecondary />
          )}
        </span>
      </label>
      <div className='w-full grid grid-cols-3 gap-2'>
        {savingOptions.map((opt) => (
          <button
            type='button'
            onClick={() => {
              if (isPending) return;
              setRoundUpLocal(Number(opt.value));
            }}
            className={`border rounded-lg px-2 py-2 text-center
              ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
              ${
                opt.value === roundUpLocal
                  ? isPending
                    ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold animate-pulse'
                    : 'border-[#78E76E] bg-[#78E76E]/50 font-semibold'
                  : 'border-gray-300'
              }`}
            key={String(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoundupAmountSelector;
