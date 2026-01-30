import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AIPromptDrawer } from "@/components/agent";
import DefaultLayout from "@/layouts/default";
import { EvaButton } from "@/components/ui";
import {
  useAgentLogos,
  useCreateAgent,
  usePromptTemplate,
  useUploadAvatar,
} from "@/hooks/use-agents";
import { useAuthStore } from "@/stores/auth";
import type { WizardPhase } from "@/types/api";
import {
  BETTING_STRATEGY_PRESETS,
  TRADING_STRATEGY_PRESETS,
  BETTING_PRESET_BUTTONS,
  TRADING_PRESET_BUTTONS,
  type BettingPresetKey,
  type TradingPresetKey,
} from "@/constants/strategy-presets";
import { trackPageView, trackAgentCreate } from "@/services/analytics";

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
    <circle cx="6" cy="6" r="5" stroke="#4B5563" strokeWidth="1.2" />
    <path d="M6 3V6L8 8" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round" />
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

const CreationFeeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1 4C1 5.65575 2.34425 7 4 7C5.65575 7 7 5.65575 7 4C7 2.34425 5.65575 1 4 1C2.34425 1 1 2.34425 1 4V4"
      stroke="#D357E0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.04498 5.18506C10.3477 5.67075 11.1461 6.98792 10.9739 8.36756C10.8017 9.74721 9.70416 10.8278 8.322 10.9784C6.93984 11.129 5.63529 10.3102 5.16998 9.00006"
      stroke="#D357E0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 3H4V5"
      stroke="#D357E0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.35498 6.93994L8.70498 7.29494L7.29498 8.70494"
      stroke="#D357E0"
      strokeLinecap="round"
      strokeLinejoin="round"
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

const LoadingSpinner = () => (
  <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M12 2C6.48 2 2 6.48 2 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Supported image types and max file size
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// Add Avatar Button with upload functionality
function AddAvatarButton({
  onUpload,
  isUploading,
  uploadError,
}: {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadError: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      alert("不支持的文件格式，请上传 JPG、PNG、GIF 或 WebP 格式的图片");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("文件大小超过限制，请上传小于 5MB 的图片");
      return;
    }

    onUpload(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button
        type="button"
        className={`aspect-square w-full bg-[#080a12] border flex items-center justify-center transition-colors ${
          isUploading 
            ? "border-[#6ce182]/50 cursor-wait" 
            : uploadError 
              ? "border-red-500 hover:border-red-400" 
              : "border-white/10 hover:border-white/30"
        }`}
        onClick={handleClick}
        disabled={isUploading}
        title={uploadError || "上传自定义头像"}
      >
        {isUploading ? <LoadingSpinner /> : <PlusIcon />}
      </button>
    </div>
  );
}

// AI Generated Button Component
function AIGeneratedButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 h-8 px-4 border border-[#6ce182] rounded text-[#6ce182] text-xs font-semibold uppercase tracking-wider hover:bg-[#6ce182]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
    >
      <LinkIcon />
      <span>AI-GENERATED</span>
    </button>
  );
}

