import { apiClient } from "./client";

// ======== Enums (matching backend DTOs) ========

export enum WalletTransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

export enum WalletTransactionStatus {
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  FAILED = "FAILED",
}

// ======== Query DTOs ========

export interface GetTransactionsQueryDto {
  type?: WalletTransactionType;
  page?: number;
  limit?: number;
}

// ======== Response DTOs ========

export interface WalletTransactionDto {
  type: WalletTransactionType;
  signature: string;
  timeAgo: string;
  timestamp: number;
  amount: string; // formatted with sign: "+ 10.00" or "- 5.50"
  amountRaw: string;
  status: WalletTransactionStatus;
}

export interface WalletTransactionListResponseDto {
  transactions: WalletTransactionDto[];
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ======== API Service ========

export const walletApi = {
  /**
   * Get wallet transactions
   * 获取钱包交易记录（充值/提现）
   */
  getTransactions: async (
    params?: GetTransactionsQueryDto
  ): Promise<WalletTransactionListResponseDto> => {
    const response = await apiClient.get<WalletTransactionListResponseDto>(
      "/api/wallet/transactions",
      { params }
    );

    return response.data;
  },
};
