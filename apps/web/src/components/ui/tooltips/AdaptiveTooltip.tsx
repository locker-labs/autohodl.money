'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Adaptive component that uses Popover on touch devices, Tooltip on non-touch
interface AdaptiveTooltipProps {
  children: React.JSX.Element | string;
  content: React.JSX.Element | string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  contentClassName?: string;
  triggerClassName?: string;
}

// Adaptive component that uses Popover on touch devices, Tooltip on non-touch
const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({
  children,
  content,
  side = 'top',
  contentClassName = '',
  triggerClassName = '',
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();

    // Re-check on resize (for responsive testing)
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (isTouchDevice) {
    return (
      <Popover>
        <PopoverTrigger className={triggerClassName}>{children}</PopoverTrigger>
        <PopoverContent side={side} className={contentClassName}>
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger className={triggerClassName}>{children}</TooltipTrigger>
        <TooltipContent side={side} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { AdaptiveTooltip };
