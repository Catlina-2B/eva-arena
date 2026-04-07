import { useState } from "react";
import { addToast } from "@heroui/toast";

import { useExportStrategy } from "@/hooks/use-manual-trade";
import { EvaButton } from "@/components/ui/eva-button";
import { EvaModal } from "@/components/ui/eva-modal";

interface ExportStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportStrategyModal({
  isOpen,
  onClose,
}: ExportStrategyModalProps) {
  const exportStrategy = useExportStrategy();
  const [result, setResult] = useState<{
    bettingStrategyPrompt: string;
    tradingStrategyPrompt: string;
    stats: {
      totalTrades: number;
      totalTrenches: number;
      winRate: number;
      avgPnlSol: string;
      tradingPatterns: string[];
    };
  } | null>(null);

  const handleExport = async () => {
    try {
      const data = await exportStrategy.mutateAsync(10);
      setResult(data);
    } catch (err: any) {
      addToast({
        title: "Export failed",
        description: err?.message || "Failed to analyze trading history",
        color: "danger",
      });
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: `${label} copied`,
      description: "Strategy prompt copied to clipboard",
      color: "success",
    });
  };

  return (
    <EvaModal isOpen={isOpen} title="Export Trading Strategy" onClose={onClose}>
      <div className="space-y-4 p-4">
        {!result ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-eva-text-dim">
              Analyze your manual trading history and generate strategy prompts
              that can be used with an AI agent.
            </p>
            <EvaButton
              className="w-full"
              isLoading={exportStrategy.isPending}
              onClick={handleExport}
            >
              ANALYZE MY TRADES
            </EvaButton>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-eva-dark/50 rounded p-2">
                <div className="text-[10px] text-eva-text-dim">Rounds</div>
                <div className="text-sm font-mono text-eva-text">
                  {result.stats.totalTrenches}
                </div>
              </div>
              <div className="bg-eva-dark/50 rounded p-2">
                <div className="text-[10px] text-eva-text-dim">Trades</div>
                <div className="text-sm font-mono text-eva-text">
                  {result.stats.totalTrades}
                </div>
              </div>
              <div className="bg-eva-dark/50 rounded p-2">
                <div className="text-[10px] text-eva-text-dim">Win Rate</div>
                <div className="text-sm font-mono text-eva-text">
                  {result.stats.winRate}%
                </div>
              </div>
              <div className="bg-eva-dark/50 rounded p-2">
                <div className="text-[10px] text-eva-text-dim">
                  Avg PnL
                </div>
                <div className="text-sm font-mono text-eva-text">
                  {(parseInt(result.stats.avgPnlSol) / 1e9).toFixed(4)} SOL
                </div>
              </div>
            </div>

            {/* Patterns */}
            {result.stats.tradingPatterns.length > 0 && (
              <div>
                <div className="text-xs text-eva-text-dim mb-1">
                  Detected Patterns
                </div>
                <ul className="space-y-1">
                  {result.stats.tradingPatterns.map((p, i) => (
                    <li
                      key={i}
                      className="text-xs text-eva-text flex items-start gap-1"
                    >
                      <span className="text-eva-primary">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Betting Strategy */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-eva-text-dim">
                  Betting Strategy
                </span>
                <button
                  className="text-[10px] text-eva-primary hover:underline"
                  onClick={() =>
                    handleCopy(result.bettingStrategyPrompt, "Betting strategy")
                  }
                >
                  Copy
                </button>
              </div>
              <pre className="text-xs text-eva-text bg-eva-dark/50 rounded p-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {result.bettingStrategyPrompt}
              </pre>
            </div>

            {/* Trading Strategy */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-eva-text-dim">
                  Trading Strategy
                </span>
                <button
                  className="text-[10px] text-eva-primary hover:underline"
                  onClick={() =>
                    handleCopy(
                      result.tradingStrategyPrompt,
                      "Trading strategy",
                    )
                  }
                >
                  Copy
                </button>
              </div>
              <pre className="text-xs text-eva-text bg-eva-dark/50 rounded p-2 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {result.tradingStrategyPrompt}
              </pre>
            </div>

            <EvaButton
              className="w-full"
              variant="outline"
              onClick={() => {
                setResult(null);
                onClose();
              }}
            >
              CLOSE
            </EvaButton>
          </div>
        )}
      </div>
    </EvaModal>
  );
}
