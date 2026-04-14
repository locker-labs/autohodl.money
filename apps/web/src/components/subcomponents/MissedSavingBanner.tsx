"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useMissedSaving } from "../../hooks/useMissedSavings";
import { FundWalletDialog } from "./FundWalletDialog";

export default function MissedSavingBanner(): React.JSX.Element | null {
  const { address } = useAccount();
  const { isMissed, amountFormatted, dateFormatted, isLoading } =
    useMissedSaving(address);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  const handleFund = async (amount: string) => {
    setIsDialogOpen(false);
    if (!address) {
      console.error("No wallet address connected");
      return;
    }
    try {
      setIsGeneratingUrl(true);
      const response = await fetch("/api/v1/onramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          asset: "USDC",
          network: "base",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch session token from server");
      }

      const { token } = await response.json();
      const appId =
        process.env.NEXT_PUBLIC_COINBASE_APP_ID ||
        "741e8f39-f205-4c88-865b-9917008aebdf";
      const onrampUrl = new URL("https://pay.coinbase.com/buy/select-asset");

      if (appId) onrampUrl.searchParams.append("appId", appId);
      onrampUrl.searchParams.append("sessionToken", token);
      onrampUrl.searchParams.append("presetFiatAmount", amount);
      onrampUrl.searchParams.append("fiatCurrency", "USD");
      window.open(onrampUrl.toString(), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error starting onramp flow:", error);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  if (isLoading || !isMissed) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-destructive/30 rounded-lg shadow-sm gap-4 w-full">
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex-shrink-0 p-2 bg-destructive/10 rounded-full text-destructive">
            <AlertCircle size={20} aria-hidden="true" />
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-sm sm:text-base">
              Scheduled Saving Missed
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              We couldn't process your{" "}
              <span className="font-medium text-foreground">
                {amountFormatted}
              </span>{" "}
              saving scheduled for {dateFormatted}.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          disabled={isGeneratingUrl}
          className="w-full sm:w-auto px-5 py-2.5 bg-app-green text-primary font-medium text-sm rounded-md hover:bg-app-green-dark hover:text-white transition-colors duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-app-green focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingUrl ? "Loading..." : "Fund Wallet Now"}
        </button>
      </div>

      <FundWalletDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onFund={handleFund}
      />
    </>
  );
}
