import { useEffect, useState } from 'react';
import { SupportedAccounts } from '@/lib/constants';
import Button from './Button';
import useCreateConfig from '@/hooks/useCreateConfig';
import { isAddress, type Address } from 'viem';
import { useErc20Allowance, useERC20Approve } from '@/hooks/useERC20Token';
import { AUTOHODL_ADDRESS, USDC_ADDRESS } from '@/lib/constants';
import { toastCustom } from '../ui/toast';
import { Switch } from '@/components/ui/switch';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { paths } from '@/lib/paths';
import { SavingsMode } from '@/types/autohodl';

type Props = {
  account: SupportedAccounts;
};

const savingOptions = [
  { label: '$1', value: 1, purchase: '$3.56', savings: '$0.44' },
  { label: '$10', value: 10, purchase: '$35', savings: '$5' },
  { label: '$100', value: 100, purchase: '$850', savings: '$50' },
];

export default function SetSavingConfig({ account }: Props) {
  const { address, accounts } = useAutoHodl();
  const [mode, setMode] = useState<SavingsMode>(SavingsMode.All);
  const [roundUp, setRoundUp] = useState(savingOptions[0].value);
  const [toYield, setToYield] = useState(true);
  const [savingsAddress, setSavingsAddress] = useState('');
  const [savingsCap, setSavingsCap] = useState<number | null>(100); // default 100 USDC
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean | null>(null);

  const hasMetaMaskCard = accounts.includes(SupportedAccounts.MetaMask);

  const { allowanceFormatted } = useErc20Allowance({
    owner: address as Address,
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
  });

  const {
    approve,
    isPending,
    isConfirming: isConfirmingAllowance,
    isConfirmed,
  } = useERC20Approve({
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
    amount: savingsCap ?? 0,
  });

  const handleApprove = () => {
    if (!savingsAddress || isAddress(savingsAddress) === false) {
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
    if (!savingsAddress || isAddress(savingsAddress) === false) {
      toastCustom('Please enter a valid savings address');
      return;
    }
    if (!savingsCap) {
      toastCustom('Please enter a valid savings limit');
      return;
    }

    handleCreateConfig({
      roundUp: roundUp,
      savingsAddress: (savingsAddress as Address) || (address as Address),
      toYield,
      mode,
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
    }
  }, [isConfirmed]);

  const title = `Setup Savings for ${account}`;

  const disabled = !!savingsAddress && isAddress(savingsAddress) === false;

  return (
    <div className='flex flex-col items-center'>
      <fieldset className='w-full py-6 disabled:opacity-60'>
        {title ? <legend className='px-1 text-xl font-bold text-center text-gray-700'>{title}</legend> : null}

        <div className='flex flex-col gap-4'>
          {/* Choose Roundup amount */}
          {/* Dropdown */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-black'>
              Choose round-up amount
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

          {/* Mode Toggle */}
          <div className='mt-2'>
            <div className='px-6 py-4 border border-gray-300 rounded-lg bg-app-green/10'>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-base font-medium'>Enable round-ups on all USDC payments</p>

                <Switch
                  className={isPending ? 'cursor-progress' : 'disabled:cursor-not-allowed'}
                  disabled={isPending || !hasMetaMaskCard}
                  checked={mode === SavingsMode.All}
                  onCheckedChange={(checkedBool) => {
                    if (!hasMetaMaskCard) {
                      setMode(SavingsMode.All);
                      return;
                    }

                    if (checkedBool) {
                      setMode(SavingsMode.All);
                    } else {
                      setMode(SavingsMode.MetamaskCard);
                    }
                  }}
                />
              </div>
            </div>
            {!hasMetaMaskCard ? (
              <div>
                <div className='py-3'>
                  <p className='text-gray-500 text-xs font-base font-normal'>{`MetaMask Card not detected. Round-ups are required.`}</p>
                </div>
                <hr className='border-gray-300' />
              </div>
            ) : null}
          </div>

          {/* Yield Toggle */}
          <div className='mt-2 px-6 py-4 border border-gray-300 rounded-lg bg-app-green/10'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-base font-medium'>Enable yield</p>
                <p className='font-normal text-xs text-gray-500'>
                  Grow your savings with yield (
                  <a href={paths.GetMetaMaskCard} target='blank' className='font-semibold'>
                    learn more
                  </a>
                  )
                </p>
              </div>

              <Switch
                className={isPending ? 'cursor-progress' : 'disabled:cursor-not-allowed'}
                disabled={isPending}
                checked={toYield}
                onCheckedChange={setToYield}
              />
            </div>
          </div>

          {/* Savings Address Input */}
          <div className='mt-2 flex flex-col gap-1'>
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
              // readOnly={useSameAddress}
              className='h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-app-green-dark transition-colors'
            />
            {/* Use same address Checkbox */}
            {/* <div className='mt-2 flex items-center gap-2'>
              <input
                id={'useSameAddress'}
                type='checkbox'
                checked={useSameAddress}
                onChange={(e) => {
                  setUseSameAddress(e.target.checked);
                  if (e.target.checked) {
                    setSavingsAddress(address as string);
                  } else {
                    setSavingsAddress('');
                  }
                }}
                className='accent-app-green h-4 w-4 border-gray-300 text-black focus:ring-black'
              />
              <label htmlFor={'useSameAddress'} className='text-gray-700'>
                Use the connected address as Savings address
              </label>
            </div> */}
          </div>

          {/* Advanced Options */}
          <Accordion className='mt-2' type='single' collapsible>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='px-6 py-4 border border-gray-300 rounded-lg bg-app-green/10'>
                Advanced Options
              </AccordionTrigger>
              <AccordionContent className='mt-6 px-6 py-4 border border-gray-300 rounded-lg bg-app-green/10'>
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
        </div>
      </fieldset>
      {isApprovalNeeded === true ? (
        <Button
          className='rounded-lg w-full'
          title={'Add token allowance'}
          onAction={handleApprove}
          disabled={disabled}
        >
          {isConfirmingAllowance ? 'Confirming...' : isPending ? 'Allowing...' : 'Set Allowance'}
        </Button>
      ) : isApprovalNeeded === false ? (
        <Button className='rounded-lg w-full' title={'Finish Setup'} onAction={handleFinishSetup} disabled={disabled}>
          {isConfirmingConfig ? 'Confirming...' : loading ? 'Setting up...' : 'Finish Setup'}
        </Button>
      ) : (
        <Button className='rounded-lg w-full' title={'Loading'} onAction={() => {}} disabled={true}>
          {'Loading'}
        </Button>
      )}
    </div>
  );
}
