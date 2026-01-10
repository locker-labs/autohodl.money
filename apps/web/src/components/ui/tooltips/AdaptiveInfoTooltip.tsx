import { Info } from 'lucide-react';
import { AdaptiveTooltip } from './AdaptiveTooltip';

const AdaptiveInfoTooltip = ({ content }: { content: React.ReactNode }) => {
  return (
    <AdaptiveTooltip content={content} triggerClassName='cursor-default'>
      <Info
        size={16}
        className='h-4 w-4 min-h-4 min-w-4 text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors duration-200'
      />
    </AdaptiveTooltip>
  );
};

export default AdaptiveInfoTooltip;
