import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useGenerateStrategyPrompt,
  useStrategyWizardConfig,
} from "@/hooks/use-agents";
import type {
  CustomInputConfig,
  GeneratePromptResponse,
  PhaseWizardConfig,
  WizardOption,
  WizardPhase,
  WizardQuestion,
} from "@/types/api";

// Validate input based on customInput config
function validateInput(
  value: string,
  config: CustomInputConfig | undefined,
): { isValid: boolean; error?: string } {
  if (!value.trim()) {
    return { isValid: false, error: "Please enter a value" };
  }

  if (!config) {
    return { isValid: true };
  }

  if (config.type === "number") {
    // Check if it's a valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: "Please enter a valid number" };
    }

    // Check min constraint
    if (config.validation?.min !== undefined && numValue < config.validation.min) {
      return {
        isValid: false,
        error: `Value must be at least ${config.validation.min}`,
      };
    }

    // Check max constraint
    if (config.validation?.max !== undefined && numValue > config.validation.max) {
      return {
        isValid: false,
        error: `Value must be at most ${config.validation.max}`,
      };
    }
  }

  return { isValid: true };
}

// Format input based on type (e.g., only allow numbers for number type)
function formatInputValue(
  value: string,
  config: CustomInputConfig | undefined,
): string {
  if (!config || config.type !== "number") {
    return value;
  }

  // Allow only numbers, decimal point, and minus sign
  // Remove any non-numeric characters except . and -
  return value.replace(/[^0-9.\-]/g, "");
}

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

