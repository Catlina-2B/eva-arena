import { useState, useCallback, useMemo } from "react";
import { addToast } from "@heroui/toast";

import {
  useManualDeposit,
  useManualWithdraw,
  useManualBuy,
  useManualSell,
} from "@/hooks/use-manual-trade";
import { useUserPnlTimeline } from "@/hooks";
import { EvaCard, EvaCardContent } from "@/components/ui/eva-card";
import { EvaButton } from "@/components/ui/eva-button";
import { useTurnkeyBalanceStore } from "@/stores/turnkey-balance";
import type { TrenchDetailDto } from "@/types/api";

const LAMPORTS_PER_SOL = 1_000_000_000;
const QUICK_PERCENTS = [25, 50, 75, 100] as const;

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

interface ManualTradingPanelProps {
  trenchData?: TrenchDetailDto | null;
}

export function ManualTradingPanel({ trenchData }: ManualTradingPanelProps) {
  const { balance: turnkeyBalance } = useTurnkeyBalanceStore();

  const deposit = useManualDeposit();
  const withdraw = useManualWithdraw();
  const buy = useManualBuy();
  const sell = useManualSell();

  const [amount, setAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(500);
  const [showSlippage, setShowSlippage] = useState(false);

  const phase = useMemo(() => {
    if (!trenchData) return "bidding";
    if (trenchData.status === "BIDDING") return "bidding";
    if (trenchData.status === "TRADING") return "trading";
    return "settlement";
  }, [trenchData]);

  const isBidding = phase === "bidding";
  const isTrading = phase === "trading";
  const isSettlement = phase === "settlement";
  const isSubmitting =
    deposit.isPending || withdraw.isPending || buy.isPending || sell.isPending;

  const availableSol = turnkeyBalance;

  const { data: pnlTimeline } = useUserPnlTimeline();

  const tokenBalance = trenchData?.tokenBalance ?? "0";
  const roundPnlRaw = trenchData?.pnlSol ?? "0";
  const roundPnl = parseInt(roundPnlRaw) / LAMPORTS_PER_SOL;

  const totalPnl = useMemo(() => {
    if (!pnlTimeline?.timeline?.length) return 0;
    const last = pnlTimeline.timeline[pnlTimeline.timeline.length - 1];
    return parseInt(last.pnl) / LAMPORTS_PER_SOL;
  }, [pnlTimeline]);

  const handleQuickPercent = useCallback(
    (pct: number) => {
      if (isBidding || isTrading) {
        const maxSol = Math.max(0, availableSol - 0.015);
        setAmount(((maxSol * pct) / 100).toFixed(4));
      }
    },
    [isBidding, isTrading, availableSol],
  );

  const handleDeposit = useCallback(async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    try {
      const result = await deposit.mutateAsync(val);
      if (result.success) {
        addToast({
          title: "Deposit successful",
          description: `Deposited ${val} SOL`,
          color: "success",
        });
        setAmount("");
      }
    } catch (err: any) {
      addToast({
        title: "Deposit failed",
        description: err?.message || "Unknown error",
        color: "danger",
      });
    }
  }, [amount, deposit]);

  const handleWithdraw = useCallback(async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    try {
      const result = await withdraw.mutateAsync(val);
      if (result.success) {
        addToast({
          title: "Withdraw successful",
          description: `Withdrew ${val} SOL`,
          color: "success",
        });
        setAmount("");
      }
    } catch (err: any) {
      addToast({
        title: "Withdraw failed",
        description: err?.message || "Unknown error",
        color: "danger",
      });
    }
  }, [amount, withdraw]);

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

  const handleSell = useCallback(
    async (sellAmount: string) => {
      try {
        const result = await sell.mutateAsync(sellAmount);
        if (result.success) {
          addToast({
            title: "Sell successful",
            description: `Sold ${sellAmount} tokens`,
            color: "success",
          });
          setAmount("");
        }
      } catch (err: any) {
        addToast({
          title: "Sell failed",
          description: err?.message || "Unknown error",
          color: "danger",
        });
      }
    },
    [sell],
  );

  return (
    <EvaCard>
      <EvaCardContent className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
            Manual Trading
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-eva-primary/20 text-eva-primary rounded">
            {phase.toUpperCase()}
          </span>
        </div>

        {/* Balance & PnL Stats */}
        <div className="bg-eva-dark/50 border border-eva-border rounded-lg p-3">
          {/* Token + SOL Row */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-eva-border/50">
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {formatToken(tokenBalance)}
              </span>
              <span className="text-[10px] text-eva-text-dim uppercase">
                TOKEN
              </span>
              <span className="text-xs font-mono text-purple-400 ml-1">
                ({formatTokenPercent(tokenBalance)}%)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {availableSol.toFixed(4)}
              </span>
              <span className="text-[10px] text-eva-text-dim uppercase">
                SOL
              </span>
            </div>
          </div>

          {/* PnL Row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1">
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
              <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1 text-right">
                Round PNL
              </div>
              <div
                className={`font-mono text-xl font-semibold text-right ${
                  roundPnl >= 0 ? "text-eva-primary" : "text-eva-danger"
                }`}
              >
                {roundPnl >= 0 ? "+" : ""}
                {roundPnl.toFixed(4)} SOL
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-eva-border/30" />

        {/* Settlement - disabled state */}
        {isSettlement && (
          <div className="text-center py-6">
            <p className="text-eva-text-dim text-xs font-mono">
              ROUND SETTLING
            </p>
            <p className="text-eva-text-dim text-[10px] mt-1">
              Trading is disabled during settlement
            </p>
          </div>
        )}

        {/* Bidding Phase Controls */}
        {isBidding && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-eva-text-dim mb-1 block">
                Amount (SOL)
              </label>
              <input
                className="w-full bg-eva-dark/50 border border-eva-border/30 rounded px-3 py-2 text-sm font-mono text-eva-text focus:border-eva-primary focus:outline-none"
                disabled={isSubmitting}
                placeholder="0.0"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Quick percent buttons */}
            <div className="flex gap-2">
              {QUICK_PERCENTS.map((pct) => (
                <button
                  key={pct}
                  className="flex-1 text-[10px] font-mono py-1 bg-eva-dark/50 border border-eva-border/30 rounded text-eva-text-dim hover:text-eva-text hover:border-eva-primary/50 transition-colors"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPercent(pct)}
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <EvaButton
                className="w-full"
                disabled={
                  isSubmitting || !amount || parseFloat(amount) <= 0
                }
                isLoading={deposit.isPending}
                size="sm"
                onClick={handleDeposit}
              >
                DEPOSIT
              </EvaButton>
              <EvaButton
                className="w-full"
                disabled={
                  isSubmitting || !amount || parseFloat(amount) <= 0
                }
                isLoading={withdraw.isPending}
                size="sm"
                variant="outline"
                onClick={handleWithdraw}
              >
                WITHDRAW
              </EvaButton>
            </div>
          </div>
        )}

        {/* Trading Phase Controls */}
        {isTrading && (
          <div className="space-y-3">
            {/* Buy Section */}
            <div>
              <label className="text-xs text-eva-text-dim mb-1 block">
                Buy Amount (SOL)
              </label>
              <input
                className="w-full bg-eva-dark/50 border border-eva-border/30 rounded px-3 py-2 text-sm font-mono text-eva-text focus:border-eva-primary focus:outline-none"
                disabled={isSubmitting}
                placeholder="0.0"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Quick percent buttons */}
            <div className="flex gap-2">
              {QUICK_PERCENTS.map((pct) => (
                <button
                  key={pct}
                  className="flex-1 text-[10px] font-mono py-1 bg-eva-dark/50 border border-eva-border/30 rounded text-eva-text-dim hover:text-eva-text hover:border-eva-primary/50 transition-colors"
                  disabled={isSubmitting}
                  onClick={() => handleQuickPercent(pct)}
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>

            {/* Slippage toggle */}
            <div>
              <button
                className="text-[10px] text-eva-text-dim hover:text-eva-text transition-colors"
                onClick={() => setShowSlippage(!showSlippage)}
              >
                Slippage: {(slippageBps / 100).toFixed(1)}%{" "}
                {showSlippage ? "▲" : "▼"}
              </button>
              {showSlippage && (
                <div className="flex gap-2 mt-1">
                  {[100, 300, 500, 1000].map((bps) => (
                    <button
                      key={bps}
                      className={`flex-1 text-[10px] font-mono py-1 rounded border transition-colors ${
                        slippageBps === bps
                          ? "border-eva-primary bg-eva-primary/20 text-eva-primary"
                          : "border-eva-border/30 text-eva-text-dim hover:text-eva-text"
                      }`}
                      onClick={() => setSlippageBps(bps)}
                    >
                      {(bps / 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            <EvaButton
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              isLoading={buy.isPending}
              size="sm"
              variant="ghost"
              onClick={handleBuy}
            >
              BUY
            </EvaButton>

            {/* Sell Section */}
            <div className="border-t border-eva-border/30 pt-3">
              <label className="text-xs text-eva-text-dim mb-2 block">
                Sell Tokens
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75].map((pct) => (
                  <EvaButton
                    key={pct}
                    className="w-full border-red-500/50 text-red-400 hover:border-red-500 hover:text-red-300"
                    disabled={
                      isSubmitting ||
                      parseInt(tokenBalance) <= 0
                    }
                    isLoading={sell.isPending}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSell(`${pct}%`)}
                  >
                    {pct}%
                  </EvaButton>
                ))}
                <EvaButton
                  className="w-full"
                  disabled={
                    isSubmitting ||
                    parseInt(tokenBalance) <= 0
                  }
                  isLoading={sell.isPending}
                  size="sm"
                  variant="danger"
                  onClick={() => handleSell("MAX")}
                >
                  MAX
                </EvaButton>
              </div>
            </div>
          </div>
        )}
      </EvaCardContent>
    </EvaCard>
  );
}
