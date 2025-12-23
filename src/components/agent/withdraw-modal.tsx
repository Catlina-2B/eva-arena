import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import { EvaButton } from "@/components/ui";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxBalance: number;
  onWithdraw: (amount: number, recipientAddress: string) => Promise<void>;
  isWithdrawing?: boolean;
}

export function WithdrawModal({
  isOpen,
  onClose,
  maxBalance,
  onWithdraw,
  isWithdrawing = false,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxBalance.toFixed(4));
    setError(null);
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);

    // Validation
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");

      return;
    }

    if (amountNum > maxBalance) {
      setError("Amount exceeds available balance");

      return;
    }

    if (!recipientAddress || recipientAddress.length < 32) {
      setError("Please enter a valid Solana address");

      return;
    }

    try {
      setError(null);
      await onWithdraw(amountNum, recipientAddress);
      // Reset form on success
      setAmount("");
      setRecipientAddress("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    }
  };

  const networkFee = 0.01; // Estimated network fee in SOL

  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
        <div
          aria-modal="true"
          className="bg-eva-card border border-eva-border rounded-xl shadow-2xl pointer-events-auto animate-slide-up w-full max-w-md"
          role="dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div /> {/* Spacer */}
            <h2 className="text-lg font-semibold tracking-wider uppercase text-eva-text">
              WITHDRAW_FUNDS
            </h2>
            <button
              className="p-1 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors"
              disabled={isWithdrawing}
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

          {/* Content */}
          <div className="px-6 pb-6 space-y-4">
            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                  AMOUNT
                </span>
                <button
                  className="text-xs text-eva-primary font-mono hover:underline"
                  onClick={handleMaxClick}
                >
                  MAX: {maxBalance.toFixed(2)} SOL
                </button>
              </div>
              <div className="relative">
                <input
                  className={clsx(
                    "w-full px-4 py-3 bg-eva-darker border rounded-lg font-mono text-eva-text placeholder-eva-text-dim focus:outline-none focus:border-eva-primary transition-colors",
                    error ? "border-eva-danger" : "border-eva-border",
                  )}
                  disabled={isWithdrawing}
                  placeholder="0.00"
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-eva-text-dim font-mono">
                  SOL
                </span>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <span className="block text-xs text-eva-text-dim uppercase tracking-wider mb-2">
                RECIPIENT_ADDRESS
              </span>
              <input
                className={clsx(
                  "w-full px-4 py-3 bg-eva-darker border rounded-lg font-mono text-sm text-eva-text placeholder-eva-text-dim focus:outline-none focus:border-eva-primary transition-colors",
                  error && !recipientAddress
                    ? "border-eva-danger"
                    : "border-eva-border",
                )}
                disabled={isWithdrawing}
                placeholder="Solana Address..."
                type="text"
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {/* Network Info */}
            <div className="p-4 bg-eva-darker rounded-lg border border-eva-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                  NETWORK
                </span>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-eva-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  <span className="text-eva-text font-mono">SOLANA</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                  NETWORK FEE
                </span>
                <span className="text-eva-text font-mono">
                  {networkFee} SOL
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-eva-danger/10 border border-eva-danger/30 rounded-lg">
                <p className="text-sm text-eva-danger">{error}</p>
              </div>
            )}

            {/* Withdraw Button */}
            <EvaButton
              className="w-full"
              disabled={isWithdrawing || !amount || !recipientAddress}
              variant="primary"
              onClick={handleSubmit}
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  WITHDRAWING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  WITHDRAW
                </span>
              )}
            </EvaButton>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

export default WithdrawModal;
