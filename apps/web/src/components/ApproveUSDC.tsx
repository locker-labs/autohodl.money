import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { USDC_ADDRESS, DELEGATE } from "@/lib/constants";
import { useErc20Allowance, useERC20Approve } from "@/hooks/useERC20Token";

export default function USDCApprovalChecker() {
  const { address, isConnected } = useAccount();
  const [threshold, setThreshold] = useState(0);
  const {
    allowance,
    allowanceFormatted,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useErc20Allowance({
    token: USDC_ADDRESS,
    owner: address as `0x${string}` | undefined,
    spender: DELEGATE as `0x${string}` | undefined,
    decimals: 6,
    enabled: isConnected,
  });

  const { approve, isPending, isConfirming, isConfirmed, writeError, hash } =
    useERC20Approve({
      token: USDC_ADDRESS,
      spender: DELEGATE as `0x${string}` | undefined,
      amount: allowance!,
      enabled: isConnected,
    });

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  const handleApprove = () => {
    if (!DELEGATE) return;
    approve();
  };
  const needsApproval =
    allowanceFormatted !== undefined
      ? Number(allowanceFormatted) <= threshold
      : false;

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Approve USDC</h2>
      <p className="text-sm text-gray-600 mb-4">
        Automate savings upon spending with MM Card
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delegate Address
            <input
              type="text"
              placeholder="0x..."
              value={DELEGATE}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set Threshold (USDC)
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        {DELEGATE && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Current Allowance:</p>
            <p className="text-2xl font-bold text-gray-800">
              {allowanceFormatted} USDC
            </p>
          </div>
        )}

        {isLoadingAllowance && (
          <button
            type="button"
            onClick={() => {}}
            disabled={true}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </button>
        )}

        {allowance !== undefined && needsApproval && DELEGATE && (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending || isConfirming || threshold === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isPending ? "Waiting for approval..." : "Confirming..."}
              </>
            ) : (
              `${
                threshold === 0
                  ? "Enter threshold"
                  : `Approve ${threshold} USDC`
              }`
            )}
          </button>
        )}

        {allowance !== undefined && !needsApproval && DELEGATE && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">Allowance is above threshold</p>
          </div>
        )}

        {isConfirmed && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md">
            <p className="font-medium">Approval successful!</p>
            <a
              href={`https://lineascan.build/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              View on Lineascan
            </a>
          </div>
        )}

        {writeError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Error: {writeError.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
