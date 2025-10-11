import { useMemo } from 'react';
import { erc20Abi, formatUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';

type Address = `0x${string}`;

export function useErc20Allowance(params: {
  token: Address | undefined;
  owner?: Address; // optional; defaults to AppKit-connected address
  spender: Address | undefined;
  decimals?: number; // Defaults to 6 (USDC)
  enabled?: boolean;
}) {
  const { address: appkitAddress, isConnected } = useAppKitAccount();

  const owner = (params.owner ?? appkitAddress) as Address | undefined;
  const decimals = params.decimals ?? 6;
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
    () => (allowance !== undefined ? formatUnits(allowance, decimals) : undefined),
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
  token: Address | undefined;
  spender: Address | undefined;
  amount: bigint; // e.g. 20n
  decimals?: number; // e.g., 6 for USDC
  enabled?: boolean;
}) {
  const { isConnected } = useAppKitAccount();
  const decimals = params.decimals ?? 6;

  const enabled = Boolean(params.enabled ?? true) && Boolean(isConnected && params.token && params.spender);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();

  const approve = () => {
    if (!enabled) return;
    writeContract({
      address: params.token as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [params.spender as Address, params.amount],
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
