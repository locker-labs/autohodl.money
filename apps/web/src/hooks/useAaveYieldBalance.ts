import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { abi } from '@/abis/AaveUiPoolDataProvider';
import {
  AAVE_POOL_ADDRESSES_PROVIDER,
  AAVE_UI_POOL_DATA_PROVIDER,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
} from '@/lib/constants';
// import { useAutoHodl } from '@/context/AutoHodlContext';
import { chain } from '@/config';

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
  // const { tokenSourceAddress } = useAutoHodl();
  const tokenSourceAddress = userAddress;

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
    args: [AAVE_POOL_ADDRESSES_PROVIDER, tokenSourceAddress],
    chainId,
    query: {
      enabled: isConnected && !!tokenSourceAddress && !!userAddress,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  console.log('useAaveATokenBalance', { isFetched, isFetching });

  let balanceData = { balance: BigInt(0), balanceFormatted: 0 };

  if (raw) {
    const data = raw as IUserReserveData;

    const tokenData = data[0].filter((reserve: TUserReserveDataObject) => reserve.underlyingAsset === TOKEN_ADDRESS);

    const balance = tokenData[0].scaledATokenBalance;

    console.log('\nToken Source `aToken` Balance in Pool:', balance);

    balanceData = { balance, balanceFormatted: Number(formatUnits(balance, TOKEN_DECIMALS)) };
  }

  return {
    balance: balanceData.balance,
    balanceFormatted: balanceData.balanceFormatted,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
  };
};
