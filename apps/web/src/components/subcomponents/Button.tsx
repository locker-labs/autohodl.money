// components/Button.tsx

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

type ButtonType = 'button' | 'submit' | 'reset';

type Props = {
  children?: ReactNode;
  title: string;
  onAction?: () => void;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function Button({
  children,
  title,
  onAction,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
}: Props) {
  return (
    <button
      type={type}
      onClick={onAction}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        'active:scale-97',
        'transition-all duration-300',
        'cursor-pointer disabled:cursor-not-allowed',
        'inline-flex items-center justify-center gap-2 rounded-[12px]',
        'px-4 py-2 text-sm font-medium',
        'bg-[#78E76E] active:bg-gray-200/10',
        'disabled:bg-gray-400/50',
        // 'hover:border-[#78E76E] hover:border-2 hover:bg-white',
        'text-black',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black',
        className,
      ].join(' ')}
      title={title}
    >
      {children ?? title}
      {loading && <Loader2 size={16} className='animate-spin' />}
    </button>
  );
}
