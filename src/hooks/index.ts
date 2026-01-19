/**
 * Custom Hooks - Centralized export
 */

// Auth hooks
export {
  useLogin,
  useLogout,
  useProfile,
  useIsAuthenticated,
} from "./use-auth";
export { useWalletAuth } from "./use-wallet-auth";
export type {
  UseWalletAuthOptions,
  UseWalletAuthReturn,
} from "./use-wallet-auth";
export { useAgentCheck } from "./use-agent-check";
export type {
  UseAgentCheckOptions,
  UseAgentCheckReturn,
} from "./use-agent-check";

// Agent hooks
export {
  useMyAgents,
  useActiveAgents,
  useAgent,
  useAgentPanel,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useToggleAgentStatus,
  useAgentDeposit,
  useAgentWithdraw,
  useAgentTrenches,
  useAgentTransactions,
  useAgentLogos,
  usePromptTemplate,
  useUploadAvatar,
  useChatWizard,
  useGenerateFromChat,
  agentKeys,
} from "./use-agents";

// Trench hooks
export {
  useTrenchList,
  useCurrentTrench,
  useTrenchDetail,
  usePriceCurve,
  useTrenchTransactions,
  useUserTransactions,
  useLeaderboard,
  useTrenchSummary,
  useUserPnlTimeline,
  useTrenchHistory,
  useTrenchHistoryInfinite,
  trenchKeys,
} from "./use-trenches";

// Strategy hooks
export {
  useStrategies,
  usePublicStrategies,
  useStrategy,
  useCreateStrategy,
  useUpdateStrategy,
  useDeleteStrategy,
  strategyKeys,
} from "./use-strategies";

// Price hooks
export { useSolPrice, useSolPriceValue, priceKeys } from "./use-price";

// WebSocket hooks
export { useTrenchSocket, useSocketStatus } from "./use-trench-socket";
export type { UseTrenchSocketOptions } from "./use-trench-socket";

// Solana hooks
export {
  useSolanaSlot,
  calculateBlockProgress,
  slotKeys,
} from "./use-solana-slot";
export { useSimulatedBlock } from "./use-simulated-block";
export { useSlotSubscription } from "./use-slot-subscription";

// UI hooks
export { useFirstVisit } from "./use-first-visit";
export { useFirstDepositPrompt } from "./use-first-deposit-prompt";
export { useIntersectionObserver } from "./use-intersection-observer";

// Turnkey balance hooks
export { useTurnkeyBalance } from "./use-turnkey-balance";

// Wallet hooks
export { useWalletTransactions, walletKeys } from "./use-wallet-transactions";

// Think reason hooks
export {
  useThinkReasons,
  useLatestThinkReason,
  useThinkReasonsInfinite,
  thinkReasonKeys,
} from "./use-think-reasons";
export { useAgentThinkReason } from "./use-agent-think-reason";
export type { ThinkingStatus } from "./use-agent-think-reason";