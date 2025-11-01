import { useCopyToClipboard } from '@uidotdev/usehooks';
import { toastCustom } from '@/components/ui/toast';

export const CopyContentButton = ({
  children,
  textToCopy,
  onCopyMessage,
  className,
}: {
  children: React.ReactNode;
  textToCopy: string;
  onCopyMessage?: string;
  className?: string;
}) => {
  const [, copyToClipboard] = useCopyToClipboard();
  return (
    <button
      title={textToCopy}
      className={`text-[#4D4A4A] text-sm
                      hover:bg-gray-200
                      px-[6px] py-0.5 rounded-md
                      transition-colors
                      duration-150
                      cursor-pointer
                      ${className}
                      `}
      onClick={() => {
        copyToClipboard(textToCopy);
        if (onCopyMessage) {
          toastCustom(onCopyMessage);
        }
      }}
      type='button'
    >
      {children}
    </button>
  );
};
