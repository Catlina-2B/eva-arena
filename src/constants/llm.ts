/**
 * LLM model options for agent creation and editing
 */

export type LlmSource = "platform" | "custom";

/** 官方默认模型：Deepseek R1 */
export const DEFAULT_LLM_PLATFORM = {
  provider: "PLATFORM" as const,
  model: "deepseek-r1",
  label: "Deepseek R1 (官方)",
};

/** Dropdown option labels */
export const LLM_SOURCE_LABELS: Record<LlmSource, string> = {
  platform: "Platform LLM (Deepseek R1)",
  custom: "Configure your own LLM",
};
