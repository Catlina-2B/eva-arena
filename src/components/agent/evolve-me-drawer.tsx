import type { StrategyOptimizePhase, BehaviorChangeSummary } from "@/types/api";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import { PromptDiff, parsePromptDiff, type DiffLine } from "./prompt-diff";
import { BehaviorChangeCard } from "./behavior-change-card";

import { useOptimizeStrategy, useUpdateAgent } from "@/hooks/use-agents";

// SVG Icons
const CloseIcon = () => (
  <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
    <path
      d="M1 1L13 13M1 13L13 1"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const CheckIcon = () => (
  <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
    <path
      d="M2 7L5.5 10.5L12 4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const SendIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
    <path
      d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
    />
  </svg>
);

const AIIcon = () => (
  <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
    <rect fill="#1a1a2e" height="20" rx="4" width="20" />
    <path
      d="M6 8H14M6 12H11"
      stroke="#6ce182"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const LoadingSpinner = ({ size = 16 }: { size?: number }) => (
  <svg
    className="animate-spin"
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="3"
    />
    <path
      d="M12 2C6.48 2 2 6.48 2 12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="3"
    />
  </svg>
);

// UI Message type
interface UIMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  // 优化结果相关
  optimizeResult?: {
    phase: StrategyOptimizePhase;
    isValid: boolean;
    optimizedPrompt?: string;
    changeSummary?: string;
    behaviorChangeSummary?: BehaviorChangeSummary;
    errorMessage?: string;
    suggestions?: string[];
    diffLines?: DiffLine[];
  };
}

interface EvolveMeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  currentBettingPrompt: string;
  currentTradingPrompt: string;
  onSuccess?: () => void;
  /** Called after a strategy update is successfully applied */
  onApplySuccess?: () => void;
}

