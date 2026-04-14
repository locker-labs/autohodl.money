import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FundWalletDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onFund: (amount: string) => void;
}

export function FundWalletDialog({
  isOpen,
  setIsOpen,
  onFund,
}: FundWalletDialogProps) {
  const [amount, setAmount] = useState<string>("");

  const presetAmounts = ["50", "100", "250", "500"];

  const handleContinue = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) return;

    onFund(amount);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setAmount("");
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Fund Your Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you'd like to add via Coinbase Onramp.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-4">
          {/* Amount Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <span className="text-gray-500 text-2xl font-medium">$</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-3xl font-semibold text-black bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#78E76E] focus:ring-2 focus:ring-[#78E76E]/20 transition-all outline-none"
            />
          </div>

          {/* Preset Amounts */}
          <div className="flex items-center justify-between gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  amount === preset
                    ? "bg-[#78E76E]/10 border-[#78E76E] text-green-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleContinue}
            disabled={!amount || Number(amount) <= 0}
            className="flex items-center justify-center gap-2 w-full py-3.5 mt-2 bg-[#0052FF] hover:bg-[#0040C5] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Continue with Coinbase
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
