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

// Avatar background colors - matching Figma design
const AVATAR_COLORS = [
  "#f02424", // Red
  "#f7de40", // Yellow
  "#6cabad", // Teal
  "#375dde", // Blue
  "#8148dd", // Purple
  "#ffcfe9", // Pink
  "#ae7cff", // Light Purple
];

// SVG Icons
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7.58333 3.79167L8.75 2.625C9.07082 2.30418 9.5 2.125 9.94792 2.125C10.3958 2.125 10.825 2.30418 11.1458 2.625C11.4667 2.94582 11.6458 3.375 11.6458 3.82292C11.6458 4.27083 11.4667 4.7 11.1458 5.02083L8.8125 7.35417C8.49168 7.67499 8.0625 7.85417 7.61458 7.85417C7.16667 7.85417 6.7375 7.67499 6.41667 7.35417"
      stroke="#6ce182"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.41667 10.2083L5.25 11.375C4.92918 11.6958 4.5 11.875 4.05208 11.875C3.60417 11.875 3.175 11.6958 2.85417 11.375C2.53335 11.0542 2.35417 10.625 2.35417 10.1771C2.35417 9.72917 2.53335 9.3 2.85417 8.97917L5.1875 6.64583C5.50832 6.32501 5.9375 6.14583 6.38542 6.14583C6.83333 6.14583 7.2625 6.32501 7.58333 6.64583"
      stroke="#6ce182"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke="#6ce182" strokeWidth="1.2" />
    <path d="M6 3V6L8 8" stroke="#6ce182" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const SolanaIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2.25 8.25L3.75 6.75H9.75L8.25 8.25H2.25Z"
      fill="white"
    />
    <path
      d="M2.25 3.75L3.75 5.25H9.75L8.25 3.75H2.25Z"
      fill="white"
    />
    <path
      d="M2.25 6L3.75 4.5H9.75L8.25 6H2.25Z"
      fill="white"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="#6ce182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Avatar item component with skeleton loading
