// components/Button.tsx

import type { ReactNode } from 'react';

type ButtonType = 'button' | 'submit' | 'reset';

type Props = {
  children?: ReactNode;
  title: string;
  onAction?: () => void;
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  title,
  onAction,
  type = 'button',
  disabled = false,
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
        'transition-all duration-300 cursor-pointer',
        'inline-flex items-center justify-center rounded-[12px]',
        'px-4 py-2 text-sm font-medium',
        'bg-[#78E76E] active:bg-gray-200/10',
        // 'hover:border-[#78E76E] hover:border-2 hover:bg-white',
        'text-black',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black',
        className,
      ].join(' ')}
      title={title}
    >
      {children ?? title}
    </button>
  );
}
