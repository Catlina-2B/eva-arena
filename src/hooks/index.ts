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
  agentKeys,
} from "./use-agents";

// Trench hooks
export {
  useTrenchList,
  useCurrentTrench,
  useTrenchDetail,
  usePriceCurve,
  useTrenchTransactions,
  useLeaderboard,
  useTrenchSummary,
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
