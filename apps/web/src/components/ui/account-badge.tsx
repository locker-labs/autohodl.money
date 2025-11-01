import { SupportedAccounts } from '@/lib/constants';

const AccountToColorMap: Record<
  (typeof SupportedAccounts)[keyof typeof SupportedAccounts],
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  // background should be lightest color
  // border should be medium color
  // text should be most dark color

  [SupportedAccounts.MetaMask]: {
    bgColor: 'bg-[#FFA680]',
    borderColor: 'border-[#FF5C16]/50',
    textColor: 'text-[#661800]',
    // MetaMask Colors:
    // #FFA680 Light Orange
    // #FF5C16 Orange
    // #661800 Dark Orange
  },
  [SupportedAccounts.EOA]: {
    bgColor: 'bg-[#CFB1FB]',
    borderColor: 'border-[#4043AE]/50',
    textColor: 'text-[#121212]',
    // Ethereum Colors:
    // #CFB1FB Perfume - light
    // #4043AE Gigas - medium
    // #121212 Cod Gray - dark
  },
};

export const AccountBadge = ({ type, className }: { type: SupportedAccounts; className?: string }) => {
  const colorMap = AccountToColorMap[type];
  return (
    <div
      className={`text-sm
                      px-[10px] py-[2px] rounded-md
                      font-base
                      whitespace-nowrap
                      ${colorMap.bgColor}
                      border ${colorMap.borderColor}
                      ${colorMap.textColor}
                      ${className}
                      `}
    >
      {type}
    </div>
  );
};
