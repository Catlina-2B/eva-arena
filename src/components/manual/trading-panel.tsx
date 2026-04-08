import type { ArenaPhase } from "@/types";
import type { TrenchDetailDto } from "@/types/api";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type Dispatch,
  type InputHTMLAttributes,
  type ReactNode,
  type SetStateAction,
} from "react";
import { addToast } from "@heroui/toast";
import clsx from "clsx";

import {
  useManualDeposit,
  useManualWithdraw,
  useManualBuy,
  useManualSell,
} from "@/hooks/use-manual-trade";
import { useUserPnlTimeline } from "@/hooks";
import { EvaCard, EvaCardContent } from "@/components/ui/eva-card";
import { useTurnkeyBalanceStore } from "@/stores/turnkey-balance";

const LAMPORTS_PER_SOL = 1_000_000_000;
const QUICK_SOL_PRESETS_STORAGE_KEY = "eva-manual-quick-sol-presets";
const DEFAULT_QUICK_SOL_PRESETS = [0.1, 0.2, 0.5, 1] as const;
const QUICK_TOKEN_PERCENT_PRESETS_STORAGE_KEY =
  "eva-manual-quick-token-percent-presets";
const DEFAULT_QUICK_TOKEN_PERCENT_PRESETS = [25, 50, 75, 100] as const;
const QUICK_WITHDRAW_PERCENT_PRESETS_STORAGE_KEY =
  "eva-manual-quick-withdraw-percent-presets";
/** Mirrors common quick-tap steps: ~10% / 20% / 50% / max slice. */
const DEFAULT_QUICK_WITHDRAW_PERCENT_PRESETS = [10, 20, 50, 100] as const;
const SLIPPAGE_PRESET_BPS = [100, 300, 500, 1000] as const;

function loadQuickPresets(
  storageKey: string,
  fallback: readonly number[],
  maxValue?: number,
): number[] {
  if (typeof window === "undefined") return [...fallback];
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw) as unknown;

    if (
      Array.isArray(parsed) &&
      parsed.length === 4 &&
      parsed.every(
        (x) =>
          typeof x === "number" &&
          Number.isFinite(x) &&
          x > 0 &&
          (maxValue === undefined || x <= maxValue),
      )
    ) {
      return parsed as number[];
    }
  } catch {
    /* ignore */
  }

  return [...fallback];
}

function formatPresetLabel(n: number): string {
  const t = n.toFixed(6).replace(/\.?0+$/, "");

  return t === "" ? "0" : t;
}

/** Rejects negative input; allows empty / partial decimals while typing. */
function sanitizeNonNegativeAmountInput(raw: string): string {
  if (raw === "" || raw === ".") return raw;
  if (/^-/.test(raw)) return "";
  const n = parseFloat(raw);

  if (Number.isFinite(n) && n < 0) return "0";

  return raw;
}

function usePersistedFourPresets(
  storageKey: string,
  defaults: readonly number[],
  options: {
    maxPresetValue?: number;
    validate: (nums: number[]) => boolean;
    invalidDescription: string;
  },
) {
  const { maxPresetValue, validate, invalidDescription } = options;
  const [presets, setPresets] = useState<number[]>(() => [...defaults]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(() =>
    [...defaults].map(formatPresetLabel),
  );

  useEffect(() => {
    const loaded = loadQuickPresets(storageKey, defaults, maxPresetValue);

    setPresets(loaded);
  }, [storageKey, defaults, maxPresetValue]);

  useEffect(() => {
    if (editing) {
      setDraft(presets.map(formatPresetLabel));
    }
  }, [editing, presets]);

  const startEdit = useCallback(() => setEditing(true), []);

  const confirmEdit = useCallback(() => {
    const nums = draft.map((s) =>
      parseFloat(String(s).trim().replace(/,/g, ".")),
    );

    if (nums.length !== 4 || !validate(nums)) {
      addToast({
        title: "Invalid presets",
        description: invalidDescription,
        color: "warning",
      });

      return;
    }
    setPresets(nums);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nums));
    } catch {
      /* ignore */
    }
    setEditing(false);
  }, [draft, invalidDescription, storageKey, validate]);

  return { presets, editing, draft, setDraft, startEdit, confirmEdit };
}

