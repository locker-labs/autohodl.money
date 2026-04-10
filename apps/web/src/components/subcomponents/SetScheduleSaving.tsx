import { useEffect, useState } from "react";
import {
  type EChainId,
  SupportedAccounts,
  TokenTickerMap,
} from "@/lib/constants";
import Button from "./Button";
import useCreateScheduleConfig from "@/hooks/useCreateScheduleConfig";
import { isAddress, type Address } from "viem";
import { useErc20Allowance, useERC20Approve } from "@/hooks/useERC20Token";
import { useAutoHodl } from "@/context/AutoHodlContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import AdaptiveInfoTooltip from "@/components/ui/tooltips/AdaptiveInfoTooltip";
import ChainSelector from "./ChainSelector";
import { useConnection } from "wagmi";
import { scheduleOptions, scheduleCycles, yieldOptions } from "@/config";
import {
  getAutoHodlAddressByChain,
  getUsdcAddressByChain,
  convertCycleToBigInt,
} from "@/lib/helpers";
import { toastCustom } from "@/components/ui/toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SavingsMode } from "@/types/autohodl"; // Kept in case you need to pass a default mode to the backend

export default function SetScheduledSavingConfig() {
  const { address } = useAutoHodl();
  const { chain } = useConnection();


  const [amount, setAmount] = useState<number>(
    scheduleOptions[0].value as number,
  );
  const [cycle, setCycle] = useState<string>(scheduleCycles[0].value);
  const [toYield, setToYield] = useState(true);
  const [savingsAddress, setSavingsAddress] = useState("");
  const [savingsCap, setSavingsCap] = useState<number | null>(100); // default 100 USDC allowance cap
  const [isApprovalNeeded, setIsApprovalNeeded] = useState<boolean | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const savingsChainId = chain?.id as EChainId;
  const { trackAllowanceSetEvent } = useAnalytics();
  const { createScheduleConfig } = useCreateScheduleConfig();

  const autohodl = getAutoHodlAddressByChain(savingsChainId);
  const usdc = getUsdcAddressByChain(savingsChainId);

  const { allowanceFormatted } = useErc20Allowance({
    chainId: savingsChainId,
    owner: address,
    token: usdc,
    spender: autohodl,
  });

  const {
    approve,
    isPending: isApprovePending,
    isConfirming: isConfirmingAllowance,
    isConfirmed,
  } = useERC20Approve({
    chainId: savingsChainId,
    token: usdc,
    spender: autohodl,
    amount: savingsCap ?? 0,
  });

  const handleApprove = () => {
    if (!toYield && isAddress(savingsAddress) === false) {
      toastCustom("Please enter a valid savings address");
      return;
    }
    approve();
  };

  const handleFinishSetup = async () => {
    if (!toYield && isAddress(savingsAddress) === false) {
      toastCustom("Please enter a valid savings address");
      return;
    }
    if (!savingsCap) {
      toastCustom("Please enter a valid savings limit");
      return;
    }

    setIsSaving(true);
    try {
      const cycleBigInt = convertCycleToBigInt(cycle);
      const addressToUse = toYield
        ? (address as Address)
        : (savingsAddress as Address);

      await createScheduleConfig({
        scheduleAmount: amount,
        cycle: cycleBigInt,
        savingsAddress: addressToUse,
        toYield,
        active: true,
        mode: SavingsMode.All, 
        savingsChainId,
      });

    } catch (error) {
      console.error("Failed to setup schedule:", error);
      toastCustom("Failed to set up scheduled savings");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (
      allowanceFormatted !== undefined &&
      allowanceFormatted < (savingsCap ?? 0)
    ) {
      setIsApprovalNeeded(true);
    } else {
      setIsApprovalNeeded(false);
    }
  }, [allowanceFormatted, savingsCap]);

  useEffect(() => {
    const continueSetupIfApproved = async () => {
      if (isConfirmed) {
        setIsApprovalNeeded(false);
        if (savingsCap) {
          await trackAllowanceSetEvent(savingsCap);
        }
        await handleFinishSetup();
      }
    };
    continueSetupIfApproved();
  }, [isConfirmed]);

  if (!chain) return null;

  const title = `Setup Scheduled Savings`;
  const disabled = !!savingsAddress && isAddress(savingsAddress) === false;
  const isComponentPending = isApprovePending || isSaving;

  return (
    <div className="flex flex-col items-center max-w-md w-full">
      <fieldset className="w-full py-6 disabled:opacity-60">
        {title ? (
          <legend className="px-1 text-xl font-bold text-center text-gray-700">
            {title}
          </legend>
        ) : null}

        <div className="flex flex-col gap-5 pt-4">
          {/* 1. Schedule Amount Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              Choose transfer amount:
            </label>
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scheduleOptions.map((opt) => (
                <button
                  type="button"
                  key={String(opt.value)}
                  disabled={isComponentPending}
                  onClick={() => setAmount(Number(opt.value))}
                  className={`border rounded-lg px-2 py-2 text-center transition-all duration-200
                    ${isComponentPending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}
                    ${
                      opt.value === amount
                        ? "border-[#78E76E] bg-[#78E76E]/50 font-semibold"
                        : "border-gray-300"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Schedule Cycle Selector */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-black">
              How often to save:
            </label>
            <div className="w-full flex gap-2">
              {scheduleCycles.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  disabled={isComponentPending}
                  onClick={() => setCycle(opt.value)}
                  // Added 'flex-1' right here so they stretch to fill the container equally
                  className={`flex-1 border rounded-lg px-2 py-2 text-center capitalize transition-all duration-200
                    ${isComponentPending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}
                    ${
                      opt.value === cycle
                        ? "border-[#78E76E] bg-[#78E76E]/50 font-semibold"
                        : "border-gray-300"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Yield Strategy Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
              What to do with savings:
            </label>
            <div className="w-full grid grid-cols-2 gap-2">
              {yieldOptions.map((opt) => (
                <button
                  type="button"
                  onClick={() => {
                    if (opt.disabled) return;
                    setToYield(opt.value);
                  }}
                  disabled={opt.disabled || isComponentPending}
                  className={`flex flex-col items-center gap-4 border rounded-lg px-4 py-4 text-center transition-all duration-200
                    ${
                      isComponentPending || opt.disabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-gray-50"
                    }
                    ${
                      opt.value === toYield
                        ? "border-[#78E76E] bg-[#78E76E]/50 font-semibold"
                        : "border-gray-300"
                    }
                  `}
                  key={String(opt.value)}
                >
                  <div className="max-h-[64px] max-w-[64px] h-[64px] flex items-center justify-center gap-2">
                    <Image
                      className="h-[64px] w-auto aspect-auto"
                      src={opt.imgSrc}
                      alt={opt.label || "yield option image"}
                      width={64}
                      height={64}
                      fetchPriority="high"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {opt.label}
                    <AdaptiveInfoTooltip content={opt.info} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Savings Address Input */}
          <AnimatePresence>
            {!toYield && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -40 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
                className={"mt-2 flex flex-col gap-1"}
              >
                <label
                  htmlFor={"savingsAddress"}
                  className="text-sm font-medium text-black"
                >
                  Savings address
                </label>
                <input
                  id={"savingsAddress"}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="0x..."
                  value={savingsAddress}
                  onChange={(e) => setSavingsAddress(e.target.value)}
                  className="h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-gray-400 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Select savings chain */}
          <div className="mt-2 w-full flex items-center justify-between gap-4">
            <div className="text-sm font-semibold">
              Choose your savings chain:
            </div>
            <ChainSelector defaultChainId={chain.id} />
          </div>

          {/* Advanced Options */}
          <Accordion className="mt-2" type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="px-6 py-4 border border-gray-300 rounded-lg">
                Advanced Options
              </AccordionTrigger>
              <AccordionContent>
                {/* Savings limit input */}
                <div className="flex flex-col gap-2 pt-2">
                  <label
                    htmlFor={"savingsCap"}
                    className="text-sm font-medium text-black"
                  >
                    Savings Limit (
                    {TokenTickerMap[getUsdcAddressByChain(savingsChainId)]})
                  </label>
                  <input
                    id={"savingsCap"}
                    type="text"
                    value={savingsCap !== null ? savingsCap : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = Number(val);
                      if (val === "") {
                        setSavingsCap(null);
                      } else if (!Number.isNaN(num) && num >= 0) {
                        setSavingsCap(num);
                      }
                    }}
                    className="h-10 rounded-md border border-gray-300 px-3 text-base md:text-base focus-visible:outline-none focus-visible:border-gray-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500">
                    The maximum amount of USDC the smart contract is allowed to
                    move over time before requiring re-approval.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </fieldset>

      {/* Action Button state logic */}
      {isApprovalNeeded === true ? (
        <Button
          className="rounded-lg w-full h-[48px]"
          title={"Approve spending allowance in wallet"}
          onAction={handleApprove}
          disabled={disabled || isComponentPending}
        >
          {isConfirmingAllowance
            ? "Confirming..."
            : isApprovePending
              ? "Processing..."
              : "Continue"}
        </Button>
      ) : isApprovalNeeded === false ? (
        <Button
          className="rounded-lg w-full h-[48px]"
          title={"Start saving"}
          onAction={handleFinishSetup}
          disabled={disabled || isComponentPending}
        >
          {isSaving ? "Setting up schedule..." : "Start saving"}
        </Button>
      ) : (
        <Button
          className="rounded-lg w-full h-[48px]"
          title={"Loading"}
          onAction={() => {}}
          disabled={true}
        >
          {"Loading..."}
        </Button>
      )}
    </div>
  );
}
