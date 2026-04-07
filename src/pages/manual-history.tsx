import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import { useManualHistory } from "@/hooks/use-manual-trade";
import { ExportStrategyModal } from "@/components/manual/export-strategy-modal";
import { EvaCard, EvaCardContent } from "@/components/ui/eva-card";
import { EvaButton } from "@/components/ui/eva-button";
import { useIsAuthenticated } from "@/hooks/use-auth";

const TX_TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAW", label: "Withdraw" },
  { value: "BUY", label: "Buy" },
  { value: "SELL", label: "Sell" },
] as const;

const TX_TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "text-blue-400",
  WITHDRAW: "text-orange-400",
  BUY: "text-eva-success",
  SELL: "text-eva-danger",
};

export default function ManualHistoryPage() {
  const [page, setPage] = useState(1);
  const [txType, setTxType] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { isAuthenticated } = useIsAuthenticated();

  const { data, isLoading } = useManualHistory({
    page,
    limit: 20,
    txType: txType || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <DefaultLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-mono text-eva-text uppercase tracking-wider">
            Trading History
          </h1>

          {isAuthenticated && (
            <button
              className="text-xs font-mono text-eva-text-dim hover:text-eva-primary border border-eva-border/30 hover:border-eva-primary/50 rounded px-3 py-2 transition-colors"
              onClick={() => setIsExportOpen(true)}
            >
              EXPORT STRATEGY TO AGENT
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {TX_TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                txType === f.value
                  ? "border-eva-primary bg-eva-primary/20 text-eva-primary"
                  : "border-eva-border/30 text-eva-text-dim hover:text-eva-text"
              }`}
              onClick={() => {
                setTxType(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <EvaCard>
          <EvaCardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !data || data.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-eva-text-dim text-sm font-mono">
                  No manual trades yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-eva-border/30">
                      <th className="text-left px-4 py-3 text-eva-text-dim font-medium">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-eva-text-dim font-medium">
                        Trench
                      </th>
                      <th className="text-right px-4 py-3 text-eva-text-dim font-medium">
                        SOL
                      </th>
                      <th className="text-right px-4 py-3 text-eva-text-dim font-medium">
                        Token
                      </th>
                      <th className="text-right px-4 py-3 text-eva-text-dim font-medium">
                        Time
                      </th>
                      <th className="text-right px-4 py-3 text-eva-text-dim font-medium">
                        Tx
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-eva-border/10 hover:bg-eva-dark/30"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={
                              TX_TYPE_COLORS[tx.txType] || "text-eva-text"
                            }
                          >
                            {tx.txType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-eva-text-dim">
                          #{tx.trenchId}
                        </td>
                        <td className="px-4 py-3 text-right text-eva-text">
                          {tx.solAmount
                            ? (parseInt(tx.solAmount) / 1e9).toFixed(4)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-eva-text">
                          {tx.tokenAmount
                            ? (parseInt(tx.tokenAmount) / 1e6).toFixed(2)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-eva-text-dim">
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            className="text-eva-primary hover:underline"
                            href={`https://solscan.io/tx/${tx.signature}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {data && data.total > data.limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-eva-border/30">
                <span className="text-xs text-eva-text-dim">
                  {data.total} total trades
                </span>
                <div className="flex gap-2">
                  <EvaButton
                    disabled={page <= 1}
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </EvaButton>
                  <span className="text-xs text-eva-text-dim flex items-center px-2">
                    {page} / {totalPages}
                  </span>
                  <EvaButton
                    disabled={page >= totalPages}
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </EvaButton>
                </div>
              </div>
            )}
          </EvaCardContent>
        </EvaCard>
      </div>

      <ExportStrategyModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </DefaultLayout>
  );
}
