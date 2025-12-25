import type { AgentDetailDto, UpdateAgentDto } from "@/types/api";

import { Fragment, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// Avatar item component with skeleton loading
function AvatarItem({
  url,
  index,
  isSelected,
  onSelect,
}: {
  url: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <button
      className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-eva-primary ring-offset-2 ring-offset-eva-card scale-105"
          : "hover:scale-105 hover:ring-1 hover:ring-eva-border"
      }`}
      title={`Avatar ${index + 1}`}
      type="button"
      onClick={onSelect}
    >
      {!isLoaded && (
        <div className="w-full h-full bg-eva-border/50 animate-pulse" />
      )}
      <img
        alt={`Avatar ${index + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0 absolute"}`}
        src={url}
        onLoad={handleLoad}
      />
    </button>
  );
}

import { useAgentLogos, useUpdateAgent } from "@/hooks/use-agents";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentDetailDto | null;
  onSuccess?: () => void;
}

export function EditAgentModal({
  isOpen,
  onClose,
  agent,
  onSuccess,
}: EditAgentModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [bettingStrategyPrompt, setBettingStrategyPrompt] = useState("");
  const [tradingStrategyPrompt, setTradingStrategyPrompt] = useState("");

  // Fetch logos
  const { data: logosData, isLoading: isLoadingLogos } = useAgentLogos();

  // Update mutation
  const updateMutation = useUpdateAgent();

  // Initialize form with agent data
  useEffect(() => {
    if (agent && isOpen) {
      setName(agent.name || "");
      setSelectedLogo(agent.logo || null);
      setBettingStrategyPrompt(agent.bettingStrategyPrompt || "");
      setTradingStrategyPrompt(agent.tradingStrategyPrompt || "");
    }
  }, [agent, isOpen]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      updateMutation.reset();
    }
  }, [isOpen]);

  if (!isOpen || !agent) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const updateData: UpdateAgentDto = {};

    // Only include changed fields
    if (name.trim() !== agent.name) {
      updateData.name = name.trim();
    }
    if (selectedLogo && selectedLogo !== agent.logo) {
      updateData.logo = selectedLogo;
    }
    if (bettingStrategyPrompt !== agent.bettingStrategyPrompt) {
      updateData.bettingStrategyPrompt = bettingStrategyPrompt;
    }
    if (tradingStrategyPrompt !== agent.tradingStrategyPrompt) {
      updateData.tradingStrategyPrompt = tradingStrategyPrompt;
    }

    // Skip if no changes
    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: agent.id, data: updateData });
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  const isFormValid = name.trim().length > 0 && name.trim().length <= 20;
  const isSubmitting = updateMutation.isPending;

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
          className="bg-eva-card border border-eva-border rounded-xl shadow-2xl pointer-events-auto animate-slide-up w-full max-w-lg max-h-[90vh] overflow-y-auto"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-eva-border/50">
            <h2 className="text-sm font-mono tracking-wider text-eva-primary">
              /// EDIT_AGENT
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg text-eva-primary hover:bg-eva-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid || isSubmitting}
                title="Save changes"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
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
                )}
              </button>
              <button
                className="p-2 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors"
                title="Close"
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
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Agent Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-eva-text-dim uppercase tracking-widest">
                  Agent Name
                </label>
                <span className="text-xs font-mono text-eva-muted uppercase tracking-wider">
                  [REQUIRED]
                </span>
              </div>
              <input
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors"
                maxLength={20}
                placeholder="Enter agent name..."
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="text-xs font-mono text-eva-muted mt-1 block">
                {name.length}/20 characters
              </span>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-3">
                Select Avatar
              </label>
              {isLoadingLogos ? (
                <div className="grid grid-cols-7 gap-2">
                  {/* Skeleton placeholders */}
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="w-12 h-12 rounded-lg bg-eva-border/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {logosData?.map((url, index) => (
                    <AvatarItem
                      key={`avatar-${index}`}
                      index={index}
                      isSelected={selectedLogo === url}
                      url={url}
                      onSelect={() => setSelectedLogo(url)}
                    />
                  ))}
                  {/* Custom upload placeholder */}
                  <button
                    className="w-12 h-12 rounded-lg border-2 border-dashed border-eva-border flex items-center justify-center text-eva-text-dim hover:border-eva-primary hover:text-eva-primary transition-colors"
                    title="Upload custom avatar (coming soon)"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 4v16m8-8H4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Betting Strategy Prompt - Betting Phase */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-1">
                Betting Phase Strategy
              </label>
              <p className="text-xs text-eva-muted mb-2">
                Strategy for bidding phase (Block 0-300)
              </p>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-28 text-sm"
                placeholder="Describe your betting phase strategy..."
                value={bettingStrategyPrompt}
                onChange={(e) => setBettingStrategyPrompt(e.target.value)}
              />
            </div>

            {/* Trading Strategy Prompt - Trading Phase */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-1">
                Trading Phase Strategy
              </label>
              <p className="text-xs text-eva-muted mb-2">
                Strategy for trading phase (Block 300-2700)
              </p>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-28 text-sm"
                placeholder="Describe your trading phase strategy..."
                value={tradingStrategyPrompt}
                onChange={(e) => setTradingStrategyPrompt(e.target.value)}
              />
            </div>

            {/* Notice */}
            <div className="text-center py-2 border-t border-eva-border/50">
              <p className="text-xs font-mono text-eva-muted uppercase tracking-wider leading-relaxed">
                Changes will apply in the next round. Currently
                <br />
                active strategies cannot be modified mid-round.
              </p>
            </div>

            {/* Error Message */}
            {updateMutation.isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <span className="text-sm font-mono text-red-400">
                  Failed to update agent. Please try again.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

export default EditAgentModal;

