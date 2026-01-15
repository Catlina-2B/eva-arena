import type { AgentDetailDto, UpdateAgentDto, WizardPhase } from "@/types/api";

import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

import { AIPromptDrawer } from "./ai-prompt-drawer";

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

import { useAgentLogos, useUpdateAgent, useUploadAvatar } from "@/hooks/use-agents";

// Supported image types and max file size
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Link Icon for AI Generate button
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7.58333 3.79167L8.75 2.625C9.07082 2.30418 9.5 2.125 9.94792 2.125C10.3958 2.125 10.825 2.30418 11.1458 2.625C11.4667 2.94582 11.6458 3.375 11.6458 3.82292C11.6458 4.27083 11.4667 4.7 11.1458 5.02083L8.8125 7.35417C8.49168 7.67499 8.0625 7.85417 7.61458 7.85417C7.16667 7.85417 6.7375 7.67499 6.41667 7.35417"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.41667 10.2083L5.25 11.375C4.92918 11.6958 4.5 11.875 4.05208 11.875C3.60417 11.875 3.175 11.6958 2.85417 11.375C2.53335 11.0542 2.35417 10.625 2.35417 10.1771C2.35417 9.72917 2.53335 9.3 2.85417 8.97917L5.1875 6.64583C5.50832 6.32501 5.9375 6.14583 6.38542 6.14583C6.83333 6.14583 7.2625 6.32501 7.58333 6.64583"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// AI Generated Button Component
function AIGeneratedButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 h-7 px-3 border border-eva-primary rounded text-eva-primary text-xs font-semibold uppercase tracking-wider hover:bg-eva-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
    >
      <LinkIcon />
      <span>AI-GENERATED</span>
    </button>
  );
}

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
  const [customAvatars, setCustomAvatars] = useState<string[]>([]);

  // AI Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerPhase, setActiveDrawerPhase] = useState<WizardPhase>("betting");

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch logos
  const { data: logosData, isLoading: isLoadingLogos } = useAgentLogos();

  // Update mutation
  const updateMutation = useUpdateAgent();

  // Upload avatar mutation
  const uploadAvatarMutation = useUploadAvatar();

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadAvatarMutation.mutateAsync(file);
      setCustomAvatars((prev) => [...prev, result.url]);
      setSelectedLogo(result.url);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  }, [uploadAvatarMutation]);

  // Handle AI Generated button click
  const handleOpenAIDrawer = useCallback((phase: WizardPhase) => {
    setActiveDrawerPhase(phase);
    setIsDrawerOpen(true);
  }, []);

  // Handle AI Prompt confirmation
  const handleAIPromptConfirm = useCallback((prompt: string) => {
    if (activeDrawerPhase === "betting") {
      setBettingStrategyPrompt(prompt);
    } else {
      setTradingStrategyPrompt(prompt);
    }
  }, [activeDrawerPhase]);

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

    handleAvatarUpload(file);
    e.target.value = "";
  };

  // Initialize form with agent data
  useEffect(() => {
    if (agent && isOpen) {
      setName(agent.name || "");
      setSelectedLogo(agent.logo || null);
      setBettingStrategyPrompt(agent.bettingStrategyPrompt || "");
      setTradingStrategyPrompt(agent.tradingStrategyPrompt || "");
      // If agent has a custom logo not in preset list, add it to customAvatars
      if (agent.logo && logosData?.small && !logosData.small.includes(agent.logo)) {
        setCustomAvatars([agent.logo]);
      } else {
        setCustomAvatars([]);
      }
    }
  }, [agent, isOpen, logosData]);

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
                  {logosData?.small?.map((url, index) => (
                    <AvatarItem
                      key={`avatar-${index}`}
                      index={index}
                      isSelected={selectedLogo === url}
                      url={url}
                      onSelect={() => setSelectedLogo(url)}
                    />
                  ))}
                  {/* Custom uploaded avatars */}
                  {customAvatars.map((url, index) => (
                    <AvatarItem
                      key={`custom-avatar-${index}`}
                      index={(logosData?.small?.length || 0) + index}
                      isSelected={selectedLogo === url}
                      url={url}
                      onSelect={() => setSelectedLogo(url)}
                    />
                  ))}
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    disabled={uploadAvatarMutation.isPending}
                    type="file"
                    onChange={handleFileChange}
                  />
                  {/* Upload button */}
                  <button
                    className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                      uploadAvatarMutation.isPending
                        ? "border-eva-primary/50 cursor-wait"
                        : uploadAvatarMutation.isError
                          ? "border-red-500 text-red-500 hover:border-red-400"
                          : "border-eva-border text-eva-text-dim hover:border-eva-primary hover:text-eva-primary"
                    }`}
                    disabled={uploadAvatarMutation.isPending}
                    title={uploadAvatarMutation.isError ? "上传失败，点击重试" : "上传自定义头像"}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadAvatarMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
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
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Betting Strategy Prompt - Betting Phase */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-eva-text-dim uppercase tracking-widest">
                  Betting Phase Strategy
                </label>
                <AIGeneratedButton onClick={() => handleOpenAIDrawer("betting")} />
              </div>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-28 text-sm"
                placeholder="Describe your betting phase strategy..."
                value={bettingStrategyPrompt}
                onChange={(e) => setBettingStrategyPrompt(e.target.value)}
              />
            </div>

            {/* Trading Strategy Prompt - Trading Phase */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-eva-text-dim uppercase tracking-widest">
                  Trading Phase Strategy
                </label>
                <AIGeneratedButton onClick={() => handleOpenAIDrawer("trading")} />
              </div>
              <textarea
                className="w-full px-4 py-3 bg-eva-darker border border-eva-border rounded-lg text-eva-text font-mono placeholder:text-eva-muted focus:outline-none focus:border-eva-primary transition-colors resize-none h-28 text-sm"
                placeholder="Describe your trading phase strategy..."
                value={tradingStrategyPrompt}
                onChange={(e) => setTradingStrategyPrompt(e.target.value)}
              />
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

      {/* AI Prompt Drawer */}
      <AIPromptDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        phase={activeDrawerPhase}
        onConfirm={handleAIPromptConfirm}
      />
    </Fragment>,
    document.body,
  );
}

export default EditAgentModal;

