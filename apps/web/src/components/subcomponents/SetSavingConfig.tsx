// components/ActionInput.tsx
import React from 'react';
import { SupportedAccounts } from '@/lib/constants';

type Props = {
  account: SupportedAccounts;
};

const savingOptions = [
  { label: '1$ (Small saver)', value: '1' },
  { label: '10$ (Medium saver)', value: '10' },
  { label: '100$ (Large saver)', value: '100' },
];

export default function SetSavingConfig({ account }: Props) {
  const [selected, setSelected] = React.useState('daily');
  const [toYield, setToYield] = React.useState(true);
  const [address, setAddress] = React.useState('');
  const [threshold, setThreshold] = React.useState('100');
  const [disabled, setDisabled] = React.useState(false);

  const title = `Set ${account} Savings Config`;
  return (
    <fieldset className='w-full rounded-lg p-6 shadow-smdisabled:opacity-60' disabled={disabled}>
      {title ? <legend className='px-1 text-xl font-bold text-center text-gray-700'>{title}</legend> : null}

      <div className='flex flex-col gap-6 mt-4'>
        {/* Dropdown */}
        <div className='flex flex-col gap-1'>
          <label htmlFor={selected} className='text-xs font-medium text-gray-600'>
            Option
          </label>
          <select
            id={selected}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className='h-10 rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black'
          >
            {savingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox */}
        <div className='flex items-center gap-2 pt-6 md:pt-0'>
          <input
            id={'toYield'}
            type='checkbox'
            checked={toYield}
            onChange={(e) => setToYield(e.target.checked)}
            className='h-4 w-4 rounded border-gray-300 text-black focus:ring-black'
          />
          <label htmlFor={'toYield'} className='text-sm text-gray-700'>
            Yield savings (Earn yield on your savings. Learn more{' '}
            <a href='#' className='text-blue-500'>
              here
            </a>
            )
          </label>
        </div>

        {/* Address input */}
        {!toYield && (
          <div className='flex flex-col gap-1'>
            <label htmlFor={address} className='text-xs font-medium text-gray-600'>
              Saving Address (Address to send savings to)
            </label>
            <input
              id={address}
              type='text'
              inputMode='text'
              autoComplete='off'
              spellCheck={false}
              placeholder='0x...'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className='h-10 rounded-md border border-gray-300 px-3 font-mono text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black'
            />
          </div>
        )}

        {/* Value input */}
        <div className='flex flex-col gap-1'>
          <label htmlFor={threshold} className='text-xs font-medium text-gray-600'>
            Max Saving Threshold (Max amount that can be saved over period)
          </label>
          <input
            id={threshold}
            type='number'
            inputMode='decimal'
            min='0'
            step='any'
            placeholder='0.0'
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className='h-10 rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black'
          />
        </div>
      </div>
    </fieldset>
  );
}
