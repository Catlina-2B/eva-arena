/**
 * API Services - Centralized export
 */

export { apiClient, API_BASE_URL } from "./client";
export type { ApiResponse, ApiError } from "./client";

export { authApi } from "./auth";
export { agentApi } from "./agents";
export { trenchApi } from "./trenches";
export type { UserTrenchSummaryDto } from "./trenches";
export { strategyApi } from "./strategies";
export { priceApi } from "./price";
export { referralApi } from "./referral";
export { walletApi } from "./wallet";
export { manualTradeApi } from "./manual-trade";
export type {
  ManualTradeResponse,
  ManualPosition,
  ManualBalance,
  ManualHistoryItem,
  ManualHistoryResponse,
  ExportStrategyResponse,
} from "./manual-trade";
export type {
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransactionDto,
  WalletTransactionListResponseDto,
  GetTransactionsQueryDto,
} from "./wallet";
