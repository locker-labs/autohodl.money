// components/ActionInput.tsx
import { useEffect, useState } from 'react';
import type { SupportedAccounts } from '@/lib/constants';
import { paths } from '@/lib/paths';
import Button from './Button';
import useCreateConfig from '@/hooks/useCreateConfig';
import { useAccount } from 'wagmi';
import { isAddress, type Address } from 'viem';
import { useErc20Allowance, useERC20Approve } from '@/hooks/useERC20Token';
import { AUTOHODL_ADDRESS, USDC_ADDRESS } from '@/lib/constants';
import { toastCustom } from '../ui/toast';

type Props = {
  account: SupportedAccounts;
};

const savingOptions = [
  { label: '$1', value: 1, purchase: '$3.56', savings: '$0.44' },
  { label: '$10', value: 10, purchase: '$35', savings: '$5' },
  { label: '$100', value: 100, purchase: '$850', savings: '$50' },
];

export default function SetSavingConfig({ account }: Props) {
  const { address } = useAccount();
  const [roundUp, setRoundUp] = useState(savingOptions[0].value);
  const [toYield, setToYield] = useState(true);
  const [savingsAddress, setSavingsAddress] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [savingsCap, setSavingsCap] = useState(100); // default 100 USDC
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean | null>(null);
  const { allowanceFormatted } = useErc20Allowance({
    owner: address as Address,
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
  });

  const { approve, isPending, isConfirming, isConfirmed } = useERC20Approve({
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
    amount: savingsCap,
  });

  const handleApprove = () => {
    if (!savingsAddress || (isAddress(savingsAddress) === false && !useSameAddress)) {
      toastCustom('Please enter a valid savings address');
      return;
    }
    approve();
  };

  const disabled = !!savingsAddress && isAddress(savingsAddress) === false;

  const {
    handleCreateConfig,
    loading,
    // TODO: add error toast
    // error,
    waitingForConfirmation,
  } = useCreateConfig();
  const handleButtonClick = () => {
    handleCreateConfig({
      roundUp: roundUp,
      savingsAddress: (savingsAddress as Address) || (address as Address),
      toYield,
    });
  };
  useEffect(() => {
    if (allowanceFormatted !== undefined && allowanceFormatted < savingsCap) {
      setIsApprovalNeeded(true);
    }
  }, [allowanceFormatted, savingsCap]);
  useEffect(() => {
    if (isConfirmed && isApprovalNeeded) {
      setIsApprovalNeeded(false);
    }
  }, [isConfirmed]);

  const title = `Setup Savings for ${account}`;
  const selectedOption = savingOptions.find((opt) => opt.value === roundUp);

  return (
    <div className='flex flex-col items-center'>
      <fieldset className='w-full py-6 disabled:opacity-60'>
        {title ? <legend className='px-1 text-xl font-bold text-center text-gray-700'>{title}</legend> : null}

        <div className='flex flex-col gap-6'>
          {/* Choose Roundup amount */}
          {/* Dropdown */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-gray-600'>
              Round-up amount
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
            <p className='mt-2 text-gray-700'>
              Your {selectedOption?.purchase} purchase will help you save <strong>{selectedOption?.savings}</strong>!
            </p>
          </div>

          {/* Address input */}
          {
            <div className='flex flex-col gap-1'>
              <label htmlFor={savingsAddress} className='text-sm font-medium text-gray-600'>
                Savings address
              </label>
              <input
                id={savingsAddress}
                type='text'
                inputMode='text'
                autoComplete='off'
                spellCheck={false}
                placeholder='0x...'
                value={savingsAddress}
                onChange={(e) => setSavingsAddress(e.target.value)}
                readOnly={useSameAddress}
                className='h-10 rounded-md border border-gray-300 px-3 font-mono text-sm md:text-sm focus-visible:outline-none focus-visible:border-black transition-colors'
              />
              {/* Use same address Checkbox */}
              <div className='mt-1 flex items-start gap-2'>
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
                  className='mt-1 accent-app-green h-4 w-4 border-gray-300 text-black focus:ring-black'
                />
                <label htmlFor={'toYield'} className='text-gray-700'>
                  Use the connected address as Savings address
                </label>
              </div>
            </div>
          }

          {/* Yield Checkbox */}
          <div className='flex items-start gap-2'>
            <input
              id={'toYield'}
              type='checkbox'
              checked={toYield}
              onChange={(e) => setToYield(e.target.checked)}
              className='mt-1 accent-app-green bg-white h-4 w-4 border-gray-300 text-black focus:ring-black'
            />
            <label htmlFor={'toYield'} className='text-gray-700'>
              Yield savings (Earn yield on your savings.{' '}
              <a
                href={paths.GetMetaMaskCard}
                className='text-blue-500 hover:underline hover:underline-offset-1 transition-colors'
                target='_blank'
              >
                Learn more
              </a>
              )
            </label>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor={String(roundUp)} className='text-sm font-medium text-gray-600'>
              Savings cap (USDC)
            </label>
            <input
              id={'savingsCap'}
              type='number'
              value={savingsCap}
              onChange={(e) => setSavingsCap(Number(e.target.value))}
              className='h-10 rounded-md border border-gray-300 px-3 font-mono text-sm md:text-sm focus-visible:outline-none focus-visible:border-black transition-colors'
            />
          </div>
        </div>
      </fieldset>
      {isApprovalNeeded === true ? (
        <Button title={'Add token allowance'} onAction={handleApprove} disabled={disabled}>
          {isConfirming ? 'Confirming...' : isPending ? 'Allowing AutoHodl...' : 'Allow AutoHodl to save for you'}
        </Button>
      ) : isApprovalNeeded === false ? (
        <Button title={'Finish Setup'} onAction={handleButtonClick} disabled={disabled}>
          {waitingForConfirmation ? 'Confirming...' : loading ? 'Setting up...' : 'Finish Setup'}
        </Button>
      ) : (
        <Button title={'Loading'} onAction={() => {}} disabled={true}>
          {'Loading'}
        </Button>
      )}
    </div>
  );
}
