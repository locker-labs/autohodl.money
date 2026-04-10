import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WalletSelectionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectSelfCustodial: () => void;
  onSelectCoinbase: () => void;
}

export function WalletSelectionDialog({
  isOpen,
  setIsOpen,
  onSelectSelfCustodial,
  onSelectCoinbase,
}: WalletSelectionDialogProps) {
  const handleSelfCustodialClick = () => {
    onSelectSelfCustodial();
    setIsOpen(false);
  };

  const handleCoinbaseClick = () => {
    onSelectCoinbase();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose how you want to connect to the application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {/* Self-Custodial Option */}
          <button
            onClick={handleSelfCustodialClick}
            className="flex flex-col items-start p-4 w-full rounded-xl border border-gray-200 bg-white hover:border-[#78E76E] hover:bg-gray-50 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 group cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-colors">
                {/* Generic Wallet Icon - Replace with your actual SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.59l-9.74 3.25a2 2 0 0 1-2.5-2.5l3.25-9.74A8 8 0 0 1 19 7Z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-black text-base">
                  Self-Custodial Wallet
                </span>
                <span className="text-xs text-gray-500">
                  MetaMask, Trust Wallet, Phantom, etc.
                </span>
              </div>
            </div>
          </button>

          {/* Coinbase Option */}
          <button
            onClick={handleCoinbaseClick}
            className="flex flex-col items-start p-4 w-full rounded-xl border border-gray-200 bg-white hover:border-[#78E76E] hover:bg-gray-50 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 group cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0052FF]/10 group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-colors">
                {/* Coinbase 'C' Placeholder - Replace with actual Coinbase SVG */}
                <span className="text-[#0052FF] font-bold text-lg">C</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-black text-base">
                  Coinbase
                </span>
                <span className="text-xs text-gray-500">
                  Connect via your Coinbase account
                </span>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
