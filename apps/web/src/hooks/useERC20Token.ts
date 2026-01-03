import { useMemo } from 'react';
import { erc20Abi, formatUnits, parseUnits, type Address } from 'viem';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { type EChainId, TokenDecimalMap, type TTokenAddress } from '@/lib/constants';
import { roundOff } from '@/lib/math';
import { useAppKitAccount } from '@reown/appkit/react';

export function useErc20Allowance(params: {
  token: TTokenAddress;
  chainId: EChainId | null;
  owner: Address | undefined;
  spender: Address;
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();

  const owner = params.owner;
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useErc20Allowance: Unsupported token: ${params.token}`);
  }
  const enabled = params.enabled ?? Boolean(isConnected && params.token && owner && params.spender && params.chainId);

  const { data, error, isLoading, isFetching, isSuccess, status, refetch } = useReadContract({
    address: params.token as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    chainId: params.chainId ?? undefined,
    args: owner && params.spender ? [owner, params.spender] : undefined,
    query: {
      enabled,
      staleTime: 15_000,
    },
  });

  const allowance = data as bigint | undefined;
  const allowanceFormatted = useMemo(
    () => (allowance !== undefined ? Number(formatUnits(allowance, decimals)) : 0),
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
  token: TTokenAddress;
  chainId: EChainId | null;
  spender: Address | undefined;
  amount: number; // e.g. 2.02
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20Approve: Unsupported token: ${params.token}`);
  }
  const amount: bigint = parseUnits(params.amount.toString(), decimals);
  const enabled = params.enabled ?? Boolean(isConnected && params.token && params.spender && params.chainId);

  const { mutate, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const approve = () => {
    if (!enabled) return;
    mutate({
      address: params.token as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [params.spender as Address, amount],
      chainId: params.chainId ?? undefined,
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

export function useERC20BalanceOf(params: {
  address: Address | undefined;
  token: TTokenAddress;
  chainId: EChainId | null;
  enabled?: boolean;
}): UseERC20BalanceOfReturn {
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20BalanceOf: Unsupported token: ${params.token}`);
  }

  const { data, isFetched, isFetching, isLoading, refetch } = useReadContract({
    abi: erc20Abi,
    address: params.token,
    functionName: 'balanceOf',
    args: [params.address as Address],
    chainId: params.chainId ?? undefined,
    query: {
      enabled: params.enabled ?? Boolean(params.address && params.chainId),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 5000,
    },
  });

  const balanceFormatted = data ? roundOff(formatUnits(BigInt(data), decimals), 2) : 0;

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
  token: TTokenAddress;
  chainId: EChainId | null;
  to: Address;
  amount: number; // e.g. 1.2
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();
  const decimals = TokenDecimalMap[params.token];
  if (!decimals) {
    throw new Error(`useERC20Transfer: Unsupported token: ${params.token}`);
  }
  const amount: bigint = parseUnits(params.amount.toString(), decimals);
  const enabled = Boolean(params.enabled ?? true) && Boolean(isConnected && params.token && params.to);

  const { mutate, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const transfer = () => {
    if (!enabled) return;
    mutate({
      address: params.token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [params.to, amount],
      chainId: params.chainId ?? undefined,
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