export function EvolveMeDrawer({
  isOpen,
  onClose,
  agentId,
  currentBettingPrompt,
  currentTradingPrompt,
  onSuccess,
  onApplySuccess,
}: EvolveMeDrawerProps) {
  const optimizeMutation = useOptimizeStrategy();
  const updateAgentMutation = useUpdateAgent();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [pendingOptimize, setPendingOptimize] = useState<{
    phase: StrategyOptimizePhase;
    prompt: string;
  } | null>(null);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setMessages([]);
      setInputValue("");
      setPendingOptimize(null);

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content:
            'Based on the current round, share your feelings or any feedback:\n\n• "Should have sold earlier when price peaked"\n• "Be more aggressive when volume spikes"\n• "Hold longer during uptrends"\n\nYour suggestions will be automatically merged into your strategy prompt and take effect from the next round.',
        },
      ]);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const addMessage = useCallback((message: UIMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = useCallback(async () => {
    const input = inputValue.trim();

    if (!input || optimizeMutation.isPending) return;

    // Add user message
    addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: input,
    });
    setInputValue("");

    try {
      const response = await optimizeMutation.mutateAsync({ userInput: input });

      if (response.isValid && response.optimizedPrompt) {
        // 获取当前的 prompt 用于对比
        const currentPrompt =
          response.phase === "betting"
            ? currentBettingPrompt
            : currentTradingPrompt;

        // 解析 diff
        const diffLines = parsePromptDiff(
          currentPrompt,
          response.optimizedPrompt,
        );

        // 保存待应用的优化
        setPendingOptimize({
          phase: response.phase,
          prompt: response.optimizedPrompt,
        });

        // 添加成功消息
        addMessage({
          id: `ai-${Date.now()}`,
          type: "ai",
          content: response.changeSummary || "Here's the optimized strategy:",
          optimizeResult: {
            phase: response.phase,
            isValid: true,
            optimizedPrompt: response.optimizedPrompt,
            changeSummary: response.changeSummary,
            behaviorChangeSummary: response.behaviorChangeSummary,
            diffLines,
          },
        });
      } else {
        // 添加错误消息
        addMessage({
          id: `ai-error-${Date.now()}`,
          type: "ai",
          content:
            response.errorMessage || "I couldn't understand your request.",
          optimizeResult: {
            phase: response.phase,
            isValid: false,
            errorMessage: response.errorMessage,
            suggestions: response.suggestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to optimize strategy:", error);
      addMessage({
        id: `ai-error-${Date.now()}`,
        type: "ai",
        content: "Failed to process your request. Please try again.",
      });
    }
  }, [
    inputValue,
    optimizeMutation,
    addMessage,
    currentBettingPrompt,
    currentTradingPrompt,
  ]);

  const handleApply = useCallback(async () => {
    if (!pendingOptimize) return;

    try {
      const updateData =
        pendingOptimize.phase === "betting"
          ? { bettingStrategyPrompt: pendingOptimize.prompt }
          : { tradingStrategyPrompt: pendingOptimize.prompt };

      await updateAgentMutation.mutateAsync({
        id: agentId,
        data: updateData,
      });

      // 添加成功消息
      addMessage({
        id: `ai-success-${Date.now()}`,
        type: "ai",
        content: `Strategy updated successfully! The ${pendingOptimize.phase} phase strategy will be applied in the next round.`,
      });

      setPendingOptimize(null);
      onSuccess?.();
      onApplySuccess?.();
    } catch (error) {
      console.error("Failed to update agent:", error);
      addMessage({
        id: `ai-error-${Date.now()}`,
        type: "ai",
        content: "Failed to update strategy. Please try again.",
      });
    }
  }, [
    pendingOptimize,
    agentId,
    updateAgentMutation,
    addMessage,
    onSuccess,
    onApplySuccess,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!isVisible) return null;

  const isLoading = optimizeMutation.isPending || updateAgentMutation.isPending;
  const canSend = !isLoading && inputValue.trim();

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed right-0 top-0 bottom-0 w-[440px] bg-[#080808] border-l border-[#1f2937] z-[101] flex flex-col",
          "transition-transform duration-300 ease-out",
          isAnimating ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dashed border-[rgba(255,255,255,0.2)]">
          <div className="flex items-center gap-2">
            <span className="text-[#6ce182] font-mono text-sm font-bold tracking-wider">
              ///
            </span>
            <span className="text-white font-mono text-sm font-bold uppercase tracking-wider">
              COACH YOUR AGENT
            </span>
          </div>
          <div className="flex items-center gap-1">
            {pendingOptimize && (
              <button
                className="flex items-center justify-center w-8 h-8 border border-[rgba(108,225,130,0.5)] text-[#6ce182] hover:bg-[#6ce182]/10 transition-colors disabled:opacity-50"
                disabled={updateAgentMutation.isPending}
                title="Apply changes"
                type="button"
                onClick={handleApply}
              >
                {updateAgentMutation.isPending ? (
                  <LoadingSpinner size={14} />
                ) : (
                  <CheckIcon />
                )}
              </button>
            )}
            <button
              className="flex items-center justify-center w-8 h-8 border border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white transition-colors"
              title="Close"
              type="button"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* How it works banner */}
        <div className="px-4 py-3 bg-[#0d1117] border-b border-[#1f2937]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6ce182]/10 flex items-center justify-center flex-shrink-0">
              <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                <path
                  d="M8 1v6M8 11v.01M8 15a7 7 0 100-14 7 7 0 000 14z"
                  stroke="#6ce182"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/90 font-medium mb-1">
                Real-time Feedback Loop
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Share your trading insights anytime. Your feedback will be
                analyzed and merged into the agent's strategy, taking effect
                from the <span className="text-[#6ce182]">next round</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              hasPending={!!pendingOptimize}
              isApplying={updateAgentMutation.isPending}
              message={message}
              onApply={handleApply}
            />
          ))}
          {optimizeMutation.isPending && (
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <AIIcon />
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-3">
                <LoadingSpinner size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1f2937]">
          <div className="flex items-center gap-2 bg-[#15171e] border border-[#1f2937] rounded px-4 py-3">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none no-focus-ring font-mono"
              disabled={isLoading}
              placeholder="Tell me how to improve your strategy..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="p-1 text-[#6ce182] hover:text-[#5bd174] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canSend}
              type="button"
              onClick={handleSend}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// Message bubble component
function MessageBubble({
  message,
  onApply,
  isApplying,
  hasPending,
}: {
  message: UIMessage;
  onApply: () => void;
  isApplying: boolean;
  hasPending: boolean;
}) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#6ce182] text-black px-4 py-3 rounded-tl-lg rounded-bl-lg rounded-br-lg text-sm font-mono font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-1">
        <AIIcon />
      </div>
      <div className="flex-1 space-y-3">
        {/* Message content */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-3">
          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Optimize result - Behavior changes + Diff view */}
        {message.optimizeResult?.isValid &&
          message.optimizeResult.diffLines && (
            <div className="space-y-3">
              {message.optimizeResult.behaviorChangeSummary && (
                <BehaviorChangeCard
                  summary={message.optimizeResult.behaviorChangeSummary}
                />
              )}
              <PromptDiff
                collapsedLines={3}
                lines={message.optimizeResult.diffLines}
                title={
                  message.optimizeResult.phase === "betting"
                    ? "Betting Phase Strategy"
                    : "Trading Phase Strategy"
                }
              />

              {/* Apply button */}
              {hasPending && (
                <button
                  className="flex items-center gap-2 px-4 py-3 bg-[#d357e0] text-black text-sm font-mono font-semibold rounded hover:bg-[#c045cf] transition-colors disabled:opacity-50"
                  disabled={isApplying}
                  type="button"
                  onClick={onApply}
                >
                  {isApplying ? (
                    <>
                      <LoadingSpinner size={14} />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      Apply for next round
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        {/* Error suggestions */}
        {message.optimizeResult &&
          !message.optimizeResult.isValid &&
          message.optimizeResult.suggestions && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <p className="text-xs text-yellow-400 font-semibold mb-2">
                Suggestions:
              </p>
              <ul className="text-xs text-yellow-300/80 space-y-1">
                {message.optimizeResult.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

export default EvolveMeDrawer;
