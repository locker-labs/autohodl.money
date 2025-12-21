import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';

export function InfoTooltip({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info size={16} className='h-4 w-4' />
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}
