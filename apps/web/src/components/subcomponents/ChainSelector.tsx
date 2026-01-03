import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { viemChains } from '@/config';
import { useAutoHodl } from '@/context/AutoHodlContext';
import type { EChainId } from '@/lib/constants';

const ChainSelector = ({ defaultChainId }: { defaultChainId: EChainId }) => {
  const { switchChain } = useAutoHodl();

  /**
   * Fetch configs on all supported chains.
   * if config is found on any chain, then ask user to switch to that chain.
   * if no config is found, then pick preferred chain (using a preference list) from connected chains.
   *
   */

  return (
    <Select
      value={String(defaultChainId ?? '')}
      onValueChange={async (value) => {
        const chain = viemChains.find((c) => String(c.id) === String(value));
        if (chain) {
          await switchChain(chain.id);
        } else {
          console.error('Selected chain not supported');
          // try to add the chain
        }
      }}
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Please select' />
      </SelectTrigger>
      <SelectContent>
        {viemChains.map((chain) => (
          <SelectItem key={chain.id} value={String(chain.id)}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;
