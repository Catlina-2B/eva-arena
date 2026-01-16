import { Fragment, useState, useCallback } from "react";
import { createPortal } from "react-dom";

import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import {
  WalletTransactionType,
  WalletTransactionStatus,
} from "@/services/api/wallet";

interface TransactionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Solana explorer URL for transaction
const SOLANA_EXPLORER_URL = "https://solscan.io/tx";

// Transaction type color styles (matching Figma design)
const typeStyles: Record<WalletTransactionType, string> = {
  [WalletTransactionType.DEPOSIT]: "text-[#6CE182]", // Green
  [WalletTransactionType.WITHDRAW]: "text-[#F472B6]", // Pink
};

// Status badge styles (matching Figma design)
const statusStyles: Record<WalletTransactionStatus, string> = {
  [WalletTransactionStatus.SUCCESS]:
    "border border-[#6CE182] text-[#6CE182] bg-transparent",
  [WalletTransactionStatus.PENDING]:
    "border border-[#F59E0B] text-[#F59E0B] bg-transparent",
  [WalletTransactionStatus.FAILED]:
    "border border-[#EF4444] text-[#EF4444] bg-transparent",
};

// Shorten signature for display: 0x{first4}...{last3}
function shortenSignature(signature: string): string {
  if (signature.length <= 10) return signature;
  // Display as 0x format as per Figma design
  return `0x${signature.slice(0, 2)}...${signature.slice(-3)}`;
}

export function TransactionLogModal({
  isOpen,
  onClose,
}: TransactionLogModalProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useWalletTransactions({
    page,
    limit,
  });

  const handleExportCsv = useCallback(() => {
    if (!data?.transactions || data.transactions.length === 0) return;

    // Create CSV content
    const headers = ["Type", "Hash", "Time", "Amount", "Status"];
    const rows = data.transactions.map((tx) => [
      tx.type,
      tx.signature,
      tx.timeAgo,
      `${tx.amount} SOL`,
      tx.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [data]);

  if (!isOpen) return null;

  const transactions = data?.transactions ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
        <div
          aria-modal="true"
          className="bg-eva-card border border-eva-border rounded-xl shadow-2xl pointer-events-auto animate-slide-up w-full max-w-2xl max-h-[80vh] flex flex-col"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-eva-border">
            <div /> {/* Spacer for centering */}
            <h2 className="text-lg font-semibold tracking-wider uppercase text-eva-text font-mono">
              TRANSACTION_LOG
            </h2>
            <button
              className="p-1 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[100px_140px_100px_1fr_90px] gap-2 px-6 py-3 bg-eva-darker border-b border-eva-border sticky top-0">
              <div className="text-xs text-eva-text-dim uppercase tracking-wider font-mono">
                TYPE
              </div>
              <div className="text-xs text-eva-text-dim uppercase tracking-wider font-mono">
                HASH / ID
              </div>
              <div className="text-xs text-eva-text-dim uppercase tracking-wider font-mono">
                TIME
              </div>
              <div className="text-xs text-eva-text-dim uppercase tracking-wider font-mono text-right">
                AMOUNT
              </div>
              <div className="text-xs text-eva-text-dim uppercase tracking-wider font-mono text-center">
                STATUS
              </div>
            </div>

            {/* Table Body */}
            <div className="px-6">
              {isLoading ? (
                // Loading skeleton
                <div className="py-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[100px_140px_100px_1fr_90px] gap-2 animate-pulse"
                    >
                      <div className="h-4 bg-eva-border rounded" />
                      <div className="h-4 bg-eva-border rounded" />
                      <div className="h-4 bg-eva-border rounded" />
                      <div className="h-4 bg-eva-border rounded" />
                      <div className="h-4 bg-eva-border rounded" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                // Error state
                <div className="py-12 text-center text-eva-danger font-mono">
                  Failed to load transactions
                </div>
              ) : transactions.length === 0 ? (
                // Empty state
                <div className="py-12 text-center text-eva-text-dim font-mono">
                  No transactions found
                </div>
              ) : (
                // Transaction rows
                <div className="divide-y divide-eva-border">
                  {transactions.map((tx, index) => (
                    <div
                      key={`${tx.signature}-${index}`}
                      className="grid grid-cols-[100px_140px_100px_1fr_90px] gap-2 py-3 items-center"
                    >
                      {/* TYPE */}
                      <div
                        className={`text-sm font-semibold font-mono ${typeStyles[tx.type]}`}
                      >
                        {tx.type}
                      </div>

                      {/* HASH / ID */}
                      <a
                        href={`${SOLANA_EXPLORER_URL}/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-mono text-eva-text-dim hover:text-eva-text transition-colors"
                      >
                        <span>{shortenSignature(tx.signature)}</span>
                        {/* External link icon */}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </a>

                      {/* TIME */}
                      <div className="text-sm font-mono text-eva-text-dim">
                        {tx.timeAgo}
                      </div>

                      {/* AMOUNT */}
                      <div className="text-sm font-mono text-eva-text text-right">
                        {tx.amount} SOL
                      </div>

                      {/* STATUS */}
                      <div className="flex justify-center">
                        <span
                          className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${statusStyles[tx.status]}`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-eva-border">
            {/* Total Records */}
            <div className="text-sm font-mono text-eva-text-dim">
              Total_Records: {totalRecords}
            </div>

            {/* Export CSV Button */}
            <button
              className="flex items-center gap-2 text-sm font-mono text-eva-primary hover:text-eva-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={transactions.length === 0}
              onClick={handleExportCsv}
            >
              {/* Download icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              EXPORT_CSV
            </button>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body
  );
}

export default TransactionLogModal;