function usePersistedQuickSolPresets() {
  return usePersistedFourPresets(
    QUICK_SOL_PRESETS_STORAGE_KEY,
    DEFAULT_QUICK_SOL_PRESETS,
    {
      validate: (nums) => nums.every((n) => Number.isFinite(n) && n > 0),
      invalidDescription: "Enter four numbers greater than 0",
    },
  );
}

function usePersistedQuickTokenPercentPresets() {
  return usePersistedFourPresets(
    QUICK_TOKEN_PERCENT_PRESETS_STORAGE_KEY,
    DEFAULT_QUICK_TOKEN_PERCENT_PRESETS,
    {
      maxPresetValue: 100,
      validate: (nums) =>
        nums.every((n) => Number.isFinite(n) && n > 0 && n <= 100),
      invalidDescription: "Enter four percentages from 1 to 100",
    },
  );
}

function usePersistedQuickWithdrawPercentPresets() {
  return usePersistedFourPresets(
    QUICK_WITHDRAW_PERCENT_PRESETS_STORAGE_KEY,
    DEFAULT_QUICK_WITHDRAW_PERCENT_PRESETS,
    {
      maxPresetValue: 100,
      validate: (nums) =>
        nums.every((n) => Number.isFinite(n) && n > 0 && n <= 100),
      invalidDescription: "Enter four percentages from 1 to 100",
    },
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="16"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
    >
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="16"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
    >
      <path
        d="M5 13l4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

type Tone = "green" | "rose";

function PairTabs({
  active,
  leftId,
  leftLabel,
  onChange,
  rightId,
  rightLabel,
}: {
  active: string;
  leftId: string;
  leftLabel: string;
  onChange: (id: string) => void;
  rightId: string;
  rightLabel: string;
}) {
  const Item = ({
    id,
    label,
    tone,
  }: {
    id: string;
    label: string;
    tone: Tone;
  }) => {
    const on = active === id;

    return (
      <button
        className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors rounded-md ${
          on
            ? tone === "green"
              ? "text-emerald-400 bg-zinc-900/90 shadow-sm ring-1 ring-emerald-500/35"
              : "text-rose-400 bg-zinc-900/90 shadow-sm ring-1 ring-rose-500/35"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        type="button"
        onClick={() => onChange(id)}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-1 rounded-lg bg-zinc-950/80 p-1 ring-1 ring-zinc-800/80">
      <Item id={leftId} label={leftLabel} tone="green" />
      <Item id={rightId} label={rightLabel} tone="rose" />
    </div>
  );
}

interface SegmentedSolPresetsProps {
  disabled: boolean;
  onPick: (sol: number) => void;
  presets: number[];
  editing: boolean;
  draft: string[];
  setDraft: Dispatch<SetStateAction<string[]>>;
  showEditButton: boolean;
  onStartEdit: () => void;
  onConfirmEdit: () => void;
  tone: Tone;
  /** When true, buttons show as percentages (e.g. 25%). Values passed to onPick are still numeric percents. */
  percentLabels?: boolean;
}

function SegmentedSolPresets({
  disabled,
  onPick,
  presets,
  editing,
  draft,
  setDraft,
  showEditButton,
  onStartEdit,
  onConfirmEdit,
  tone,
  percentLabels = false,
}: SegmentedSolPresetsProps) {
  const displayValues = editing ? draft : presets.map(formatPresetLabel);
  const hover =
    tone === "green"
      ? "hover:bg-emerald-500/10 hover:text-emerald-300"
      : "hover:bg-rose-500/10 hover:text-rose-300";

  const updateDraft = (i: number, val: string) => {
    setDraft((prev) => {
      const next = [...prev];

      next[i] = val;

      return next;
    });
  };

  return (
    <div className="flex w-full border-t border-zinc-700/70">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`min-w-0 flex-1 border-r border-zinc-700/70 ${
            showEditButton ? "" : "last:border-r-0"
          }`}
        >
          {editing && showEditButton ? (
            <input
              className="w-full bg-transparent px-1 py-2.5 text-center text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
              inputMode="decimal"
              value={draft[i] ?? ""}
              onChange={(e) => updateDraft(i, e.target.value)}
            />
          ) : (
            <button
              className={`w-full py-2.5 text-xs font-mono text-zinc-400 transition-colors disabled:opacity-40 ${hover}`}
              disabled={disabled || (editing && !showEditButton)}
              type="button"
              onClick={() => {
                const v = parseFloat(displayValues[i] ?? "0");

                if (Number.isFinite(v) && v > 0) onPick(v);
              }}
            >
              {percentLabels && !editing
                ? `${displayValues[i]}%`
                : displayValues[i]}
            </button>
          )}
        </div>
      ))}
      {showEditButton && (
        <div className="shrink-0 w-11 border-l border-zinc-700/70">
          <button
            aria-label={
              editing
                ? "Confirm preset edits"
                : percentLabels
                  ? "Edit quick percent presets"
                  : "Edit quick amounts"
            }
            className={`flex h-full w-full items-center justify-center transition-colors disabled:opacity-40 ${
              editing
                ? tone === "green"
                  ? "text-emerald-400 hover:bg-emerald-500/15"
                  : "text-rose-400 hover:bg-rose-500/15"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80"
            }`}
            disabled={disabled && !editing}
            type="button"
            onClick={() => (editing ? onConfirmEdit() : onStartEdit())}
          >
            {editing ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PencilIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

interface SegmentedTokenPresetsProps extends SegmentedSolPresetsProps {
  /** When true, preset buttons show as percentages (e.g. 25%). */
  percentLabels?: boolean;
}

function SegmentedTokenPresets({
  disabled,
  onPick,
  presets,
  editing,
  draft,
  setDraft,
  showEditButton,
  onStartEdit,
  onConfirmEdit,
  tone,
  percentLabels = false,
}: SegmentedTokenPresetsProps) {
  const displayValues = editing ? draft : presets.map(formatPresetLabel);
  const hover =
    tone === "green"
      ? "hover:bg-emerald-500/10 hover:text-emerald-300"
      : "hover:bg-rose-500/10 hover:text-rose-300";

  const updateDraft = (i: number, val: string) => {
    setDraft((prev) => {
      const next = [...prev];

      next[i] = val;

      return next;
    });
  };

  return (
    <div className="flex w-full border-t border-zinc-700/70">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="min-w-0 flex-1 border-r border-zinc-700/70">
          {editing && showEditButton ? (
            <input
              className="w-full bg-transparent px-1 py-2.5 text-center text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
              inputMode="decimal"
              value={draft[i] ?? ""}
              onChange={(e) => updateDraft(i, e.target.value)}
            />
          ) : (
            <button
              className={`w-full py-2.5 text-xs font-mono text-zinc-400 transition-colors disabled:opacity-40 ${hover}`}
              disabled={disabled || (editing && !showEditButton)}
              type="button"
              onClick={() => {
                const v = parseFloat(displayValues[i] ?? "0");

                if (Number.isFinite(v) && v > 0) onPick(v);
              }}
            >
              {percentLabels && !editing
                ? `${displayValues[i]}%`
                : displayValues[i]}
            </button>
          )}
        </div>
      ))}
      {showEditButton && (
        <div className="shrink-0 w-11 border-l border-zinc-700/70">
          <button
            aria-label={
              editing ? "Confirm preset edits" : "Edit quick percent presets"
            }
            className={`flex h-full w-full items-center justify-center transition-colors disabled:opacity-40 ${
              editing
                ? tone === "green"
                  ? "text-emerald-400 hover:bg-emerald-500/15"
                  : "text-rose-400 hover:bg-rose-500/15"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80"
            }`}
            disabled={disabled && !editing}
            type="button"
            onClick={() => (editing ? onConfirmEdit() : onStartEdit())}
          >
            {editing ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PencilIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function AmountShell({
  children,
  disabled,
  inputProps,
  trailing,
}: {
  children: ReactNode;
  disabled?: boolean;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  trailing: ReactNode;
}) {
  const { className: inputClassName, ...restInput } = inputProps;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/70 bg-zinc-950/85 ring-1 ring-black/20">
      <div className="flex min-h-[48px] items-center gap-2 px-3 py-2.5">
        <input
          className={clsx(
            "min-w-0 flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50",
            inputClassName,
          )}
          disabled={disabled}
          {...restInput}
        />
        <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500">
          {trailing}
        </span>
      </div>
      {children}
    </div>
  );
}

function formatSol(lamports: string | number): string {
  const n = typeof lamports === "string" ? parseInt(lamports) : lamports;

  if (isNaN(n)) return "0.0000";

  return (n / LAMPORTS_PER_SOL).toFixed(4);
}

function formatToken(raw: string | number): string {
  const n = typeof raw === "string" ? parseInt(raw) : raw;

  if (isNaN(n)) return "0.00";
  const abs = Math.abs(n / 1_000_000);

  if (abs >= 1_000_000) return (n / 1_000_000 / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return (n / 1_000_000 / 1_000).toFixed(2) + "K";

  return (n / 1_000_000).toFixed(2);
}

function formatTokenPercent(raw: string | number): string {
  const n = typeof raw === "string" ? parseInt(raw) : raw;

  if (isNaN(n)) return "0.00";

  return ((n / 1_000_000 / 1_000_000_000) * 100).toFixed(2);
}

/** Human-readable token amount (6 decimals on-chain). */
function tokenHumanFromRaw(raw: string): number {
  const n = parseInt(raw, 10);

  if (!Number.isFinite(n) || n < 0) return 0;

  return n / 1_000_000;
}

function formatSlippagePercent(bps: number): string {
  const x = Math.round(bps) / 100;

  if (Number.isInteger(x)) return `${x}%`;
  const t = x.toFixed(2).replace(/\.?0+$/, "");

  return `${t}%`;
}

/** Align with `trenchToArenaRound` / slot-based phase (not lagging `trench.status`). */
function arenaPhaseToPanelPhase(
  p: ArenaPhase,
): "bidding" | "trading" | "settlement" {
  if (p === "betting") return "bidding";
  if (p === "trading") return "trading";

  return "settlement";
}

interface ManualTradingPanelProps {
  trenchData?: TrenchDetailDto | null;
  /** User's deposited SOL in trench (lamports string); max withdraw during bidding */
  biddingDepositedSol?: string | null;
  /**
   * Phase from the same source as the main arena panel (`currentSlot` + block math when available).
   * Without this, the panel follows `trenchData.status` only and lags behind at phase boundaries.
   */
  arenaPhase?: ArenaPhase;
}

export function ManualTradingPanel({
  trenchData,
  biddingDepositedSol = null,
  arenaPhase,
}: ManualTradingPanelProps) {
  const { balance: turnkeyBalance } = useTurnkeyBalanceStore();

  const deposit = useManualDeposit();
  const withdraw = useManualWithdraw();
  const buy = useManualBuy();
  const sell = useManualSell();

  const quickPresets = usePersistedQuickSolPresets();
  const quickTokenPercentPresets = usePersistedQuickTokenPercentPresets();
  const withdrawPercentPresets = usePersistedQuickWithdrawPercentPresets();

  const [amount, setAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [biddingTab, setBiddingTab] = useState<"deposit" | "withdraw">(
    "deposit",
  );
  const [tradeTab, setTradeTab] = useState<"buy" | "sell">("buy");
  const [sellTokenAmount, setSellTokenAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(500);
  const [showSlippage, setShowSlippage] = useState(false);
  const [customSlippageOpen, setCustomSlippageOpen] = useState(false);
  const [customSlippageDraft, setCustomSlippageDraft] = useState("");

  const phase = useMemo(() => {
    if (!trenchData) return "bidding";
    if (arenaPhase !== undefined) {
      return arenaPhaseToPanelPhase(arenaPhase);
    }
    if (trenchData.status === "BIDDING") return "bidding";
    if (trenchData.status === "TRADING") return "trading";

    return "settlement";
  }, [trenchData, arenaPhase]);

  const isBidding = phase === "bidding";
  const isTrading = phase === "trading";
  const isSettlement = phase === "settlement";
  const isSubmitting =
    deposit.isPending || withdraw.isPending || buy.isPending || sell.isPending;

  const availableSol = turnkeyBalance;

  const { data: pnlTimeline } = useUserPnlTimeline();

  const tokenBalance = trenchData?.tokenBalance ?? "0";
  const tokenSymbol = trenchData?.tokenSymbol ?? "TOKEN";
  const trenchMarketUnit = useMemo(() => {
    const id = trenchData?.trenchId?.trim();

    if (!id) return "eva-?";
    const lower = id.toLowerCase();

    if (lower.startsWith("eva-")) return lower;

    return `eva-${lower}`;
  }, [trenchData?.trenchId]);
  const tokenBalanceHuman = useMemo(
    () => tokenHumanFromRaw(tokenBalance),
    [tokenBalance],
  );
  const roundPnlRaw = trenchData?.pnlSol ?? "0";
  const roundPnl = parseInt(roundPnlRaw) / LAMPORTS_PER_SOL;

  const totalPnl = useMemo(() => {
    if (!pnlTimeline?.timeline?.length) return 0;
    const last = pnlTimeline.timeline[pnlTimeline.timeline.length - 1];

    return parseInt(last.pnl) / LAMPORTS_PER_SOL;
  }, [pnlTimeline]);

  const maxWithdrawSol = useMemo(() => {
    if (!biddingDepositedSol) return 0;
    const lamports = parseFloat(biddingDepositedSol);

    if (!Number.isFinite(lamports) || lamports < 0) return 0;

    return lamports / LAMPORTS_PER_SOL;
  }, [biddingDepositedSol]);

  const handleDeposit = useCallback(async () => {
    const val = parseFloat(depositAmount);

    if (isNaN(val) || val <= 0) return;
    try {
      const result = await deposit.mutateAsync(val);

      if (result.success) {
        addToast({
          title: "Deposit successful",
          description: `Deposited ${val} SOL`,
          color: "success",
        });
        setDepositAmount("");
      }
    } catch (err: any) {
      addToast({
        title: "Deposit failed",
        description: err?.message || "Unknown error",
        color: "danger",
      });
    }
  }, [depositAmount, deposit]);

  const handleWithdraw = useCallback(async () => {
    const val = parseFloat(withdrawAmount);

    if (isNaN(val) || val <= 0) return;
    const capped = maxWithdrawSol > 0 ? Math.min(val, maxWithdrawSol) : val;

    try {
      const result = await withdraw.mutateAsync(capped);

      if (result.success) {
        addToast({
          title: "Withdraw successful",
          description: `Withdrew ${capped} SOL`,
          color: "success",
        });
        setWithdrawAmount("");
      }
    } catch (err: any) {
      addToast({
        title: "Withdraw failed",
        description: err?.message || "Unknown error",
        color: "danger",
      });
    }
  }, [withdrawAmount, withdraw, maxWithdrawSol]);

  const handleBuy = useCallback(async () => {
    const val = parseFloat(amount);

    if (isNaN(val) || val <= 0) return;
    try {
      const result = await buy.mutateAsync({ amount: val, slippageBps });

      if (result.success) {
        addToast({
          title: "Buy successful",
          description: `Spent ${val} SOL on tokens`,
          color: "success",
        });
        setAmount("");
      }
    } catch (err: any) {
      addToast({
        title: "Buy failed",
        description: err?.message || "Unknown error",
        color: "danger",
      });
    }
  }, [amount, slippageBps, buy]);

  const runSell = useCallback(
    async (sellArg: string, labelForToast: string) => {
      try {
        const result = await sell.mutateAsync(sellArg);

        if (result.success) {
          addToast({
            title: "Sell successful",
            description: `Sold ${labelForToast} ${trenchMarketUnit}`,
            color: "success",
          });
          setSellTokenAmount("");
        }
      } catch (err: any) {
        addToast({
          title: "Sell failed",
          description: err?.message || "Unknown error",
          color: "danger",
        });
      }
    },
    [sell, trenchMarketUnit],
  );

  const handleSellSubmit = useCallback(async () => {
    const v = parseFloat(sellTokenAmount.trim());

    if (!Number.isFinite(v) || v <= 0) return;
    const capped = tokenBalanceHuman > 0 ? Math.min(v, tokenBalanceHuman) : v;

    await runSell(String(capped), formatPresetLabel(capped));
  }, [sellTokenAmount, runSell, tokenBalanceHuman]);

  const applyCustomSlippage = useCallback(() => {
    const p = parseFloat(String(customSlippageDraft).trim().replace(/,/g, "."));

    if (!Number.isFinite(p) || p < 0.01 || p > 50) {
      addToast({
        title: "Invalid slippage",
        description: "Use 0.01% – 50%",
        color: "warning",
      });

      return;
    }
    setSlippageBps(Math.round(p * 100));
    setCustomSlippageOpen(false);
  }, [customSlippageDraft]);

  const selectSlippagePreset = useCallback((bps: number) => {
    setSlippageBps(bps);
    setCustomSlippageOpen(false);
  }, []);

  const openCustomSlippage = useCallback(() => {
    setCustomSlippageOpen(true);
    setCustomSlippageDraft(String(slippageBps / 100));
  }, [slippageBps]);

  const slippageMatchesPreset = SLIPPAGE_PRESET_BPS.includes(
    slippageBps as (typeof SLIPPAGE_PRESET_BPS)[number],
  );

  const hasToken = parseInt(tokenBalance, 10) > 0;

  const sellAmountSubmittable = useMemo(() => {
    const v = parseFloat(sellTokenAmount.trim());

    return Number.isFinite(v) && v > 0;
  }, [sellTokenAmount]);

  return (
    <EvaCard>
      <EvaCardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
            Manual Trading
          </span>
          <span className="rounded px-2 py-0.5 font-mono text-[10px] text-eva-primary bg-eva-primary/20">
            {phase.toUpperCase()}
          </span>
        </div>

        <div className="rounded-lg border border-eva-border bg-eva-dark/50 p-3">
          <div className="mb-3 flex items-center justify-between border-b border-eva-border/50 pb-3">
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {formatToken(tokenBalance)}
              </span>
              <span className="text-[10px] uppercase text-eva-text-dim">
                {tokenSymbol}
              </span>
              <span className="ml-1 font-mono text-xs text-purple-400">
                ({formatTokenPercent(tokenBalance)}%)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {availableSol.toFixed(4)}
              </span>
              <span className="text-[10px] uppercase text-eva-text-dim">
                SOL
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-eva-text-dim">
                Total PNL
              </div>
              <div
                className={`font-mono text-xl font-semibold ${
                  totalPnl >= 0 ? "text-eva-primary" : "text-eva-danger"
                }`}
              >
                {totalPnl >= 0 ? "+" : ""}
                {totalPnl.toFixed(4)} SOL
              </div>
            </div>
            <div>
              <div className="mb-1 text-right text-[10px] uppercase tracking-wider text-eva-text-dim">
                Round PNL
              </div>
              <div
                className={`text-right font-mono text-xl font-semibold ${
                  roundPnl >= 0 ? "text-eva-primary" : "text-eva-danger"
                }`}
              >
                {roundPnl >= 0 ? "+" : ""}
                {roundPnl.toFixed(4)} SOL
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-eva-border/30" />

        {isSettlement && (
          <div className="py-6 text-center">
            <p className="font-mono text-xs text-eva-text-dim">
              ROUND SETTLING
            </p>
            <p className="mt-1 text-[10px] text-eva-text-dim">
              Trading is disabled during settlement
            </p>
          </div>
        )}

        {isBidding && (
          <div className="space-y-3">
            <PairTabs
              active={biddingTab}
              leftId="deposit"
              leftLabel="DEPOSIT"
              rightId="withdraw"
              rightLabel="WITHDRAW"
              onChange={(id) => setBiddingTab(id as "deposit" | "withdraw")}
            />

            <div className="flex justify-end text-[11px] text-zinc-500">
              <span>
                Balance:{" "}
                <span className="font-mono text-zinc-300">
                  {biddingTab === "deposit"
                    ? `${availableSol.toFixed(4)} SOL`
                    : `${maxWithdrawSol.toFixed(4)} SOL`}
                </span>
              </span>
            </div>

            {biddingTab === "deposit" && (
              <>
                <AmountShell
                  disabled={isSubmitting}
                  inputProps={{
                    min: 0,
                    placeholder: "Amount",
                    type: "number",
                    value: depositAmount,
                    onChange: (e) =>
                      setDepositAmount(
                        sanitizeNonNegativeAmountInput(e.target.value),
                      ),
                  }}
                  trailing="SOL"
                >
                  <SegmentedSolPresets
                    showEditButton
                    disabled={isSubmitting}
                    draft={quickPresets.draft}
                    editing={quickPresets.editing}
                    presets={quickPresets.presets}
                    setDraft={quickPresets.setDraft}
                    tone="green"
                    onConfirmEdit={quickPresets.confirmEdit}
                    onPick={(sol) => setDepositAmount(sol.toFixed(4))}
                    onStartEdit={quickPresets.startEdit}
                  />
                </AmountShell>

                <button
                  className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    isSubmitting ||
                    !depositAmount ||
                    parseFloat(depositAmount) <= 0
                  }
                  type="button"
                  onClick={handleDeposit}
                >
                  {deposit.isPending ? "…" : "DEPOSIT"}
                </button>
              </>
            )}

            {biddingTab === "withdraw" && (
              <>
                <AmountShell
                  disabled={isSubmitting}
                  inputProps={{
                    max: maxWithdrawSol > 0 ? maxWithdrawSol : undefined,
                    min: 0,
                    placeholder: "Amount",
                    type: "number",
                    value: withdrawAmount,
                    onChange: (e) =>
                      setWithdrawAmount(
                        sanitizeNonNegativeAmountInput(e.target.value),
                      ),
                  }}
                  trailing="SOL"
                >
                  <SegmentedSolPresets
                    percentLabels
                    showEditButton
                    disabled={isSubmitting}
                    draft={withdrawPercentPresets.draft}
                    editing={withdrawPercentPresets.editing}
                    presets={withdrawPercentPresets.presets}
                    setDraft={withdrawPercentPresets.setDraft}
                    tone="rose"
                    onConfirmEdit={withdrawPercentPresets.confirmEdit}
                    onPick={(pct) => {
                      if (maxWithdrawSol <= 0) return;
                      const sol = maxWithdrawSol * (pct / 100);

                      setWithdrawAmount(
                        Math.min(sol, maxWithdrawSol).toFixed(4),
                      );
                    }}
                    onStartEdit={withdrawPercentPresets.startEdit}
                  />
                </AmountShell>

                <button
                  className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={
                    isSubmitting ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    maxWithdrawSol <= 0
                  }
                  type="button"
                  onClick={handleWithdraw}
                >
                  {withdraw.isPending ? "…" : "WITHDRAW"}
                </button>
              </>
            )}
          </div>
        )}

        {isTrading && (
          <div className="space-y-3">
            <PairTabs
              active={tradeTab}
              leftId="buy"
              leftLabel="BUY"
              rightId="sell"
              rightLabel="SELL"
              onChange={(id) => setTradeTab(id as "buy" | "sell")}
            />

            <div className="flex justify-end text-[11px] text-zinc-500">
              <span>
                Balance:{" "}
                <span className="font-mono text-zinc-300">
                  {tradeTab === "buy"
                    ? `${availableSol.toFixed(4)} SOL`
                    : `${formatToken(tokenBalance)} ${tokenSymbol}`}
                </span>
              </span>
            </div>

            {tradeTab === "buy" && (
              <>
                <AmountShell
                  disabled={isSubmitting}
                  inputProps={{
                    min: 0,
                    placeholder: "Amount",
                    type: "number",
                    value: amount,
                    onChange: (e) =>
                      setAmount(sanitizeNonNegativeAmountInput(e.target.value)),
                  }}
                  trailing="SOL"
                >
                  <SegmentedSolPresets
                    showEditButton
                    disabled={isSubmitting}
                    draft={quickPresets.draft}
                    editing={quickPresets.editing}
                    presets={quickPresets.presets}
                    setDraft={quickPresets.setDraft}
                    tone="green"
                    onConfirmEdit={quickPresets.confirmEdit}
                    onPick={(sol) => setAmount(sol.toFixed(4))}
                    onStartEdit={quickPresets.startEdit}
                  />
                </AmountShell>

                <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                  <span className="min-w-0 truncate">
                    <span className="text-zinc-500">Slippage</span>
                    <span className="ml-1.5 font-mono text-zinc-300">
                      {formatSlippagePercent(slippageBps)}
                    </span>
                  </span>
                  <button
                    aria-label="Slippage settings"
                    className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                    type="button"
                    onClick={() => setShowSlippage((s) => !s)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                      />
                    </svg>
                  </button>
                </div>
                {showSlippage && (
                  <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-2 py-2">
                    <div className="flex flex-wrap gap-2">
                      {SLIPPAGE_PRESET_BPS.map((bps) => (
                        <button
                          key={bps}
                          className={`rounded-md px-2 py-1 font-mono text-[10px] transition-colors ${
                            slippageBps === bps &&
                            slippageMatchesPreset &&
                            !customSlippageOpen
                              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                              : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                          }`}
                          type="button"
                          onClick={() => selectSlippagePreset(bps)}
                        >
                          {(bps / 100).toFixed(0)}%
                        </button>
                      ))}
                      <button
                        className={`rounded-md px-2 py-1 font-mono text-[10px] transition-colors ${
                          customSlippageOpen || !slippageMatchesPreset
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                        }`}
                        type="button"
                        onClick={openCustomSlippage}
                      >
                        Custom
                      </button>
                    </div>
                    {customSlippageOpen && (
                      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-2">
                        <input
                          className="min-w-[4rem] flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
                          inputMode="decimal"
                          placeholder="1.0"
                          value={customSlippageDraft}
                          onChange={(e) =>
                            setCustomSlippageDraft(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") applyCustomSlippage();
                          }}
                        />
                        <span className="text-xs text-zinc-500">%</span>
                        <button
                          className="rounded-md bg-emerald-600/90 px-2 py-1 font-mono text-[10px] text-zinc-950 hover:bg-emerald-500"
                          type="button"
                          onClick={applyCustomSlippage}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                  type="button"
                  onClick={handleBuy}
                >
                  {buy.isPending ? "…" : "BUY"}
                </button>
              </>
            )}

            {tradeTab === "sell" && (
              <>
                <AmountShell
                  disabled={isSubmitting}
                  inputProps={{
                    max:
                      tokenBalanceHuman > 0 ? tokenBalanceHuman : undefined,
                    min: 0,
                    placeholder: "Amount",
                    type: "number",
                    value: sellTokenAmount,
                    onChange: (e) =>
                      setSellTokenAmount(
                        sanitizeNonNegativeAmountInput(e.target.value),
                      ),
                  }}
                  trailing={trenchMarketUnit}
                >
                  <SegmentedTokenPresets
                    percentLabels
                    showEditButton
                    disabled={isSubmitting || !hasToken}
                    draft={quickTokenPercentPresets.draft}
                    editing={quickTokenPercentPresets.editing}
                    presets={quickTokenPercentPresets.presets}
                    setDraft={quickTokenPercentPresets.setDraft}
                    tone="rose"
                    onConfirmEdit={quickTokenPercentPresets.confirmEdit}
                    onPick={(pct) => {
                      if (tokenBalanceHuman <= 0) return;
                      const qty = tokenBalanceHuman * (pct / 100);

                      setSellTokenAmount(
                        formatPresetLabel(Math.min(qty, tokenBalanceHuman)),
                      );
                    }}
                    onStartEdit={quickTokenPercentPresets.startEdit}
                  />
                </AmountShell>

                <button
                  className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={isSubmitting || !hasToken || !sellAmountSubmittable}
                  type="button"
                  onClick={handleSellSubmit}
                >
                  {sell.isPending ? "…" : "SELL"}
                </button>
              </>
            )}
          </div>
        )}
      </EvaCardContent>
    </EvaCard>
  );
}
