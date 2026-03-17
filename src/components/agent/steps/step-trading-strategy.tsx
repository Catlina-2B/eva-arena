import { useCallback, useState } from "react";

import {
  TRADING_STRATEGY_PRESETS,
  TRADING_PRESET_BUTTONS,
  type TradingPresetKey,
  type StrategyMeta,
} from "@/constants/strategy-presets";
import { TradingPhaseFlow } from "@/components/agent/phase-flow-diagrams";
import type { WizardPhase } from "@/types/api";

interface StepTradingStrategyProps {
  tradingStrategy: string;
  activeTradingPreset: TradingPresetKey | null | undefined;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  createError: string | null;
  onTradingStrategyChange: (value: string) => void;
  onPresetSelect: (key: string) => void;
  onOpenAIDrawer: (phase: WizardPhase) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7.58333 3.79167L8.75 2.625C9.07082 2.30418 9.5 2.125 9.94792 2.125C10.3958 2.125 10.825 2.30418 11.1458 2.625C11.4667 2.94582 11.6458 3.375 11.6458 3.82292C11.6458 4.27083 11.4667 4.7 11.1458 5.02083L8.8125 7.35417C8.49168 7.67499 8.0625 7.85417 7.61458 7.85417C7.16667 7.85417 6.7375 7.67499 6.41667 7.35417" stroke="#6ce182" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.41667 10.2083L5.25 11.375C4.92918 11.6958 4.5 11.875 4.05208 11.875C3.60417 11.875 3.175 11.6958 2.85417 11.375C2.53335 11.0542 2.35417 10.625 2.35417 10.1771C2.35417 9.72917 2.53335 9.3 2.85417 8.97917L5.1875 6.64583C5.50832 6.32501 5.9375 6.14583 6.38542 6.14583C6.83333 6.14583 7.2625 6.32501 7.58333 6.64583" stroke="#6ce182" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CreationFeeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1 4C1 5.65575 2.34425 7 4 7C5.65575 7 7 5.65575 7 4C7 2.34425 5.65575 1 4 1C2.34425 1 1 2.34425 1 4V4" stroke="#D357E0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.04498 5.18506C10.3477 5.67075 11.1461 6.98792 10.9739 8.36756C10.8017 9.74721 9.70416 10.8278 8.322 10.9784C6.93984 11.129 5.63529 10.3102 5.16998 9.00006" stroke="#D357E0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 3H4V5" stroke="#D357E0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.35498 6.93994L8.70498 7.29494L7.29498 8.70494" stroke="#D357E0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StrategyPresetCard({
  meta,
  isActive,
  onClick,
}: {
  meta: StrategyMeta;
  isActive: boolean;
  onClick: () => void;
}) {
  const riskColor =
    meta.riskProfile === "Conservative" ? "text-blue-400" :
    meta.riskProfile === "Balanced" ? "text-yellow-400" :
    "text-red-400";

  return (
    <button
      type="button"
      className={`flex-1 flex flex-col text-left p-4 rounded-lg border transition-all ${
        isActive
          ? "border-[#6ce182] bg-[#6ce182]/5"
          : "border-[#1f2937] bg-[#0d1117] hover:border-[#374151]"
      }`}
      onClick={onClick}
    >
      <div className="text-base font-semibold text-white mb-3">
        <span className="mr-1.5">{meta.emoji}</span>{meta.label}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#6b7280] uppercase">Risk</span>
        <span className={`text-sm font-medium ${riskColor}`}>{meta.riskProfile}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#6b7280] uppercase">Freq</span>
        <span className="text-sm font-medium text-white">{meta.frequency}</span>
      </div>
      <div className="pt-2 border-t border-[#1f2937] mb-2 flex-1">
        <div className="text-xs text-[#6b7280] mb-0.5">Best in</div>
        <div className="text-sm text-[#d1d5db] leading-snug">{meta.bestCondition}</div>
      </div>
      <div>
        <div className="text-xs text-[#6b7280] mb-0.5">Weak in</div>
        <div className="text-sm text-[#d1d5db] leading-snug">{meta.weakCondition}</div>
      </div>
    </button>
  );
}

