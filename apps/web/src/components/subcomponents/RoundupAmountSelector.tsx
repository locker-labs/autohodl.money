import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    async function iife() {
      if (!config?.savingAddress || !config?.roundUp) return;

      const roundUp = Number(formatUnits(config.roundUp, TokenDecimalMap[USDC_ADDRESS]));

      if (roundUp !== roundUpLocal) {
        try {
          await createConfig({
            roundUp: roundUpLocal,
            savingsAddress: config.savingAddress,
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
  }, [roundUpLocal, config?.savingAddress, createConfig]);

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={String(roundUpLocal)} className='text-lg flex items-center gap-2'>
        <span>Round-up Amount</span>
        <span className='text-sm text-gray-500 block'>
          {roundUpLocal !== Number(formatUnits(config?.roundUp || BigInt(0), TokenDecimalMap[USDC_ADDRESS])) && (
            <Loader2 className={`animate-spin size-5`} color={'#000000'} />
          )}
        </span>
      </label>
      <div className='w-full grid grid-cols-3 gap-2'>
        {savingOptions.map((opt) => (
          <button
            type='button'
            onClick={() => setRoundUpLocal(Number(opt.value))}
            className={`border border-black rounded-xl px-2 py-2 text-center
              ${opt.value === roundUpLocal ? 'bg-[#78E76E]/40 font-bold' : ''}`}
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
