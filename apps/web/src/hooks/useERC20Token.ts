import { useAppKitAccount } from '@reown/appkit/react';
import { useMemo } from 'react';
import { erc20Abi, formatUnits } from 'viem';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { TokenDecimalMap } from '@/lib/constants';
import { truncateToTwoDecimals } from '@/lib/math';

type Address = `0x${string}`;

export function useErc20Allowance(params: {
  token: Address;
  owner?: Address; // optional; defaults to AppKit-connected address
  spender: Address;
  enabled?: boolean;
}) {
  const { address: appkitAddress, isConnected } = useAppKitAccount();

  const owner = (params.owner ?? appkitAddress) as Address | undefined;
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useErc20Allowance: Unsupported token: ${params.token}`);
  }
  const enabled = Boolean(params.enabled ?? true) && Boolean(isConnected && params.token && owner && params.spender);

  const { data, error, isLoading, isFetching, isSuccess, status, refetch } = useReadContract({
    address: params.token as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner && params.spender ? [owner, params.spender] : undefined,
    query: {
      enabled,
      staleTime: 15_000,
    },
  });

  const allowance = data as bigint | undefined;
  const allowanceFormatted = useMemo(
    () => Number(allowance !== undefined ? formatUnits(allowance, decimals) : undefined),
    [allowance, decimals],
  );

  return {
    allowance, // bigint | undefined
    allowanceFormatted, // string | undefined
    isLoading: enabled && isLoading,
    isFetching,
    isSuccess,
    status,
    error,
    refetch,
    enabled,
    owner,
    isConnected,
  };
}

export function useERC20Approve(params: {
  token: Address;
  spender: Address | undefined;
  amount: number; // e.g. 2.02
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20Approve: Unsupported token: ${params.token}`);
  }
  const amount = BigInt(params.amount * 10 ** decimals);
  const enabled = Boolean(params.enabled ?? true) && Boolean(isConnected && params.token && params.spender);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const approve = () => {
    if (!enabled) return;
    writeContract({
      address: params.token as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [params.spender as Address, amount],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: Boolean(hash) },
  });

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    receipt,
    writeError,
    receiptError,
    resetWrite,
    enabled,
    amount: params.amount,
  };
}

export type UseERC20BalanceOfReturn = {
  balance: bigint | undefined;
  balanceFormatted: number;
  refetch: () => void;
  isReady: boolean;
  isLoading: boolean;
  isFetched: boolean;
  isFetching: boolean;
};

export function useERC20BalanceOf(params: { address: Address | undefined; token: Address }): UseERC20BalanceOfReturn {
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20BalanceOf: Unsupported token: ${params.token}`);
  }

  const { data, isFetched, isFetching, isLoading, refetch } = useReadContract({
    abi: erc20Abi,
    address: params.token,
    functionName: 'balanceOf',
    args: [params.address as Address],
    query: {
      enabled: !!params.address,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: 15000,
      staleTime: 0,
    },
  });

  const balanceFormatted = data ? truncateToTwoDecimals(formatUnits(data, decimals)) : 0;

  return {
    balance: data,
    balanceFormatted,
    isReady: isFetched && !isLoading,
    refetch,
    isLoading,
    isFetched,
    isFetching,
  };
}

export function useERC20Transfer(params: {
  token: Address;
  to: Address;
  amount: number; // e.g. 1.2
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20Transfer: Unsupported token: ${params.token}`);
  }
  const amount = BigInt(params.amount * 10 ** decimals);
  const enabled = Boolean(params.enabled ?? true) && Boolean(isConnected && params.token && params.to);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const transfer = () => {
    if (!enabled) return;
    writeContract({
      address: params.token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [params.to, amount],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: Boolean(hash) },
  });

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    receipt,
    writeError,
    receiptError,
    resetWrite,
    enabled,
  };
}