export function StepTradingStrategy({
  tradingStrategy, activeTradingPreset,
  isSubmitting, isAuthenticated, createError,
  onTradingStrategyChange, onPresetSelect, onOpenAIDrawer,
  onBack, onSubmit,
}: StepTradingStrategyProps) {
  const isStepValid = tradingStrategy.trim().length > 0;
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const handlePresetSelect = useCallback(
    (key: string) => {
      const presetKey = key as TradingPresetKey;
      const prompt = TRADING_STRATEGY_PRESETS[presetKey];
      if (prompt) {
        onPresetSelect(key);
        setIsPromptExpanded(false);
      }
    },
    [onPresetSelect],
  );

  const resolvedActiveKey = activeTradingPreset === undefined
    ? TRADING_PRESET_BUTTONS[0]?.key
    : activeTradingPreset;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-6 items-stretch min-h-[420px]">
        {/* Left — Flow Diagram */}
        <div className="w-[420px] shrink-0">
          <TradingPhaseFlow />
        </div>

        {/* Right — Strategy Config */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Trading Strategy
            </label>
            <button
              type="button"
              className="flex items-center gap-1 h-8 px-4 border border-[#6ce182] rounded text-[#6ce182] text-xs font-semibold uppercase tracking-wider hover:bg-[#6ce182]/10 transition-colors"
              onClick={() => {
                onOpenAIDrawer("trading");
                setIsPromptExpanded(true);
              }}
            >
              <LinkIcon />
              <span>Strategy Builder</span>
            </button>
          </div>

          {/* 3 Strategy Preset Cards side by side */}
          <div className="grid grid-cols-3 gap-3 items-stretch">
            {TRADING_PRESET_BUTTONS.map((preset) => (
              <StrategyPresetCard
                key={preset.key}
                meta={preset}
                isActive={resolvedActiveKey === preset.key}
                onClick={() => handlePresetSelect(preset.key)}
              />
            ))}
          </div>

          {/* Collapsible Prompt */}
          {!isPromptExpanded ? (
            <button
              type="button"
              className="flex items-center gap-2 py-1 text-xs text-[#6ce182] hover:text-[#5bd174] transition-colors"
              onClick={() => setIsPromptExpanded(true)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View Full Strategy Logic
            </button>
          ) : (
            <>
              <button
                type="button"
                className="flex items-center gap-2 py-1 text-xs text-[#9ca3af] hover:text-white transition-colors"
                onClick={() => setIsPromptExpanded(false)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 7.5L6 4.5L9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Collapse
              </button>
              <div className="flex-1 bg-black border border-[#374151]">
                <textarea
                  className="w-full h-full min-h-[160px] px-[17px] py-[17px] bg-transparent text-sm font-medium text-white placeholder:text-[#374151] focus:outline-none resize-none"
                  placeholder="// Enter logic for entry/exit execution..."
                  value={tradingStrategy}
                  onChange={(e) => onTradingStrategyChange(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {createError && (
        <div className="p-4 bg-red-500/10 border border-red-500/50">
          <span className="text-sm font-mono text-red-400">{createError}</span>
        </div>
      )}

      {/* Bottom — Back + Fee + Create */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="h-[54px] px-6 border border-[#374151] text-sm font-medium text-[#9ca3af] rounded hover:border-white/30 hover:text-white transition-colors"
          onClick={onBack}
        >
          BACK
        </button>

        <div className="flex items-center gap-4">
          <div className="h-[54px] bg-[#15171e] border border-[#1f2937] px-[17px] flex items-center gap-4">
            <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              Creation Fee
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">0.1 SOL</span>
              <CreationFeeIcon />
            </div>
          </div>

          <button
            type="button"
            className="h-[54px] px-8 bg-[#6ce182] border border-[#6ce182] rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5bd174] transition-colors"
            disabled={!isStepValid || isSubmitting || !isAuthenticated}
            onClick={onSubmit}
          >
            <span className="font-semibold text-sm text-black uppercase tracking-wider">
              {isSubmitting ? "CREATING..." : "CREATE AGENT"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
