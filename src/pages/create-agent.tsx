import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { EvaButton } from "@/components/ui";
import {
  useAgentLogos,
  useCreateAgent,
  usePromptTemplate,
} from "@/hooks/use-agents";
import { useAuthStore } from "@/stores/auth";

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
          ? "ring-2 ring-eva-primary ring-offset-2 ring-offset-eva-dark scale-105"
          : "hover:scale-105 hover:ring-1 hover:ring-eva-border"
      }`}
      title={`Avatar ${index + 1}`}
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

// Default filter config for agent creation
const DEFAULT_FILTER_CONFIG = {
  progress: { min: 0, max: 100 },
};

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Fetch logos from backend
  const { data: logosData, isLoading: isLoadingLogos } = useAgentLogos();

  // Fetch prompt template from backend
  const { data: promptTemplateData, isLoading: isLoadingTemplate } =
    usePromptTemplate();

  // Create agent mutation
  const createAgentMutation = useCreateAgent();

  // Form state
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [bettingStrategy, setBettingStrategy] = useState("");
  const [tradingStrategy, setTradingStrategy] = useState("");
  const [hasUserEditedBetting, setHasUserEditedBetting] = useState(false);
  const [hasUserEditedTrading, setHasUserEditedTrading] = useState(false);

  // Pre-fill strategies with templates when loaded
  useEffect(() => {
    if (promptTemplateData?.bettingStrategyTemplate && !hasUserEditedBetting) {
      setBettingStrategy(promptTemplateData.bettingStrategyTemplate);
    }
    if (promptTemplateData?.tradingStrategyTemplate && !hasUserEditedTrading) {
      setTradingStrategy(promptTemplateData.tradingStrategyTemplate);
    }
  }, [promptTemplateData, hasUserEditedBetting, hasUserEditedTrading]);

  // Set default selected logo when data loads
  useMemo(() => {
    if (logosData && logosData.length > 0 && !selectedLogoUrl) {
      setSelectedLogoUrl(logosData[0]);
    }
  }, [logosData, selectedLogoUrl]);

  const handleCreateAgent = async () => {
    if (!agentName.trim() || !selectedLogoUrl || !bettingStrategy.trim() || !tradingStrategy.trim()) {
      return;
    }

    try {
      // TODO: Generate pdaAddress - this needs to be handled properly
      // For now, using a placeholder that should be replaced with actual PDA generation
      const pdaAddress = `pda_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await createAgentMutation.mutateAsync({
        name: agentName.trim(),
        logo: selectedLogoUrl,
        pdaAddress,
        bettingStrategyPrompt: bettingStrategy.trim(),
        tradingStrategyPrompt: tradingStrategy.trim(),
        filterConfig: DEFAULT_FILTER_CONFIG,
      });

      // Navigate to my-agent page on success
      navigate("/my-agent");
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const isFormValid =
    agentName.trim() && selectedLogoUrl && bettingStrategy.trim() && tradingStrategy.trim();
  const isSubmitting = createAgentMutation.isPending;

  return (
    <DefaultLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-wider uppercase text-eva-text italic">
            CREATE AGENT
          </h1>
          <p className="mt-2 text-sm font-mono text-eva-text-dim uppercase tracking-widest">
            Initialize New Autonomous Trading Unit
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex gap-8">
          {/* Left Column - Avatar Preview */}
          <div className="flex-shrink-0">
            <div className="relative w-[360px] h-[500px] bg-eva-darker rounded-lg border border-eva-border overflow-hidden">
              {/* Large Avatar Preview */}
              {selectedLogoUrl ? (
                <img
                  alt="Selected avatar"
                  className="absolute inset-0 w-full h-full object-cover"
                  src={selectedLogoUrl}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, #c9b8ff 0%, #8b7ab8 50%, #1a1a2e 100%)",
                  }}
                >
                  {/* Character silhouette placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-64 h-64 text-white/20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {!isAuthenticated ? (
                  <div className="w-full py-3 px-4 bg-eva-dark/80 border border-red-500/50 rounded-lg backdrop-blur-sm">
                    <span className="font-mono text-sm text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-5V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      CONNECT WALLET
                    </span>
                  </div>
                ) : selectedLogoUrl ? (
                  <div className="w-full py-3 px-4 bg-eva-dark/80 border border-eva-primary/50 rounded-lg backdrop-blur-sm">
                    <span className="font-mono text-sm text-eva-primary uppercase tracking-widest flex items-center justify-center gap-2">
                      AVATAR SELECTED
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 space-y-6">
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
                      isSelected={selectedLogoUrl === url}
                      url={url}
                      onSelect={() => setSelectedLogoUrl(url)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Agent Name */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-3">
                Agent Name
              </label>
              <input
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors"
                maxLength={20}
                placeholder="e.g. Eva.1"
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
              <span className="text-xs font-mono text-eva-muted mt-1 block">
                {agentName.length}/20 characters
              </span>
            </div>

            {/* Betting Strategy Prompt - Betting Phase */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-3">
                Betting Phase Strategy <span className="text-red-400">*</span>
                {isLoadingTemplate && (
                  <span className="ml-2 text-eva-muted">(Loading...)</span>
                )}
              </label>
              <p className="text-xs text-eva-muted mb-2">
                Strategy for bidding phase (Block 0-300)
              </p>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-36 text-sm"
                placeholder={
                  isLoadingTemplate
                    ? "Loading default template..."
                    : "Describe your betting phase strategy..."
                }
                value={bettingStrategy}
                onChange={(e) => {
                  setBettingStrategy(e.target.value);
                  setHasUserEditedBetting(true);
                }}
              />
            </div>

            {/* Trading Strategy Prompt - Trading Phase */}
            <div>
              <label className="block text-xs font-mono text-eva-text-dim uppercase tracking-widest mb-3">
                Trading Phase Strategy <span className="text-red-400">*</span>
                {isLoadingTemplate && (
                  <span className="ml-2 text-eva-muted">(Loading...)</span>
                )}
              </label>
              <p className="text-xs text-eva-muted mb-2">
                Strategy for trading phase (Block 300-2700)
              </p>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-36 text-sm"
                placeholder={
                  isLoadingTemplate
                    ? "Loading default template..."
                    : "Describe your trading phase strategy..."
                }
                value={tradingStrategy}
                onChange={(e) => {
                  setTradingStrategy(e.target.value);
                  setHasUserEditedTrading(true);
                }}
              />
            </div>

            {/* Error Message */}
            {createAgentMutation.isError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <span className="text-sm font-mono text-red-400">
                  Failed to create agent. Please try again.
                </span>
              </div>
            )}

            {/* Bottom Bar - Info & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-eva-border">
              {/* Info Badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-eva-darker rounded-lg border border-eva-border">
                  <span className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
                    Frequency
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-mono text-eva-primary">
                    10s Tick
                    <svg
                      className="w-4 h-4"
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
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-eva-darker rounded-lg border border-eva-border">
                  <span className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
                    Creation Fee
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-mono text-eva-primary">
                    0.1 SOL
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Create Button */}
              <EvaButton
                className="px-8 py-3 text-sm font-semibold uppercase tracking-wider"
                disabled={!isFormValid || isSubmitting || !isAuthenticated}
                size="lg"
                variant="primary"
                onClick={handleCreateAgent}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Agent"
                )}
              </EvaButton>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
