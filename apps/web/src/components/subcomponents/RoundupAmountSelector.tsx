import useCreateConfig from '@/hooks/useCreateConfig';
import { TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';

const savingOptions = [
  { label: '$1 (Small saver)', value: 1, purchase: '$3.56', savings: '$0.44' },
  { label: '$10 (Medium saver)', value: 10, purchase: '$35', savings: '$5' },
  { label: '$100 (Large saver)', value: 100, purchase: '$850', savings: '$50' },
];

const RoundupAmountSelector = () => {
  const [roundUpLocal, setRoundUpLocal] = useState(savingOptions[0].value);
  const selectedOption = savingOptions.find((opt) => opt.value === roundUpLocal);

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
      <Select value={String(roundUpLocal)} onValueChange={(value) => setRoundUpLocal(Number(value))}>
        <SelectTrigger className='w-full h-10'>
          <SelectValue placeholder={selectedOption?.label} />
        </SelectTrigger>
        <SelectContent>
          {savingOptions.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoundupAmountSelector;
