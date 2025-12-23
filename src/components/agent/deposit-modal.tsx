import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

import { EvaButton } from "@/components/ui";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositAddress: string;
  agentName?: string;
}

export function DepositModal({
  isOpen,
  onClose,
  depositAddress,
  agentName,
}: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if clipboard is not available
    }
  };

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
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold tracking-wider uppercase text-eva-text">
              TRANSFER CRYPTO
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

          {/* Content */}
          <div className="px-6 pb-6 space-y-6">
            {/* Token & Chain Selection */}
            <div className="flex gap-4">
              <div className="flex-1">
                <span className="block text-xs text-eva-text-dim uppercase tracking-wider mb-2">
                  SUPPORTED TOKEN
                </span>
                <div className="flex items-center gap-2 px-4 py-3 bg-eva-darker border border-eva-border rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                  <span className="text-eva-text font-mono">SOL</span>
                  <svg
                    className="w-4 h-4 ml-auto text-eva-text-dim"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                    SUPPORTED CHAIN
                  </span>
                  <span className="text-xs text-eva-text-dim">Min 0.1</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-eva-darker border border-eva-border rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
                  <span className="text-eva-text font-mono">Solana</span>
                  <svg
                    className="w-4 h-4 ml-auto text-eva-text-dim"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border-2 border-dashed border-eva-border">
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  size={160}
                  value={depositAddress}
                />
              </div>
            </div>

            {/* Deposit Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                  YOUR DEPOSIT ADDRESS
                </span>
                <span className="text-xs text-eva-text-dim">Terms apply</span>
              </div>
              <div className="px-4 py-3 bg-eva-darker border border-eva-border rounded-lg font-mono text-sm text-eva-text-dim break-all">
                {depositAddress}
              </div>
            </div>

            {/* Copy Button */}
            <EvaButton
              className="w-full"
              variant="primary"
              onClick={handleCopyAddress}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              {copied ? "COPIED!" : "COPY ADDRESS"}
            </EvaButton>

            {/* Info Section */}
            <div className="space-y-2 p-4 bg-eva-darker rounded-lg border border-eva-border">
              <div className="flex items-center gap-2 text-xs">
                <svg
                  className="w-4 h-4 text-eva-text-dim"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-eva-text-dim">PROCESSING TIME:</span>
                <span className="text-eva-text font-mono">~30 SEC</span>
              </div>
              {agentName && (
                <div className="flex items-center gap-2 text-xs">
                  <svg
                    className="w-4 h-4 text-eva-text-dim"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="text-eva-text-dim">AGENT:</span>
                  <span className="text-eva-text font-mono">{agentName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <svg
                  className="w-4 h-4 text-eva-text-dim"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-eva-text-dim">HAVE QUESTIONS?</span>
                <span className="text-eva-primary font-mono">GET HELP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

export default DepositModal;
