import useCreateScheduleConfig from "@/hooks/useCreateScheduleConfig";
import { TokenDecimalMap } from "@/lib/constants";
import { useAutoHodl } from "@/context/AutoHodlContext";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { LoaderSecondary } from "@/components/ui/loader";
import {
  getUsdcAddressByChain,
  convertCycle,
  convertCycleToBigInt,
} from "@/lib/helpers";
import Image from "next/image";
import AdaptiveInfoTooltip from "@/components/ui/tooltips/AdaptiveInfoTooltip";

// Assuming yieldOptions is exported from here alongside the others
import { scheduleOptions, scheduleCycles, yieldOptions } from "@/config";
import Button from "@/components/subcomponents/Button";

const savingsChainId = 8453; // Default to base for now

const ScheduleAmountSelector = () => {
  const { scheduleConfig, setScheduleConfig, loading, setRefetchFlag } =
    useAutoHodl();

  const { createScheduleConfig } = useCreateScheduleConfig();

  const USDC_ADDRESS = getUsdcAddressByChain(savingsChainId);

  // Derive global states
  const globalAmount = Number(
    formatUnits(
      scheduleConfig?.scheduleAmount || BigInt(0),
      TokenDecimalMap[USDC_ADDRESS] || 6,
    ),
  );

  const globalCycleUI = scheduleConfig?.scheduleCycle
    ? convertCycle(scheduleConfig.scheduleCycle)
    : scheduleCycles[0].value;

  const globalToYield = scheduleConfig?.toYield ?? false;

  // Local state for UI
  const [amountLocal, setAmountLocal] = useState(scheduleOptions[0].value);
  const [cycleLocal, setCycleLocal] = useState(scheduleCycles[0].value);
  const [toYieldLocal, setToYieldLocal] = useState(globalToYield);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when the user's config loads to prevent overwriting
  useEffect(() => {
    if (scheduleConfig?.scheduleAmount) setAmountLocal(globalAmount);
    if (scheduleConfig?.scheduleCycle) setCycleLocal(globalCycleUI);
    if (scheduleConfig?.toYield !== undefined) setToYieldLocal(globalToYield);
  }, [
    scheduleConfig?.scheduleAmount,
    scheduleConfig?.scheduleCycle,
    scheduleConfig?.toYield,
    globalAmount,
    globalCycleUI,
    globalToYield,
  ]);

  // Determine if there are unsaved changes across ANY of the three inputs
  const hasChanges =
    globalAmount !== amountLocal ||
    globalCycleUI !== cycleLocal ||
    globalToYield !== toYieldLocal;

  const isPending = loading || isSaving;

  const handleSaveSchedule = async () => {
    const addressToUse =
      scheduleConfig?.savingAddress || scheduleConfig?.delegate;

    if (!addressToUse || !savingsChainId || !hasChanges) return;

    setIsSaving(true);
    try {
      const cycleBigInt = convertCycleToBigInt(cycleLocal);

      await createScheduleConfig({
        scheduleAmount: amountLocal,
        cycle: cycleBigInt,
        savingsAddress: addressToUse,
        mode: scheduleConfig.mode,
        active: scheduleConfig.active,
        toYield: toYieldLocal, // Using the new local state here
        savingsChainId: savingsChainId,
      });

      // Optimistic update for all three fields
      setScheduleConfig((prev) =>
        prev
          ? {
              ...prev,
              scheduleAmount: parseUnits(
                amountLocal.toString(),
                TokenDecimalMap[USDC_ADDRESS] || 6,
              ),
              scheduleCycle: cycleBigInt,
              toYield: toYieldLocal,
            }
          : prev,
      );

      if (setRefetchFlag) setRefetchFlag((prev) => !prev);
    } catch {
      // Revert cleanly to the derived global states on error
      // TODO: add error toast
      setAmountLocal(globalAmount);
      setCycleLocal(globalCycleUI);
      setToYieldLocal(globalToYield);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Current Plan Display */}
      <div className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            Current Schedule
          </p>
          <p className="text-lg font-medium text-black">
            ${globalAmount}{" "}
            <span className="text-gray-500 text-base capitalize font-normal">
              / {globalCycleUI}
            </span>
          </p>
        </div>
        {loading && <LoaderSecondary />}
      </div>

      {/* 1. Schedule Amount Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-black flex items-center gap-2">
          <span>Choose New Amount:</span>
        </label>
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {scheduleOptions.map((opt) => (
            <button
              type="button"
              key={String(opt.value)}
              disabled={isPending}
              onClick={() => setAmountLocal(Number(opt.value))}
              className={`border rounded-lg px-2 py-2 text-center transition-all duration-200
                ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}
                ${
                  opt.value === amountLocal
                    ? "border-[#78E76E] bg-[#78E76E]/20 font-semibold text-green-900"
                    : "border-gray-300"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Schedule Cycle Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-black flex items-center gap-2">
          <span>Choose New Cycle:</span>
        </label>
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {scheduleCycles.map((opt) => (
            <button
              type="button"
              key={opt.value}
              disabled={isPending}
              onClick={() => setCycleLocal(opt.value)}
              className={`border rounded-lg px-2 py-2 text-center capitalize transition-all duration-200
                ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}
                ${
                  opt.value === cycleLocal
                    ? "border-[#78E76E] bg-[#78E76E]/20 font-semibold text-green-900"
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
        <label className="text-sm font-medium text-black flex items-center gap-2">
          <span>What to do with savings:</span>
        </label>
        <div className="w-full grid grid-cols-2 gap-2">
          {yieldOptions.map((opt) => (
            <button
              type="button"
              key={String(opt.value)}
              disabled={isPending || opt.disabled}
              onClick={() => setToYieldLocal(opt.value)}
              className={`flex flex-col items-center gap-4 border rounded-lg px-4 py-4 text-center transition-all duration-200
                ${
                  isPending || opt.disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-gray-50"
                }
                ${
                  opt.value === toYieldLocal
                    ? "border-[#78E76E] bg-[#78E76E]/20 font-semibold text-green-900"
                    : "border-gray-300"
                }
              `}
            >
              <div className="max-w-[64px] max-h-[64px] flex items-center justify-center gap-2">
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

      {/* Save Button */}
      <div className="pt-2">
        <Button
          title={hasChanges ? "Save Schedule" : "Up to Date"}
          className="w-full h-[40px]"
          disabled={!hasChanges || isPending}
          onAction={handleSaveSchedule}
        >
          <span className="flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                Saving... <LoaderSecondary />
              </>
            ) : hasChanges ? (
              "Save Schedule"
            ) : (
              "Up to Date"
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ScheduleAmountSelector;
