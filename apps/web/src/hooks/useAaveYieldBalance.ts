import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { abi } from '@/abis/AaveUiPoolDataProvider';
import {
  AAVE_POOL_ADDRESSES_PROVIDER,
  AAVE_UI_POOL_DATA_PROVIDER,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
} from '@/lib/constants';
import { chain } from '@/config';
import { truncateToTwoDecimals } from '@/lib/math';

const chainId = chain.id;

type TUserReserveDataObject = {
  underlyingAsset: string;
  scaledATokenBalance: bigint;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: bigint;
};

export interface IUserReserveData {
  0: Array<TUserReserveDataObject>;
  1: number;
}

// uses env configured chain id
export const useAaveYieldBalance = () => {
  const { isConnected, address: userAddress } = useAccount();

  const {
    data: raw,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
  } = useReadContract({
    abi,
    address: AAVE_UI_POOL_DATA_PROVIDER,
    functionName: 'getUserReservesData',
    args: [AAVE_POOL_ADDRESSES_PROVIDER, userAddress],
    chainId,
    query: {
      enabled: isConnected && !!userAddress,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
    },
  });

  let balanceData = { balance: BigInt(0), balanceFormatted: 0 };

  if (raw) {
    const data = raw as IUserReserveData;

    const tokenData = data[0].filter((reserve: TUserReserveDataObject) => reserve.underlyingAsset === TOKEN_ADDRESS);

    const balance = tokenData[0].scaledATokenBalance;

    balanceData = { balance, balanceFormatted: truncateToTwoDecimals(formatUnits(balance, TOKEN_DECIMALS)) };
  }

  return {
    balance: balanceData.balance,
    balanceFormatted: balanceData.balanceFormatted,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
    isReady: isFetched && !isLoading,
  };
};
