import { useEffect, useState } from 'react';
import { type EChainId, SupportedAccounts } from '@/lib/constants';
import Button from './Button';
import useCreateConfig from '@/hooks/useCreateConfig';
import { isAddress, type Address } from 'viem';
import { useErc20Allowance, useERC20Approve } from '@/hooks/useERC20Token';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SavingsMode } from '@/types/autohodl';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import AdaptiveInfoTooltip from '@/components/ui/tooltips/AdaptiveInfoTooltip';
import ChainSelector from './ChainSelector';
import { useConnection } from 'wagmi';
import { getSavingsModes, savingOptions, yieldOptions } from '@/config';
import { getAutoHodlAddressByChain, getUsdcAddressByChain } from '@/lib/helpers';
import { toastCustom } from '../ui/toast';

export default function SetSavingConfig() {
  const { address, accountsMap } = useAutoHodl();

  const [mode, setMode] = useState<SavingsMode>(SavingsMode.All);
  const [roundUp, setRoundUp] = useState(savingOptions[0].value);
  const [toYield, setToYield] = useState(true);
  const [savingsAddress, setSavingsAddress] = useState('');
  const [savingsCap, setSavingsCap] = useState<number | null>(100); // default 100 USDC
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean | null>(null);

  const { chain } = useConnection();

  const savingsChainId = chain?.id as EChainId;
  const accounts = accountsMap?.get(savingsChainId) || [];

  const [autohodl, usdc] = [getAutoHodlAddressByChain(savingsChainId), getUsdcAddressByChain(savingsChainId)]

  const hasMetaMaskCard = accounts.includes(SupportedAccounts.MetaMask);
  const savingsModes = getSavingsModes(hasMetaMaskCard);

  const { allowanceFormatted } = useErc20Allowance({
    chainId: savingsChainId,
    owner: address,
    token: usdc,
    spender: autohodl,
  });

  const {
    approve,
    isPending,
    isConfirming: isConfirmingAllowance,
    isConfirmed,
  } = useERC20Approve({
    chainId: savingsChainId,
    token: usdc,
    spender: autohodl,
    amount: savingsCap ?? 0,
  });

  const handleApprove = () => {
    if (!toYield && isAddress(savingsAddress) === false) {
      toastCustom('Please enter a valid savings address');
      return;
    }
    approve();
  };

  const {
    handleCreateConfig,
    loading,
    // TODO: add error toast
    // error,
    waitingForConfirmation: isConfirmingConfig,
  } = useCreateConfig();

  const handleFinishSetup = () => {
    if (!toYield && isAddress(savingsAddress) === false) {
      toastCustom('Please enter a valid savings address');
      return;
    }
    if (!savingsCap) {
      toastCustom('Please enter a valid savings limit');
      return;
    }

    handleCreateConfig({
      roundUp: roundUp,
      savingsAddress: toYield ? (address as Address) : (savingsAddress as Address),
      toYield,
      mode,
      active: true,
      savingsChainId,
    });
  };

  useEffect(() => {
    if (allowanceFormatted !== undefined && allowanceFormatted < (savingsCap ?? 0)) {
      setIsApprovalNeeded(true);
    } else {
      setIsApprovalNeeded(false);
    }
  }, [allowanceFormatted, savingsCap]);
  useEffect(() => {
    if (isConfirmed) {
      setIsApprovalNeeded(false);
      handleFinishSetup();
    }
  }, [isConfirmed]);

  if (!chain) return null;

  const title = `Setup Round-Up Savings`;

  const disabled = !!savingsAddress && isAddress(savingsAddress) === false;

  return (
    <div className='flex flex-col items-center max-w-md'>
      <fieldset className='w-full py-6 disabled:opacity-60'>
        {title ? <legend className='px-1 text-xl font-bold text-center text-gray-700'>{title}</legend> : null}

        <div className='flex flex-col gap-4'>
          {/* Choose Roundup amount */}
          {/* Dropdown */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-black'>
              Choose round-up amount:
            </label>
            <div className='w-full grid grid-cols-3 gap-2'>
              {savingOptions.map((opt) => (
                <button
                  type='button'
                  onClick={() => setRoundUp(Number(opt.value))}
                  className={`border rounded-lg px-2 py-2 text-center
              ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
              ${
                opt.value === roundUp
                  ? isPending
                    ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold animate-pulse'
                    : 'border-[#78E76E] bg-[#78E76E]/50 font-semibold'
                  : 'border-gray-300'
              }
              `}
                  key={String(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Mode */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-black'>
              Enable round-ups on:
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
                    max-w-[250px]
              ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
              ${opt.value === mode ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold' : 'border-gray-300'}
              `}
                  key={String(opt.value)}
                >
                  <div className='max-w-[64px] max-h-[64px] h-[64px] flex items-center justify-center gap-2'>
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
                    <AdaptiveInfoTooltip content={opt.info} />
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
          {/* Yield */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-black'>
              What to do with savings:
            </label>
            <div className='w-full grid grid-cols-2 gap-2'>
              {yieldOptions.map((opt) => (
                <button
                  type='button'
                  onClick={() => {
                    if (opt.disabled) {
                      return;
                    }
                    setToYield(opt.value);
                  }}
                  disabled={opt.disabled}
                  className={`flex flex-col items-center gap-4
                    border rounded-lg px-4 py-4 text-center
              ${isPending ? 'cursor-progress' : 'cursor-pointer disabled:cursor-not-allowed'}
              ${opt.value === toYield ? 'border-[#78E76E] bg-[#78E76E]/50 font-semibold' : 'border-gray-300'}
              `}
                  key={String(opt.value)}
                >
                  <div className='max-h-[64px] max-w-[64px] h-[64px] flex items-center justify-center gap-2'>
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
                    <AdaptiveInfoTooltip content={opt.info} />
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Savings Address Input */}
          <AnimatePresence>
            {!toYield && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -40 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -40 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: 'top' }}
                className={'mt-2 flex flex-col gap-1'}
              >
                <label htmlFor={'savingsAddress'} className='text-sm font-medium text-black'>
                  Savings address
                </label>
                <input
                  id={'savingsAddress'}
                  type='text'
                  inputMode='text'
                  autoComplete='off'
                  spellCheck={false}
                  placeholder='0x...'
                  value={savingsAddress}
                  onChange={(e) => setSavingsAddress(e.target.value)}
                  className='h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-app-green-dark transition-colors'
                />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Advanced Options */}
          <Accordion className='mt-2' type='single' collapsible>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='px-6 py-4 border border-gray-300 rounded-lg'>
                Advanced Options
              </AccordionTrigger>
              <AccordionContent className='mt-6 px-6 py-4 border border-gray-300 rounded-lg'>
                {/* Savings limit input */}
                <div className='flex flex-col gap-2'>
                  <label htmlFor={'savingsCap'} className='text-sm font-medium text-black'>
                    Savings limit (USDC)
                  </label>
                  <input
                    id={'savingsCap'}
                    type='text'
                    value={savingsCap !== null ? savingsCap : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = Number(val);
                      if (val === '') {
                        setSavingsCap(null);
                      } else if (!Number.isNaN(num) && num >= 0) {
                        setSavingsCap(num);
                      }
                    }}
                    className='h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-app-green-dark transition-colors'
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Select savings chain */}
          <div className='w-full flex items-center justify-between gap-4'>
            <div className='text-sm font-semibold'>Choose your savings chain:</div>
            <ChainSelector defaultChainId={chain.id} />
          </div>
        </div>
      </fieldset>
      {isApprovalNeeded === true ? (
        <Button
          className='rounded-lg w-full'
          title={'Add token allowance'}
          onAction={handleApprove}
          disabled={disabled}
        >
          {isConfirmingAllowance ? 'Confirming...' : isPending ? 'Processing...' : 'Continue'}
        </Button>
      ) : isApprovalNeeded === false ? (
        <Button className='rounded-lg w-full' title={'Start saving'} onAction={handleFinishSetup} disabled={disabled}>
          {isConfirmingConfig ? 'Confirming...' : loading ? 'Setting up...' : 'Start saving'}
        </Button>
      ) : (
        <Button className='rounded-lg w-full' title={'Loading'} onAction={() => {}} disabled={true}>
          {'Loading'}
        </Button>
      )}
    </div>
  );
}
