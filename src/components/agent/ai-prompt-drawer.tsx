import { useCallback, useEffect, useRef, useState } from "react";

import { useChatWizard, useGenerateFromChat } from "@/hooks/use-agents";
import type {
  ChatQuestion,
  ChatQuestionOption,
  ChatWizardResponse,
  ConversationState,
  GenerateFromChatResponse,
  WizardPhase,
} from "@/types/api";

// SVG Icons
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 1L13 13M1 13L13 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 7L5.5 10.5L12 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="4" fill="#1a1a2e" />
    <path
      d="M6 8H14M6 12H11"
      stroke="#6ce182"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LoadingSpinner = ({ size = 16 }: { size?: number }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
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
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// UI Message type
interface UIMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  question?: ChatQuestion;
  suggestions?: string[];
  isCompleted?: boolean;
  summary?: Record<string, string>;
  generatedResult?: GenerateFromChatResponse;
}

interface AIPromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  phase: WizardPhase;
  onConfirm: (prompt: string) => void;
}

export function AIPromptDrawer({
  isOpen,
  onClose,
  phase,
  onConfirm,
}: AIPromptDrawerProps) {
  const chatMutation = useChatWizard();
  const generateMutation = useGenerateFromChat();

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<ConversationState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ChatQuestion | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedResult, setGeneratedResult] =
    useState<GenerateFromChatResponse | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom and focus input when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Auto focus input after messages update (with small delay to ensure DOM is ready)
    if (!isCompleted && !chatMutation.isPending) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isCompleted, chatMutation.isPending]);

  // Start conversation when drawer opens
  useEffect(() => {
    if (isOpen) {
      startConversation();
      // Focus input when drawer opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phase]);

  const addMessage = useCallback((message: UIMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const startConversation = useCallback(async () => {
    // Reset state
    setMessages([]);
    setConversationState(null);
    setCurrentQuestion(null);
    setIsCompleted(false);
    setGeneratedResult(null);
    setInputValue("");
    setIsStarting(true);

    try {
      // Send initial request to get first question
      const response = await chatMutation.mutateAsync({
        phase,
        userInput: "start",
      });

      handleChatResponse(response, true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      addMessage({
        id: "error",
        type: "ai",
        content: "Failed to start conversation. Please try again.",
      });
    } finally {
      setIsStarting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleChatResponse = useCallback(
    (response: ChatWizardResponse, isFirst = false) => {
      // Update conversation state
      setConversationState(response.conversationState);

      const question = response.nextQuestion || response.currentQuestion;
      const newMessages: UIMessage[] = [];

      // First, add the response message (welcome/confirmation message)
      if (response.message) {
        newMessages.push({
          id: `ai-msg-${Date.now()}`,
          type: "ai",
          content: response.message,
        });
      }

      // Then, if there's a question, add it as a separate message with options
      if (question) {
        newMessages.push({
          id: `ai-question-${Date.now()}`,
          type: "ai",
          content: question.questionText,
          question: question,
          suggestions: response.suggestions,
        });
      }

      // Handle completed state
      if (response.status === "completed") {
        // Add summary message
        newMessages.push({
          id: `ai-completed-${Date.now()}`,
          type: "ai",
          content: "All questions completed! Here's your selection summary:",
          isCompleted: true,
          summary: response.summary,
        });
      }

      switch (response.status) {
        case "continue":
          setCurrentQuestion(response.nextQuestion || null);
          break;
        case "retry":
        case "off_topic":
          setCurrentQuestion(response.currentQuestion || null);
          // Add suggestions to the last message if retry/off_topic
          if (response.suggestions && newMessages.length > 0) {
            newMessages[newMessages.length - 1].suggestions = response.suggestions;
          }
          break;
        case "completed":
          setIsCompleted(true);
          setCurrentQuestion(null);
          break;
      }

      if (isFirst) {
        setMessages(newMessages);
      } else {
        setMessages((prev) => [...prev, ...newMessages]);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || chatMutation.isPending) return;

      // Add user message to UI
      addMessage({
        id: `user-${Date.now()}`,
        type: "user",
        content: input,
      });
      setInputValue("");

      try {
        // Build conversation state, only include non-empty fields
        const stateToSend = conversationState
          ? {
              currentQuestionIndex: conversationState.currentQuestionIndex,
              collectedAnswers: conversationState.collectedAnswers,
              ...(conversationState.customValues &&
                Object.keys(conversationState.customValues).length > 0 && {
                  customValues: conversationState.customValues,
                }),
              ...(conversationState.conversationHistory &&
                conversationState.conversationHistory.length > 0 && {
                  conversationHistory: conversationState.conversationHistory,
                }),
            }
          : undefined;

        // Send to backend
        const response = await chatMutation.mutateAsync({
          phase,
          userInput: input,
          conversationState: stateToSend,
        });

        handleChatResponse(response);
      } catch (error) {
        console.error("Failed to send message:", error);
        addMessage({
          id: `error-${Date.now()}`,
          type: "ai",
          content: "Failed to process your input. Please try again.",
        });
      }
    },
    [
      phase,
      conversationState,
      chatMutation,
      addMessage,
      handleChatResponse,
    ],
  );

  const handleOptionClick = useCallback(
    (option: ChatQuestionOption) => {
      sendMessage(option.label);
    },
    [sendMessage],
  );

  const handleGenerate = useCallback(async () => {
    if (!conversationState) return;

    // Add user message
    addMessage({
      id: `user-generate-${Date.now()}`,
      type: "user",
      content: "Generate Strategy",
    });

    try {
      const response = await generateMutation.mutateAsync({
        phase,
        collectedAnswers: conversationState.collectedAnswers,
        customValues: conversationState.customValues,
        conversationHistory: conversationState.conversationHistory,
      });

      setGeneratedResult(response);

      // Add result message
      addMessage({
        id: `result-${Date.now()}`,
        type: "ai",
        content: "Strategy generated successfully!",
        generatedResult: response,
      });
    } catch (error) {
      console.error("Failed to generate strategy:", error);
      addMessage({
        id: `error-${Date.now()}`,
        type: "ai",
        content: "Failed to generate strategy. Please try again.",
      });
    }
  }, [phase, conversationState, generateMutation, addMessage]);

  const handleRetry = useCallback(() => {
    startConversation();
  }, [startConversation]);

  const handleConfirm = useCallback(() => {
    if (generatedResult) {
      onConfirm(generatedResult.prompt);
      onClose();
    }
  }, [generatedResult, onConfirm, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage],
  );

  if (!isOpen) return null;

  const isLoading = chatMutation.isPending || isStarting;
  const canSend = !isLoading && !isCompleted && inputValue.trim();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[120] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0a0c14] border-l border-[#1f2937] z-[121] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
          <div className="flex items-center gap-2">
            <span className="text-[#6ce182] font-mono text-xs">///</span>
            <span className="text-white font-semibold text-sm tracking-wider">
              AI PROMPT
            </span>
            <span className="text-gray-500 text-xs uppercase">
              {phase === "betting" ? "Betting" : "Trading"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {generatedResult && (
              <button
                type="button"
                className="p-1.5 text-[#6ce182] hover:bg-[#6ce182]/10 rounded transition-colors"
                onClick={handleConfirm}
                title="Confirm"
              >
                <CheckIcon />
              </button>
            )}
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              onClick={onClose}
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isStarting ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size={24} />
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onOptionClick={handleOptionClick}
                onGenerate={handleGenerate}
                onRetry={handleRetry}
                onConfirm={handleConfirm}
                isGenerating={generateMutation.isPending}
              />
            ))
          )}
          {chatMutation.isPending && !isStarting && (
            <div className="flex gap-2">
              <div className="shrink-0 mt-1">
                <AIIcon />
              </div>
              <div className="bg-[#15171e] border border-[#1f2937] rounded-lg px-3 py-2">
                <LoadingSpinner size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1f2937]">
          <div className="flex items-center gap-2 bg-[#15171e] border border-[#1f2937] rounded px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none no-focus-ring"
              placeholder={
                isCompleted
                  ? "Conversation completed"
                  : "Type your answer or select an option..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isCompleted}
            />
            <button
              type="button"
              className="p-1 text-[#6ce182] hover:text-[#5bd174] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => sendMessage(inputValue)}
              disabled={!canSend}
            >
              <SendIcon />
            </button>
          </div>
          {currentQuestion && (
            <div className="mt-2 text-xs text-gray-500">
              {currentQuestion.required && (
                <span className="text-red-400">* </span>
              )}
              {currentQuestion.questionType === "multi_choice"
                ? "You can select multiple options"
                : "Select an option or type your answer"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Message bubble component
function MessageBubble({
  message,
  onOptionClick,
  onGenerate,
  onRetry,
  onConfirm,
  isGenerating,
}: {
  message: UIMessage;
  onOptionClick: (option: ChatQuestionOption) => void;
  onGenerate: () => void;
  onRetry: () => void;
  onConfirm: () => void;
  isGenerating: boolean;
}) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#6ce182] text-black px-3 py-2 rounded-lg text-sm font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex gap-2">
      <div className="shrink-0 mt-1">
        <AIIcon />
      </div>
      <div className="flex-1 space-y-2">
        <div className="bg-[#15171e] border border-[#1f2937] rounded-lg px-3 py-2">
          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Options */}
        {message.question?.options && message.question.options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="px-3 py-1.5 text-xs font-mono rounded border bg-transparent border-[#374151] text-gray-300 hover:border-[#6ce182] hover:text-[#6ce182] transition-colors"
                onClick={() => onOptionClick(option)}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
            <p className="text-xs text-yellow-400 font-semibold mb-1">
              Suggestions:
            </p>
            <ul className="text-xs text-yellow-300/80 space-y-1">
              {message.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed state - show summary and generate button */}
        {message.isCompleted && message.summary && !message.generatedResult && (
          <div className="space-y-3">
            <div className="bg-[#1a1d27] border border-[#6ce182]/30 rounded-lg p-3 space-y-2">
              <div className="text-xs text-[#6ce182] font-semibold uppercase tracking-wider">
                YOUR SELECTIONS
              </div>
              {Object.entries(message.summary).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-white font-mono">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-transparent border border-[#374151] text-gray-300 text-xs font-semibold rounded hover:border-gray-500 transition-colors"
                onClick={onRetry}
              >
                Start Over
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-[#6ce182] border border-[#6ce182] text-black text-xs font-semibold rounded hover:bg-[#5bd174] transition-colors disabled:opacity-50"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size={12} />
                    Generating...
                  </span>
                ) : (
                  "Generate Strategy"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Generated result */}
        {message.generatedResult && (
          <div className="space-y-3">
            <div className="bg-[#1a1d27] border border-[#6ce182]/30 rounded-lg p-3 space-y-2">
              <div className="text-xs text-[#6ce182] font-semibold uppercase tracking-wider">
                GENERATED PROMPT
              </div>
              <div className="text-xs text-white font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {message.generatedResult.prompt}
              </div>
              {message.generatedResult.explanation && (
                <div className="pt-2 border-t border-[#374151]">
                  <p className="text-xs text-gray-400">
                    {message.generatedResult.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Alternative strategies */}
            {message.generatedResult.alternatives &&
              message.generatedResult.alternatives.length > 0 && (
                <div className="bg-[#15171e] border border-[#1f2937] rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    ALTERNATIVES
                  </div>
                  {message.generatedResult.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-300 py-1 border-b border-[#1f2937] last:border-0"
                    >
                      <span className="font-semibold">{alt.name}</span>
                      {alt.description && (
                        <span className="text-gray-500">
                          {" "}
                          - {alt.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-transparent border border-[#374151] text-gray-300 text-xs font-semibold rounded hover:border-gray-500 transition-colors"
                onClick={onRetry}
              >
                Start Over
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-[#6ce182] border border-[#6ce182] text-black text-xs font-semibold rounded hover:bg-[#5bd174] transition-colors"
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
