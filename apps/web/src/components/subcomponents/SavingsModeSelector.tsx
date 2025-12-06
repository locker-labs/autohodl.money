import { Info } from 'lucide-react';
import useCreateConfig from '@/hooks/useCreateConfig';
import { SupportedAccounts, TokenDecimalMap, USDC_ADDRESS } from '@/lib/constants';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useEffect, useState } from 'react';
import { LoaderSecondary } from '@/components/ui/loader';
import Image from 'next/image';
import { SavingsMode } from '@/types/autohodl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatUnits } from 'viem';

const SavingsModeSelector = () => {
  const [mode, setMode] = useState<SavingsMode>(SavingsMode.All);
  const { config, setConfig, accounts } = useAutoHodl();
  //   TODO: add error toast
  const { createConfig } = useCreateConfig();

  const hasMetaMaskCard = accounts.includes(SupportedAccounts.MetaMask);

  const savingsModes = [
    {
      label: 'MetaMask Card only',
      value: SavingsMode.MetamaskCard,
      disabled: !hasMetaMaskCard,
      imgSrc: '/mmc.webp',
      info: 'Only save your spare change when you use your MetaMask Card.',
    },
    {
      label: hasMetaMaskCard ? 'All USDC transfers from Wallet and Card' : 'All USDC transfers',
      value: SavingsMode.All,
      disabled: false,
      imgSrc: '/USDCToken.svg',
      info: `Save your spare change, anytime you transfer USDC, regardless of whether it's with the MetaMask Card.`,
      imgSrc2: hasMetaMaskCard ? '/mmc.webp' : null,
    },
  ];

  const isPending = mode !== config?.mode;

  useEffect(() => {
    async function iife() {
      if (!config?.mode) return;

      if (mode !== config.mode) {
        try {
          await createConfig({
            roundUp: Number(formatUnits(config.roundUp, TokenDecimalMap[USDC_ADDRESS])),
            savingsAddress: config.savingAddress,
            active: config.active,
            toYield: config.toYield,
            mode,
          });
          setConfig((prev) => (prev ? { ...prev, mode } : prev));
        } catch {
          setMode(config?.mode);
        }
      }
    }
    iife();
  }, [mode]);

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={String(mode)} className='text-sm font-medium text-black flex items-center gap-2'>
        <span>Enable round-ups on:</span>
        <span className='text-sm text-gray-500 block'>{isPending && <LoaderSecondary />}</span>
      </label>
      <div className='w-full grid grid-cols-2 gap-2'>
        {savingsModes.map((opt) => (
          <button
            type='button'
            onClick={() => {
              if (opt.disabled) {
                return;
              }
              setMode(opt.value);
            }}
            disabled={opt.disabled}
            className={`flex flex-col items-center gap-4
                          border rounded-lg px-4 py-4 text-center
                      disabled:opacity-60
                    ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
                    ${opt.value === mode ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold' : 'border-gray-300'}
                    `}
            key={String(opt.value)}
          >
            <div className='max-h-[64px] min-h-[64px] h-[64px] flex items-center justify-center gap-2'>
              <Image
                className='h-[64px] w-auto aspect-auto'
                src={opt.imgSrc}
                alt={'img'}
                width={64}
                height={64}
                fetchPriority='high'
              />
              {opt.imgSrc2 ? <p>+</p> : null}
              {opt.imgSrc2 ? (
                <Image
                  className='h-[64px] w-auto aspect-auto'
                  src={opt.imgSrc2}
                  alt={'img'}
                  width={64}
                  height={64}
                  fetchPriority='high'
                />
              ) : null}
            </div>
            <div className='h-full flex items-center justify-center gap-2'>
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
      {hasMetaMaskCard ? null : (
        <div className='text-sm text-gray-700'>
          Since you don't have a metamask card, round-ups will be enabled only on your USDC transfers.
        </div>
      )}
    </div>
  );
};

export default SavingsModeSelector;
