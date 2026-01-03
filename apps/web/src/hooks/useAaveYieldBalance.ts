import { formatUnits } from 'viem';
import { useConnection, useReadContract } from 'wagmi';
import { abi } from '@/abis/AaveUiPoolDataProvider';
import { useAutoHodl } from '@/context/AutoHodlContext';
import type { EChainId } from '@/lib/constants';
import {
  getAavePoolAddressesProviderByChain,
  getAaveUiPoolDataProviderByChain,
  getTokenDecimalsByAddress,
  getUsdcAddressByChain,
} from '@/lib/helpers';
import { roundOff } from '@/lib/math';

// Right now this component returns the aave yield balance of the user on a single chain
// TODO: make it work for multiple chains
// For now, we will use the savings chain id to get the yield balance

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
  const { isConnected, address: userAddress } = useConnection();
  const { savingsChainId } = useAutoHodl();

  const usdc = getUsdcAddressByChain(savingsChainId);

  const {
    data: raw,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isLoadingError,
  } = useReadContract({
    abi,
    address: getAaveUiPoolDataProviderByChain(savingsChainId),
    functionName: 'getUserReservesData',
    args: [getAavePoolAddressesProviderByChain(savingsChainId), userAddress],
    chainId: savingsChainId as EChainId,
    query: {
      enabled: isConnected && !!userAddress,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 5000,
    },
  });

  let balanceData = { balance: BigInt(0), balanceFormatted: 0 };

  if (raw) {
    const data = raw as IUserReserveData;

    const tokenData = data[0].filter((reserve: TUserReserveDataObject) => reserve.underlyingAsset === usdc);

    const balance = tokenData[0].scaledATokenBalance;

    balanceData = {
      balance,
      balanceFormatted: roundOff(formatUnits(balance, getTokenDecimalsByAddress(usdc)), 2),
    };
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