// Message types
interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  questionId?: string;
  options?: WizardOption[];
  isGenerateStep?: boolean;
  generatedResult?: GeneratePromptResponse;
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
  const { data: wizardConfig, isLoading: isLoadingConfig } =
    useStrategyWizardConfig();
  const generateMutation = useGenerateStrategyPrompt();

  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [waitingForCustomInput, setWaitingForCustomInput] = useState<
    string | null
  >(null);
  const [generatedResult, setGeneratedResult] =
    useState<GeneratePromptResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get phase config
  const phaseConfig: PhaseWizardConfig | undefined = useMemo(() => {
    if (!wizardConfig) return undefined;
    return phase === "betting" ? wizardConfig.betting : wizardConfig.trading;
  }, [wizardConfig, phase]);

  // Get all questions flattened
  const allQuestions: WizardQuestion[] = useMemo(() => {
    if (!phaseConfig) return [];
    return phaseConfig.steps.flatMap((step) => step.questions);
  }, [phaseConfig]);

  // Get current custom input config
  const currentCustomInputConfig = useMemo(() => {
    if (!waitingForCustomInput) return undefined;
    const question = allQuestions.find((q) => q.id === waitingForCustomInput);
    return question?.customInput;
  }, [waitingForCustomInput, allQuestions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages when drawer opens
  useEffect(() => {
    if (isOpen && phaseConfig && allQuestions.length > 0) {
      // Reset state
      setMessages([]);
      setAnswers({});
      setCustomValues({});
      setCurrentQuestionIndex(0);
      setGeneratedResult(null);
      setWaitingForCustomInput(null);
      setInputValue("");
      setInputError(null);

      // Add welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        type: "ai",
        content: `I'm here to help you generate your ${phase === "betting" ? "free betting" : "free trading"} strategy.`,
      };

      // Add first question
      const firstQuestion = allQuestions[0];
      const questionMessage: Message = {
        id: `q-${firstQuestion.id}`,
        type: "ai",
        content: firstQuestion.text,
        questionId: firstQuestion.id,
        options: firstQuestion.options,
      };

      setMessages([welcomeMessage, questionMessage]);
    }
  }, [isOpen, phaseConfig, allQuestions, phase]);

  // Handle option selection
  const handleOptionSelect = useCallback(
    (questionId: string, option: WizardOption) => {
      const question = allQuestions.find((q) => q.id === questionId);
      if (!question) return;

      // Check if this is a custom option that needs input
      if (option.value === "custom" && question.customInput) {
        setWaitingForCustomInput(questionId);
        setInputError(null);
        setInputValue("");
        inputRef.current?.focus();
        return;
      }

      // Add user response message
      const userMessage: Message = {
        id: `user-${questionId}`,
        type: "user",
        content: option.label,
      };

      // Update answers
      if (question.type === "multi_choice") {
        const currentAnswers = (answers[questionId] as string[]) || [];
        const newAnswers = currentAnswers.includes(option.value)
          ? currentAnswers.filter((v) => v !== option.value)
          : [...currentAnswers, option.value];
        setAnswers((prev) => ({ ...prev, [questionId]: newAnswers }));

        // For multi-choice, don't advance automatically
        // Add a visual indication instead
        setMessages((prev) => {
          // Remove previous user message for this question if exists
          const filtered = prev.filter(
            (m) => !(m.type === "user" && m.id === `user-${questionId}`),
          );
          return [
            ...filtered,
            {
              ...userMessage,
              content: newAnswers
                .map(
                  (v) =>
                    question.options?.find((o) => o.value === v)?.label || v,
                )
                .join(", "),
            },
          ];
        });
        return;
      }

      // Single choice - update and advance
      setAnswers((prev) => ({ ...prev, [questionId]: option.value }));
      setMessages((prev) => [...prev, userMessage]);

      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < allQuestions.length) {
        const nextQuestion = allQuestions[nextIndex];
        const nextMessage: Message = {
          id: `q-${nextQuestion.id}`,
          type: "ai",
          content: nextQuestion.text,
          questionId: nextQuestion.id,
          options: nextQuestion.options,
        };

        setTimeout(() => {
          setMessages((prev) => [...prev, nextMessage]);
          setCurrentQuestionIndex(nextIndex);
        }, 300);
      } else {
        // All questions answered, show generate button
        setTimeout(() => {
          const generateMessage: Message = {
            id: "generate",
            type: "ai",
            content:
              "Do you have any additional strategies? Or shall I generate the strategy directly?",
            isGenerateStep: true,
          };
          setMessages((prev) => [...prev, generateMessage]);
        }, 300);
      }
    },
    [allQuestions, answers, currentQuestionIndex],
  );

  // Handle multi-choice confirm
  const handleMultiChoiceConfirm = useCallback(
    (questionId: string) => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < allQuestions.length) {
        const nextQuestion = allQuestions[nextIndex];
        const nextMessage: Message = {
          id: `q-${nextQuestion.id}`,
          type: "ai",
          content: nextQuestion.text,
          questionId: nextQuestion.id,
          options: nextQuestion.options,
        };

        setTimeout(() => {
          setMessages((prev) => [...prev, nextMessage]);
          setCurrentQuestionIndex(nextIndex);
        }, 300);
      } else {
        // All questions answered
        setTimeout(() => {
          const generateMessage: Message = {
            id: "generate",
            type: "ai",
            content:
              "Do you have any additional strategies? Or shall I generate the strategy directly?",
            isGenerateStep: true,
          };
          setMessages((prev) => [...prev, generateMessage]);
        }, 300);
      }
    },
    [allQuestions, currentQuestionIndex],
  );

  // Handle custom input submit
  const handleCustomInputSubmit = useCallback(() => {
    if (!waitingForCustomInput || !inputValue.trim()) return;

    const questionId = waitingForCustomInput;
    const question = allQuestions.find((q) => q.id === questionId);
    if (!question) return;

    // Validate input
    const validation = validateInput(inputValue.trim(), question.customInput);
    if (!validation.isValid) {
      setInputError(validation.error || "Invalid input");
      return;
    }

    // Clear error
    setInputError(null);

    // Add user response
    const userMessage: Message = {
      id: `user-${questionId}`,
      type: "user",
      content: inputValue.trim(),
    };

    setAnswers((prev) => ({ ...prev, [questionId]: "custom" }));
    setCustomValues((prev) => ({ ...prev, [questionId]: inputValue.trim() }));
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setWaitingForCustomInput(null);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < allQuestions.length) {
      const nextQuestion = allQuestions[nextIndex];
      const nextMessage: Message = {
        id: `q-${nextQuestion.id}`,
        type: "ai",
        content: nextQuestion.text,
        questionId: nextQuestion.id,
        options: nextQuestion.options,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, nextMessage]);
        setCurrentQuestionIndex(nextIndex);
      }, 300);
    } else {
      setTimeout(() => {
        const generateMessage: Message = {
          id: "generate",
          type: "ai",
          content:
            "Do you have any additional strategies? Or shall I generate the strategy directly?",
          isGenerateStep: true,
        };
        setMessages((prev) => [...prev, generateMessage]);
      }, 300);
    }
  }, [waitingForCustomInput, inputValue, allQuestions, currentQuestionIndex]);

  // Handle generate
  const handleGenerate = useCallback(async () => {
    const userMessage: Message = {
      id: "user-generate",
      type: "user",
      content: "Generate Strategy",
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await generateMutation.mutateAsync({
        phase,
        answers,
        customValues: Object.keys(customValues).length > 0 ? customValues : undefined,
      });

      setGeneratedResult(result);

      // Add result message
      const resultMessage: Message = {
        id: "result",
        type: "ai",
        content: "Okay, generating your strategy.",
        generatedResult: result,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, resultMessage]);
      }, 300);
    } catch (error) {
      console.error("Failed to generate strategy:", error);
      const errorMessage: Message = {
        id: "error",
        type: "ai",
        content: "Sorry, failed to generate strategy. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [phase, answers, customValues, generateMutation]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (!phaseConfig || allQuestions.length === 0) return;

    setMessages([]);
    setAnswers({});
    setCustomValues({});
    setCurrentQuestionIndex(0);
    setGeneratedResult(null);
    setWaitingForCustomInput(null);
    setInputValue("");
    setInputError(null);

    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content: `I'm here to help you generate your ${phase === "betting" ? "free betting" : "free trading"} strategy.`,
    };

    const firstQuestion = allQuestions[0];
    const questionMessage: Message = {
      id: `q-${firstQuestion.id}`,
      type: "ai",
      content: firstQuestion.text,
      questionId: firstQuestion.id,
      options: firstQuestion.options,
    };

    setMessages([welcomeMessage, questionMessage]);
  }, [phaseConfig, allQuestions, phase]);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (generatedResult) {
      onConfirm(generatedResult.prompt);
      onClose();
    }
  }, [generatedResult, onConfirm, onClose]);

  // Get current question for determining if we need multi-choice confirm
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isCurrentMultiChoice = currentQuestion?.type === "multi_choice";
  const hasMultiChoiceSelection =
    isCurrentMultiChoice &&
    currentQuestion &&
    (answers[currentQuestion.id] as string[])?.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#0a0c14] border-l border-[#1f2937] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
          <div className="flex items-center gap-2">
            <span className="text-[#6ce182] font-mono text-xs">///</span>
            <span className="text-white font-semibold text-sm tracking-wider">
              AI PROMPT
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
          {isLoadingConfig ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size={24} />
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                answers={answers}
                onOptionSelect={handleOptionSelect}
                onGenerate={handleGenerate}
                onRetry={handleRetry}
                onConfirm={handleConfirm}
                isGenerating={generateMutation.isPending}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Multi-choice confirm button */}
        {hasMultiChoiceSelection && !generatedResult && (
          <div className="px-4 pb-2">
            <button
              type="button"
              className="w-full py-2 bg-[#6ce182] text-black font-semibold text-sm rounded hover:bg-[#5bd174] transition-colors"
              onClick={() => handleMultiChoiceConfirm(currentQuestion.id)}
            >
              Continue
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#1f2937]">
          {/* Error message */}
          {inputError && (
            <div className="mb-2 px-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
              {inputError}
            </div>
          )}
          <div
            className={`flex items-center gap-2 bg-[#15171e] border rounded px-3 py-2 ${
              inputError ? "border-red-500/50" : "border-[#1f2937]"
            }`}
          >
            <input
              ref={inputRef}
              type={currentCustomInputConfig?.type === "number" ? "text" : "text"}
              inputMode={currentCustomInputConfig?.type === "number" ? "decimal" : "text"}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
              placeholder={
                waitingForCustomInput
                  ? currentCustomInputConfig?.placeholder || "Enter custom value..."
                  : "Type a message..."
              }
              value={inputValue}
              onChange={(e) => {
                const formatted = formatInputValue(e.target.value, currentCustomInputConfig);
                setInputValue(formatted);
                // Clear error when user starts typing
                if (inputError) {
                  setInputError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomInputSubmit();
                }
              }}
              disabled={!waitingForCustomInput}
            />
            <button
              type="button"
              className="p-1 text-[#6ce182] hover:text-[#5bd174] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCustomInputSubmit}
              disabled={!waitingForCustomInput || !inputValue.trim()}
            >
              <SendIcon />
            </button>
          </div>
          {/* Input hint */}
          {waitingForCustomInput && currentCustomInputConfig && (
            <div className="mt-1.5 text-xs text-gray-500">
              {currentCustomInputConfig.type === "number" && (
                <span>
                  Enter a number
                  {currentCustomInputConfig.validation?.min !== undefined &&
                    ` (min: ${currentCustomInputConfig.validation.min})`}
                  {currentCustomInputConfig.validation?.max !== undefined &&
                    ` (max: ${currentCustomInputConfig.validation.max})`}
                </span>
              )}
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
  answers,
  onOptionSelect,
  onGenerate,
  onRetry,
  onConfirm,
  isGenerating,
}: {
  message: Message;
  answers: Record<string, string | string[]>;
  onOptionSelect: (questionId: string, option: WizardOption) => void;
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
          <p className="text-sm text-gray-300 font-mono leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Options */}
        {message.options && message.questionId && (
          <div className="flex flex-wrap gap-2">
            {message.options.map((option) => {
              const answer = answers[message.questionId!];
              const isSelected = Array.isArray(answer)
                ? answer.includes(option.value)
                : answer === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                    isSelected
                      ? "bg-[#6ce182] border-[#6ce182] text-black"
                      : "bg-transparent border-[#374151] text-gray-300 hover:border-[#6ce182] hover:text-[#6ce182]"
                  }`}
                  onClick={() => onOptionSelect(message.questionId!, option)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Generate step */}
        {message.isGenerateStep && !message.generatedResult && (
          <button
            type="button"
            className="px-4 py-2 bg-transparent border border-[#374151] text-gray-300 text-xs font-mono rounded hover:border-[#6ce182] hover:text-[#6ce182] transition-colors disabled:opacity-50"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size={12} />
                Generating...
              </span>
            ) : (
              "Generate Strategy"
            )}
          </button>
        )}

        {/* Generated result */}
        {message.generatedResult && (
          <div className="space-y-3">
            <div className="bg-[#1a1d27] border border-[#6ce182]/30 rounded-lg p-3 space-y-2">
              <div className="text-xs text-[#6ce182] font-semibold uppercase tracking-wider">
                STRATEGY GENERATED
              </div>
              {Object.entries(message.generatedResult.summary).map(
                ([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="text-white font-mono">{value}</span>
                  </div>
                ),
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-transparent border border-[#374151] text-gray-300 text-xs font-semibold rounded hover:border-gray-500 transition-colors"
                onClick={onRetry}
              >
                Retry
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

