'use client';

import Image from 'next/image';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAutoHodl } from '@/context/AutoHodlContext';
import { useChainSwitchContext } from '@/context/ChainSwitchContext';
import { getViemChain, getViemChainImage } from '@/lib/helpers';
import { ViemChainNameMap, type EChainId } from '@/lib/constants';
import { chains } from '@/config';

export function ChainSelector() {
  const { savingsChainId, isConnected } = useAutoHodl();
  const { openModal } = useChainSwitchContext();

  const currentChain = savingsChainId ? getViemChain(savingsChainId) : null;

  // Don't show if not connected or no savings chain
  if (!isConnected || !savingsChainId || !currentChain) {
    return null;
  }

  const handleChainSelect = async (chainId: EChainId) => {
    await openModal(chainId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-gray-300'
        >
          <Image
            src={getViemChainImage(savingsChainId)}
            alt={ViemChainNameMap[savingsChainId]}
            width={20}
            height={20}
            className='min-w-5 min-h-5 max-h-5 max-w-5'
          />
          <span className='text-sm font-medium hidden sm:inline'>{ViemChainNameMap[savingsChainId]}</span>
          <ChevronDown className='w-4 h-4 text-gray-600' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {chains.map((chain) => {
          const chainId = chain.id as EChainId;
          const isCurrentChain = chainId === savingsChainId;
          const chainName = ViemChainNameMap[chainId];

          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => !isCurrentChain && handleChainSelect(chainId)}
              className='flex items-center justify-between cursor-pointer'
              disabled={isCurrentChain}
            >
              <div className='flex items-center gap-2'>
                <Image
                  src={getViemChainImage(chainId)}
                  alt={chainName}
                  width={20}
                  height={20}
                  className='min-w-5 min-h-5 max-h-5 max-w-5'
                />
                <span>{chainName}</span>
              </div>
              {isCurrentChain && <Check className='w-4 h-4 text-green-600' />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
