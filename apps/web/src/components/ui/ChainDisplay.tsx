import Image from 'next/image';
import { type EChainId, ViemChainImageMap, ViemChainNameMap } from '@/lib/constants';

export function ChainDisplay({ chainId }: { chainId: EChainId }) {
  return (
    <div className='flex items-center gap-1'>
      <Image
        src={ViemChainImageMap[chainId]}
        alt={ViemChainNameMap[chainId] || 'Chain'}
        width={14}
        height={14}
        className='rounded-full'
      />
      <span className='text-[10px] text-[#6b6b6b]'>{ViemChainNameMap[chainId] || 'Unknown'}</span>
    </div>
  );
}
