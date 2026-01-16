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
export { walletApi } from "./wallet";
export type {
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransactionDto,
  WalletTransactionListResponseDto,
  GetTransactionsQueryDto,
} from "./wallet";

export { whitelistApi } from "./whitelist";
export type { WhitelistCheckResponseDto } from "./whitelist";
