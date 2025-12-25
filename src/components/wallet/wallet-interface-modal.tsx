import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { useDisconnect } from "@particle-network/connectkit";

import { EvaButton } from "@/components/ui";
import { DepositModal, WithdrawModal } from "@/components/agent";
import { useAgentPanel, useMyAgents, useAgentWithdraw } from "@/hooks";

interface WalletInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function WalletInterfaceModal({
  isOpen,
  onClose,
  address,
}: WalletInterfaceModalProps) {
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch user's agent data
  const { data: agentsData } = useMyAgents();
  const primaryAgent = agentsData?.agents?.[0];

  // Fetch agent panel data for balance
  const { data: panelData, refetch: refetchPanel } = useAgentPanel(
    primaryAgent?.id,
  );

  // Withdraw mutation
  const withdrawMutation = useAgentWithdraw();

  if (!isOpen) return null;

  const balance = panelData?.currentBalance ?? 0;
  const turnkeyAddress = primaryAgent?.turnkeyAddress ?? "";

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(turnkeyAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const shortenAddress = (addr: string) => {
    if (addr.length <= 12) return addr;

    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
          className="bg-eva-card border border-eva-border rounded-xl shadow-2xl pointer-events-auto animate-slide-up w-full max-w-md"
          role="dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div /> {/* Spacer */}
            <h2 className="text-lg font-semibold tracking-wider uppercase text-eva-text">
              WALLET_INTERFACE
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
          <div className="px-6 pb-6 space-y-4">
            {/* Balance Card */}
            <div className="p-4 bg-eva-darker rounded-lg border border-eva-border">
              <div className="text-xs text-eva-text-dim uppercase tracking-wider mb-2">
                Total Balance
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-eva-text font-mono">
                  {balance.toFixed(2)}
                </span>
                <span className="text-lg text-eva-text-dim">SOL</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-eva-text-dim font-mono">
                    {shortenAddress(turnkeyAddress)}
                  </span>
                  <button
                    className="p-1 text-eva-text-dim hover:text-eva-primary transition-colors"
                    title="Copy address"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-eva-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
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
                    )}
                  </button>
                </div>
                <button
                  className="flex items-center gap-1 text-sm text-eva-danger hover:text-red-400 transition-colors font-mono"
                  onClick={handleDisconnect}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  DISCONNECT
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <EvaButton
                className="flex-1"
                variant="outline"
                onClick={() => setIsWithdrawModalOpen(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
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
              </EvaButton>
              <EvaButton
                className="flex-1"
                variant="primary"
                onClick={() => setIsDepositModalOpen(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                DEPOSIT
              </EvaButton>
            </div>

            {/* View Transactions Link */}
            <div className="text-center">
              <button className="text-sm text-eva-text-dim hover:text-eva-primary transition-colors font-mono">
                {"[ VIEW_TRANSACTIONS ]"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {turnkeyAddress && (
        <DepositModal
          agentName={primaryAgent?.name}
          depositAddress={turnkeyAddress}
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}

      {/* Withdraw Modal */}
      {primaryAgent && (
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          isWithdrawing={withdrawMutation.isPending}
          maxBalance={balance}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdraw={async (amount, recipientAddress) => {
            await withdrawMutation.mutateAsync({
              id: primaryAgent.id,
              data: { amount, toAddress: recipientAddress },
            });
            refetchPanel();
          }}
        />
      )}
    </Fragment>,
    document.body,
  );
}

export default WalletInterfaceModal;
