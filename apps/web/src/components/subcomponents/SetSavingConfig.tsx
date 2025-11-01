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
  const [savingCap, setSavingCap] = useState(100); // default 100 USDC
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean | null>(null);
  const { allowanceFormatted } = useErc20Allowance({
    owner: address as Address,
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
  });

  const { approve, isPending, isConfirming, isConfirmed } = useERC20Approve({
    token: USDC_ADDRESS,
    spender: AUTOHODL_ADDRESS,
    amount: savingCap,
  });

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
    if (allowanceFormatted !== undefined && allowanceFormatted < savingCap) {
      setIsApprovalNeeded(true);
    }
  }, [allowanceFormatted, savingCap]);
  useEffect(() => {
    if (isConfirmed && isApprovalNeeded) {
      setIsApprovalNeeded(false);
    }
  }, [isConfirmed]);

  const title = `Setup Savings for ${account}`;
  const selectedOption = savingOptions.find((opt) => opt.value === roundUp);

  return (
    <div className='flex flex-col items-center gap-8'>
      <fieldset className='w-full rounded-lg p-6 shadow-smdisabled:opacity-60'>
        {title ? <legend className='px-1 text-xl font-bold text-center text-gray-700'>{title}</legend> : null}

        <div className='flex flex-col gap-6 mt-4'>
          {/* Choose Roundup amount */}
          {/* Dropdown */}
          <div className='flex flex-col gap-1'>
            <label htmlFor={String(roundUp)} className='text-xs font-medium text-gray-600'>
              Round-up amount
            </label>
            <div className='w-full grid grid-cols-3 gap-2'>
              {savingOptions.map((opt) => (
                <button
                  type='button'
                  onClick={() => setRoundUp(Number(opt.value))}
                  className={`border border-black rounded-xl px-2 py-2 text-center
              ${opt.value === roundUp ? 'bg-[#78E76E]/40 font-bold' : ''}`}
                  key={String(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className=''>
              Your {selectedOption?.purchase} purchase will help you save <strong>{selectedOption?.savings}</strong>!
            </p>
          </div>

          {/* Checkbox */}
          <div className='flex items-center gap-2'>
            <input
              id={'toYield'}
              type='checkbox'
              checked={toYield}
              onChange={(e) => setToYield(e.target.checked)}
              className='h-4 w-4 rounded border-gray-300 text-black focus:ring-black'
            />
            <label htmlFor={'toYield'} className='text-sm text-gray-700'>
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

          {/* Address input */}
          {!toYield && (
            <div className='flex flex-col gap-1'>
              <label htmlFor={savingsAddress} className='text-xs font-medium text-gray-600'>
                Saving Address
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
                className='h-10 rounded-md border border-gray-300 px-3 font-mono text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black'
              />
            </div>
          )}
          <div className='flex flex-col gap-2'>
            <label htmlFor={String(roundUp)} className='text-xs font-medium text-gray-600'>
              Saving Cap (USDC)
            </label>
            <input
              id={'savingCap'}
              type='number'
              value={savingCap}
              onChange={(e) => setSavingCap(Number(e.target.value))}
              className='h-10 rounded-md border border-gray-300 px-3 font-mono text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black'
            />
          </div>
        </div>
      </fieldset>
      {isApprovalNeeded ? (
        <Button title={'Add token allowance'} onAction={approve} disabled={disabled}>
          {isConfirming ? 'Confirming...' : isPending ? 'Allowing AutoHodl...' : 'Allow AutoHodl to save for you'}
        </Button>
      ) : null}
      {isApprovalNeeded === false ? (
        <Button title={'Finish Setup'} onAction={handleButtonClick} disabled={disabled}>
          {waitingForConfirmation ? 'Confirming...' : loading ? 'Setting up...' : 'Finish Setup'}
        </Button>
      ) : null}
    </div>
  );
}
