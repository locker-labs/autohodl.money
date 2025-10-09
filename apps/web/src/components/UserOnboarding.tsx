import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePublicClient, useWalletClient } from 'wagmi';
import {
  AUTOHODL_ADDRESS,
  USDC_ADDRESS,
  DELEGATE,
  TokenDecimalMap,
  SupportedAccounts,
} from "../lib/constants";
import { AutoHodlAbi } from "../lib/abis/AutoHodl";
import { type Address, type Hex, isAddress } from "viem";
import type { SavingsConfig } from "@/types/autohodl";
import ErrorDisplay from "./ErrorDisplay";
import StepContainer from "@/components/view/StepContainer";
import { SetupRouter } from "./setup/SetupRouter";
import { getSupportedAccounts } from "@/lib/userAccounts";

// Helper: default config values
const DEFAULT_CONFIG = {
  delegate: DELEGATE,
  roundUp: 1, // a dollar
  active: true,
  toYield: false,
  extraData: "0x",
};

const UserOnboarding: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const [config, setConfig] = useState<null | SavingsConfig>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingsAddress, setSavingsAddress] = useState("");
  // Only $1 is selectable, but keep state for future extensibility
  const [roundUp] = useState<1 | 5 | 10>(1);

  const [supportedAccounts, setSupportedAccounts] = useState<string[]>([]);

  const isInvalidAddress = savingsAddress !== "" && !isAddress(savingsAddress);

  // Check if user has savings config for USDC
  useEffect(() => {
    if (!isConnected || !address) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const accounts = await getSupportedAccounts();
        setSupportedAccounts(accounts);
        setLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to get supported accounts."
        );
      }
    })();
  }, [isConnected, address, publicClient]);

  // Handler to create savings config
  const handleCreateConfig = async () => {
    if (!walletClient || !address) return;
    setLoadingTx(true);
    setError(null);
    try {
      // Ensure types for contract call
      const args = [
        USDC_ADDRESS,
        savingsAddress as Address,
        DEFAULT_CONFIG.delegate as Address,
        BigInt(roundUp * 10 ** TokenDecimalMap[USDC_ADDRESS]),
        DEFAULT_CONFIG.active,
        DEFAULT_CONFIG.toYield,
        DEFAULT_CONFIG.extraData as Hex,
      ] as const;
      await walletClient.writeContract({
        address: AUTOHODL_ADDRESS,
        abi: AutoHodlAbi,
        functionName: "setSavingConfig",
        args,
      });
      setHasConfig(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create config.");
    } finally {
      setLoadingTx(false);
    }
  };

  if (!isConnected) return <div>Please connect your wallet to continue.</div>;

  if (error)
    return (
      <div className="max-w-md mx-auto mt-4">
        <ErrorDisplay error={error} />
      </div>
    );

  const disabled = loading || loadingTx || !savingsAddress || isInvalidAddress;

  return (
    <div className="w-full h-full flex justify-center items-center">
      <StepContainer>
        {loading && <div>Loading...</div>}
        <SetupRouter accounts={[SupportedAccounts.EOA]} />
      </StepContainer>
    </div>
  );
};

export default UserOnboarding;
