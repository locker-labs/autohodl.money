import { useEffect, useState } from 'react';
import { useConnection } from 'wagmi';
import { useErc20Allowance, useERC20Approve } from '@/hooks/useERC20Token';
import Button from './Button';
import { Edit3, X } from 'lucide-react';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { getAutoHodlAddressByChain, getUsdcAddressByChain } from '@/lib/helpers';
import { TokenTickerMap } from '@/lib/constants';
import { useSwitchChain } from 'wagmi';

const SavingsLimit = () => {
  const { address: userAddress, chainId: currentChainId } = useConnection();
  const { savingsChainId } = useAutoHodl();
  const [savingsCap, setSavingsCap] = useState<number | null>(100); // default 100 USDC
  const [isEditing, setIsEditing] = useState(false); // State to toggle between view-only and edit modes
  const switchChain = useSwitchChain();

  const [usdc, autohodl] = [getUsdcAddressByChain(savingsChainId), getAutoHodlAddressByChain(savingsChainId)];

  const { allowanceFormatted, isLoading: isLoadingAllowance } = useErc20Allowance({
    chainId: savingsChainId,
    owner: userAddress,
    token: usdc,
    spender: autohodl,
  });

  useEffect(() => {
    if (!isLoadingAllowance) {
      setSavingsCap(allowanceFormatted);
    }
  }, [isLoadingAllowance, allowanceFormatted]);

  const {
    approve,
    isPending,
    isConfirming: isConfirmingAllowance,
  } = useERC20Approve({
    chainId: savingsChainId,
    token: usdc,
    spender: autohodl,
    amount: savingsCap ?? 0,
  });

  useEffect(() => {
    if (!isConfirmingAllowance) {
      setIsEditing(false);
    }
  }, [isConfirmingAllowance]);

  const handleCancel = () => {
    setIsEditing(false);
    setSavingsCap(allowanceFormatted);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => document.getElementById('savingsCap')?.focus(), 0);
  };

  const handleApprove = async () => {
    if (savingsChainId && currentChainId && currentChainId !== savingsChainId) {
      await switchChain.mutateAsync({ chainId: savingsChainId });
    }

    approve();
  };

  return (
    <div>
      {isEditing ? (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center justify-between w-full'>
            <label htmlFor={'savingsCap'} className='py-[6px] text-sm font-medium text-black'>
              Savings Limit ({TokenTickerMap[getUsdcAddressByChain(savingsChainId)]}):
            </label>
            <button
              type='button'
              onClick={handleCancel}
              className={`text-[#4D4A4A]
                      bg-gray-100
                      hover:bg-gray-200
                      px-0.5 py-0.5 rounded-md
                      transition-colors
                      duration-150
                      cursor-pointer`}
              aria-label='Cancel editing'
            >
              <X size={20} />
            </button>
          </div>
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
          <div className='my-2 flex items-center gap-2'>
            <Button
              className='rounded-lg w-full'
              title={'Add token allowance'}
              onAction={handleApprove}
              disabled={savingsCap === null}
              loading={isConfirmingAllowance || isPending}
            >
              {isConfirmingAllowance ? 'Confirming' : isPending ? 'Processing' : 'Set limit'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          className='group w-full flex items-center justify-between rounded-md transition-colors cursor-pointer hover:bg-gray-100'
          onClick={handleEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          aria-label='Edit savings limit'
        >
          <div className='w-full flex items-center justify-between'>
            <div className='py-1 text-sm font-medium text-black'>
              Savings Limit ({TokenTickerMap[getUsdcAddressByChain(savingsChainId)]}):
            </div>
            <div className='flex items-center justify-center gap-2'>
              <div className='py-1 text-base font-medium text-black'>{allowanceFormatted}</div>
              <div className='hidden group-hover:block p-1 rounded-md'>
                <div
                  className={`text-[#4D4A4A]
                      hover:bg-gray-200
                      px-0.5 py-0.5 rounded-md
                      transition-colors
                      duration-150
                      cursor-pointer`}
                >
                  <Edit3 size={13} />
                </div>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default SavingsLimit;