// Strategy Preset Button Component
function StrategyPresetButton({
  label,
  isFirst,
  isActive,
  onClick,
}: {
  label: string;
  isFirst: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  // First button or active button uses green background
  const isPrimary = isFirst || isActive;
  
  return (
    <button
      type="button"
      className={`h-8 px-4 text-xs font-medium rounded transition-colors ${
        isPrimary
          ? 'bg-[#6ce182] text-black hover:bg-[#5bd174]'
          : 'bg-transparent border border-[#374151] text-white hover:border-[#6ce182] hover:bg-[#374151]/30'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Strategy Preset Buttons Group Component
function StrategyPresetButtons({
  presets,
  activePreset,
  onSelect,
}: {
  presets: readonly { key: string; label: string }[];
  // undefined = show first button as default, null = no button highlighted, string = specific preset
  activePreset?: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {presets.map((preset, index) => (
        <StrategyPresetButton
          key={preset.key}
          label={preset.label}
          // Only show first button as default when activePreset is strictly undefined
          // When null (AI generated), no button should be highlighted
          isFirst={index === 0 && activePreset === undefined}
          isActive={activePreset === preset.key}
          onClick={() => onSelect(preset.key)}
        />
      ))}
    </div>
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

  // Upload avatar mutation
  const uploadAvatarMutation = useUploadAvatar();

  // 埋点：页面浏览
  useEffect(() => {
    trackPageView({ page_name: "create_agent" });
  }, []);

  // Form state
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
  // Custom uploaded avatars (stored locally)
  const [customAvatars, setCustomAvatars] = useState<string[]>([]);
  const [agentName, setAgentName] = useState("");
  const [bettingStrategy, setBettingStrategy] = useState("");
  const [tradingStrategy, setTradingStrategy] = useState("");
  const [hasUserEditedBetting, setHasUserEditedBetting] = useState(false);
  const [hasUserEditedTrading, setHasUserEditedTrading] = useState(false);

  // AI Prompt Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerPhase, setActiveDrawerPhase] = useState<WizardPhase>("betting");

  // Strategy preset state
  // undefined = initial state, show first button as default
  // null = explicitly no selection (e.g., AI generated), show no button highlighted
  // string = a specific preset is selected
  const [activeBettingPreset, setActiveBettingPreset] = useState<BettingPresetKey | null | undefined>();
  const [activeTradingPreset, setActiveTradingPreset] = useState<TradingPresetKey | null | undefined>();

  // Handle betting preset selection
  const handleBettingPresetSelect = useCallback((key: string) => {
    const presetKey = key as BettingPresetKey;
    const prompt = BETTING_STRATEGY_PRESETS[presetKey];
    if (prompt) {
      setBettingStrategy(prompt);
      setActiveBettingPreset(presetKey);
      setHasUserEditedBetting(true);
    }
  }, []);

  // Handle trading preset selection
  const handleTradingPresetSelect = useCallback((key: string) => {
    const presetKey = key as TradingPresetKey;
    const prompt = TRADING_STRATEGY_PRESETS[presetKey];
    if (prompt) {
      setTradingStrategy(prompt);
      setActiveTradingPreset(presetKey);
      setHasUserEditedTrading(true);
    }
  }, []);

  // Handle AI Generated button click
  const handleOpenAIDrawer = useCallback((phase: WizardPhase) => {
    setActiveDrawerPhase(phase);
    setIsDrawerOpen(true);
  }, []);

  // Handle AI Prompt confirmation
  const handleAIPromptConfirm = useCallback((prompt: string) => {
    if (activeDrawerPhase === "betting") {
      setBettingStrategy(prompt);
      setHasUserEditedBetting(true);
      // Set to null to explicitly indicate no preset selected (AI generated)
      setActiveBettingPreset(null);
    } else {
      setTradingStrategy(prompt);
      setHasUserEditedTrading(true);
      // Set to null to explicitly indicate no preset selected (AI generated)
      setActiveTradingPreset(null);
    }
  }, [activeDrawerPhase]);

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
    if (logosData?.small && logosData.small.length > 0 && !selectedLogoUrl) {
      setSelectedLogoUrl(logosData.small[0]);
    }
  }, [logosData, selectedLogoUrl]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadAvatarMutation.mutateAsync(file);
      // Add the uploaded URL to custom avatars and select it
      setCustomAvatars((prev) => [...prev, result.url]);
      setSelectedLogoUrl(result.url);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  }, [uploadAvatarMutation]);

  const handleCreateAgent = async () => {
    if (!agentName.trim() || !selectedLogoUrl || !bettingStrategy.trim() || !tradingStrategy.trim()) {
      return;
    }

    try {
      const pdaAddress = `pda_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const createdAgent = await createAgentMutation.mutateAsync({
        name: agentName.trim(),
        logo: selectedLogoUrl,
        pdaAddress,
        bettingStrategyPrompt: bettingStrategy.trim(),
        tradingStrategyPrompt: tradingStrategy.trim(),
        filterConfig: DEFAULT_FILTER_CONFIG,
      });

      // 埋点：Agent 创建成功
      trackAgentCreate({ agent_id: createdAgent.id });

      navigate("/my-agent");
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const isFormValid =
    agentName.trim() && selectedLogoUrl && bettingStrategy.trim() && tradingStrategy.trim();
  const isSubmitting = createAgentMutation.isPending;

  // Get selected avatar index for background color and large preview
  const selectedIndex = logosData?.small?.findIndex(url => url === selectedLogoUrl) ?? 0;
  const selectedBgColor = AVATAR_COLORS[selectedIndex % AVATAR_COLORS.length];
  // Get the large version of the selected avatar for the preview
  const selectedLargeLogoUrl = selectedIndex >= 0 && logosData?.large?.[selectedIndex] 
    ? logosData.large[selectedIndex] 
    : selectedLogoUrl;

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
          <div 
            className="relative flex-1 min-h-[400px] border border-[#6ce182] overflow-hidden"
            style={{ background: 'black' }}
          >
            {/* Selected Avatar Image (Large version for preview) */}
            {selectedLargeLogoUrl && (
              <img
                alt="Selected avatar"
                className="absolute inset-0 w-full h-full object-cover object-center"
                src={selectedLargeLogoUrl}
              />
            )}
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
                    {logosData?.small?.slice(0, 7).map((url, index) => (
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
                  {/* Second Row - Avatars 8-13 + Custom Avatars + Add Button */}
                  <div className="grid grid-cols-7 gap-3">
                    {logosData?.small?.slice(7, 13).map((url, index) => (
                      <AvatarItem
                        key={`avatar-row2-${index}`}
                        index={index + 7}
                        isSelected={selectedLogoUrl === url}
                        bgColor={AVATAR_COLORS[(index + 7) % AVATAR_COLORS.length]}
                        url={url}
                        onSelect={() => setSelectedLogoUrl(url)}
                      />
                    ))}
                    {/* Custom uploaded avatars */}
                    {customAvatars.map((url, index) => (
                      <AvatarItem
                        key={`custom-avatar-${index}`}
                        index={13 + index}
                        isSelected={selectedLogoUrl === url}
                        bgColor="#1a1a2e"
                        url={url}
                        onSelect={() => setSelectedLogoUrl(url)}
                      />
                    ))}
                    <AddAvatarButton
                      onUpload={handleAvatarUpload}
                      isUploading={uploadAvatarMutation.isPending}
                      uploadError={uploadAvatarMutation.isError ? "上传失败，请重试" : null}
                    />
                  </div>
                </>
              )}
            </div>
            </div>

            {/* Agent Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
              Agent Name
            </label>
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
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  Betting Strategy Prompt
                </label>
                <StrategyPresetButtons
                  presets={BETTING_PRESET_BUTTONS}
                  activePreset={activeBettingPreset}
                  onSelect={handleBettingPresetSelect}
                />
              </div>
              <AIGeneratedButton onClick={() => handleOpenAIDrawer("betting")} />
            </div>
            <div className="flex-1 min-h-[100px] bg-black border border-[#374151]">
              <textarea
                className="w-full h-full px-[17px] py-[17px] bg-transparent text-sm font-medium text-white placeholder:text-[#374151] focus:outline-none resize-none"
                placeholder="// Enter logic for wager sizing..."
                value={bettingStrategy}
                onChange={(e) => {
                  setBettingStrategy(e.target.value);
                  setHasUserEditedBetting(true);
                  // Set to null to clear preset highlighting when user manually edits
                  setActiveBettingPreset(null);
                }}
              />
            </div>
          </div>

          {/* Trading Strategy Prompt */}
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                  Trading Strategy Prompt
                </label>
                <StrategyPresetButtons
                  presets={TRADING_PRESET_BUTTONS}
                  activePreset={activeTradingPreset}
                  onSelect={handleTradingPresetSelect}
                />
              </div>
              <AIGeneratedButton onClick={() => handleOpenAIDrawer("trading")} />
            </div>
            <div className="flex-1 min-h-[100px] bg-black border border-[#374151]">
              <textarea
                className="w-full h-full px-[17px] py-[17px] bg-transparent text-sm font-medium text-white placeholder:text-[#374151] focus:outline-none resize-none"
                placeholder="// Enter logic for entry/exit execution..."
                value={tradingStrategy}
                onChange={(e) => {
                  setTradingStrategy(e.target.value);
                  setHasUserEditedTrading(true);
                  // Set to null to clear preset highlighting when user manually edits
                  setActiveTradingPreset(null);
                }}
              />
            </div>
          </div>

            {/* Error Message */}
            {createAgentMutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50">
                <span className="text-sm font-mono text-red-400">
                  {(createAgentMutation.error as { message?: string })?.message || "Failed to create agent. Please try again."}
                </span>
              </div>
            )}

            {/* Bottom Bar - Info & Action */}
              <div className="flex items-center gap-4">

            {/* Creation Fee */}
            <div className="flex-1 h-[54px] bg-[#15171e] border border-[#1f2937] px-[17px] flex items-center justify-between">
              <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Creation Fee
                  </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                    0.1 SOL
                  </span>
                <CreationFeeIcon />
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

      {/* AI Prompt Drawer */}
      <AIPromptDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        phase={activeDrawerPhase}
        onConfirm={handleAIPromptConfirm}
      />
    </DefaultLayout>
  );
}
