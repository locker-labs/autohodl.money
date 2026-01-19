import { Info } from 'lucide-react';
import { AdaptiveTooltip } from './AdaptiveTooltip';

const AdaptiveInfoTooltip = ({ content }: { content: React.JSX.Element | string }) => {
  return (
    <AdaptiveTooltip content={content} triggerClassName='cursor-default'>
      <Info size={16} className='h-4 w-4' />
    </AdaptiveTooltip>
  );
};

export default AdaptiveInfoTooltip;