function AvatarItem({
  url,
  index,
  isSelected,
  bgColor,
  onSelect,
}: {
  url: string;
  index: number;
  isSelected: boolean;
  bgColor: string;
  onSelect: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <button
      type="button"
      className={`aspect-square w-full overflow-hidden transition-all duration-200 relative ${
        isSelected
          ? "border-2 border-[#6ce182]"
          : "border border-white/10 hover:border-white/30"
      }`}
      style={{ backgroundColor: bgColor }}
      title={`Avatar ${index + 1}`}
      onClick={onSelect}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-eva-border/50 animate-pulse" />
      )}
      <img
        alt={`Avatar ${index + 1}`}
        className={`w-full h-full object-cover object-top transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        src={url}
        onLoad={handleLoad}
      />
    </button>
  );
}

// Add Avatar Button
function AddAvatarButton() {
  return (
    <button
      type="button"
      className="aspect-square w-full bg-[#080a12] border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors"
    >
      <PlusIcon />
    </button>
  );
}

// AI Generated Button Component
function AIGeneratedButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 h-8 px-4 border border-[#6ce182] rounded text-[#6ce182] text-xs font-semibold uppercase tracking-wider hover:bg-[#6ce182]/10 transition-colors"
      onClick={onClick}
    >
      <LinkIcon />
      <span>AI-GENERATED</span>
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
      const pdaAddress = `pda_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await createAgentMutation.mutateAsync({
        name: agentName.trim(),
        logo: selectedLogoUrl,
        pdaAddress,
        bettingStrategyPrompt: bettingStrategy.trim(),
        tradingStrategyPrompt: tradingStrategy.trim(),
        filterConfig: DEFAULT_FILTER_CONFIG,
      });

      navigate("/my-agent");
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const isFormValid =
    agentName.trim() && selectedLogoUrl && bettingStrategy.trim() && tradingStrategy.trim();
  const isSubmitting = createAgentMutation.isPending;

  // Get selected avatar index for background color
  const selectedIndex = logosData?.findIndex(url => url === selectedLogoUrl) ?? 0;
  const selectedBgColor = AVATAR_COLORS[selectedIndex % AVATAR_COLORS.length];

  return (
    <DefaultLayout>
      <div className="flex gap-6 items-stretch p-0">
        {/* Left Column - Header + Avatar Preview */}
        <div className="flex flex-col gap-6 shrink-0 w-[400px]">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display text-white tracking-wider">
              Create Agent
            </h1>
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
              Initialize new autonomous trading unit
            </p>
          </div>

          {/* Avatar Preview Card */}
          <div className="relative flex-1 min-h-[400px]">
            <div 
              className="absolute inset-0 border border-[#6ce182] overflow-hidden"
              style={{
                background: `linear-gradient(to bottom, #02120a 0%, ${selectedBgColor}40 50%, #544273 100%)`,
              }}
            >
              {/* Selected Avatar Image */}
              {selectedLogoUrl && (
                <img
                  alt="Selected avatar"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  src={selectedLogoUrl}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Avatar Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                Select Avatar
              </label>
            
            {/* Avatar Grid */}
            <div className="flex flex-col gap-3">
              {isLoadingLogos ? (
                <>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={`skeleton-1-${index}`}
                        className="aspect-square bg-eva-border/50 animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={`skeleton-2-${index}`}
                        className="aspect-square bg-eva-border/50 animate-pulse"
                    />
                  ))}
                </div>
                </>
              ) : (
                <>
                  {/* First Row - Avatars 1-7 */}
                  <div className="grid grid-cols-7 gap-3">
                    {logosData?.slice(0, 7).map((url, index) => (
                    <AvatarItem
                        key={`avatar-row1-${index}`}
                      index={index}
                      isSelected={selectedLogoUrl === url}
                        bgColor={AVATAR_COLORS[index % AVATAR_COLORS.length]}
                      url={url}
                      onSelect={() => setSelectedLogoUrl(url)}
                    />
                  ))}
                </div>
                  {/* Second Row - Avatars 8-13 + Add Button */}
                  <div className="grid grid-cols-7 gap-3">
                    {logosData?.slice(7, 13).map((url, index) => (
                      <AvatarItem
                        key={`avatar-row2-${index}`}
                        index={index + 7}
                        isSelected={selectedLogoUrl === url}
                        bgColor={AVATAR_COLORS[(index + 7) % AVATAR_COLORS.length]}
                        url={url}
                        onSelect={() => setSelectedLogoUrl(url)}
                      />
                    ))}
                    <AddAvatarButton />
                  </div>
                </>
              )}
            </div>
            </div>

            {/* Agent Name */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                Agent Name
              </label>
              <AIGeneratedButton />
            </div>
            <div className="bg-black border border-[#374151]">
              <input
                type="text"
                className="w-full px-[17px] py-[19px] bg-transparent text-sm font-medium text-white placeholder:text-[#4b5563] focus:outline-none"
                placeholder="e.g. Eva.1"
                maxLength={20}
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>
            </div>

          {/* Betting Strategy Prompt */}
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                Betting Strategy Prompt
              </label>
              <AIGeneratedButton />
            </div>
            <div className="flex-1 min-h-[100px] bg-black border border-[#374151]">
              <textarea
                className="w-full h-full px-[17px] py-[17px] bg-transparent text-sm font-medium text-white placeholder:text-[#374151] focus:outline-none resize-none"
                placeholder="// Enter logic for wager sizing..."
                value={bettingStrategy}
                onChange={(e) => {
                  setBettingStrategy(e.target.value);
                  setHasUserEditedBetting(true);
                }}
              />
            </div>
            </div>

          {/* Trading Strategy Prompt */}
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                Trading Strategy Prompt
              </label>
              <AIGeneratedButton />
            </div>
            <div className="flex-1 min-h-[100px] bg-black border border-[#374151]">
              <textarea
                className="w-full h-full px-[17px] py-[17px] bg-transparent text-sm font-medium text-white placeholder:text-[#374151] focus:outline-none resize-none"
                placeholder="// Enter logic for entry/exit execution..."
                value={tradingStrategy}
                onChange={(e) => {
                  setTradingStrategy(e.target.value);
                  setHasUserEditedTrading(true);
                }}
              />
            </div>
            </div>

            {/* Error Message */}
            {createAgentMutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50">
                <span className="text-sm font-mono text-red-400">
                  Failed to create agent. Please try again.
                </span>
              </div>
            )}

            {/* Bottom Bar - Info & Action */}
              <div className="flex items-center gap-4">
            {/* Frequency */}
            <div className="flex-1 h-[54px] bg-[#15171e] border border-[#1f2937] px-[17px] flex items-center justify-between">
              <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Frequency
                  </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#6ce182]">
                    10s Tick
                  </span>
                <ClockIcon />
              </div>
                </div>

            {/* Creation Fee */}
            <div className="flex-1 h-[54px] bg-[#15171e] border border-[#1f2937] px-[17px] flex items-center justify-between">
              <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Creation Fee
                  </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                    0.1 SOL
                  </span>
                <SolanaIcon />
              </div>
              </div>

            {/* Create Agent Button */}
            <button
              type="button"
              className="flex-1 h-[54px] bg-[#6ce182] border border-[#6ce182] rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5bd174] transition-colors"
                disabled={!isFormValid || isSubmitting || !isAuthenticated}
                onClick={handleCreateAgent}
              >
              <span className="font-semibold text-sm text-black uppercase tracking-wider">
                {isSubmitting ? "CREATING..." : "CREATE AGENT"}
                  </span>
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
