/**
 * WebSocket Event Types - Based on backend ws-events.dto.ts
 */

// ============== Event Types ==============

export enum WsEventType {
  // Client -> Server
  SUBSCRIBE_TRENCH = "subscribeTrench",
  UNSUBSCRIBE_TRENCH = "unsubscribeTrench",

  // Server -> Client
  TRENCH_UPDATE = "trenchUpdate",
  PRICE_UPDATE = "priceUpdate",
  TRANSACTION = "transaction",
  LEADERBOARD_UPDATE = "leaderboardUpdate",
  ERROR = "error",
}

// ============== Message Format ==============

export interface WsMessage<T> {
  event: WsEventType;
  data: T;
  timestamp: number;
}

// ============== Subscribe/Unsubscribe ==============

export interface SubscribeTrenchDto {
  trenchId: number;
}

export interface SubscribeTrenchResponse {
  success: boolean;
  trenchId: number;
  room: string;
}

// ============== Event Data Types ==============

export interface TrenchUpdateEventDto {
  id: number;
  trenchId: string;
  trenchPda: string;
  status: string;
  totalDepositedSol: string;
  participantCount: number;
  activeAgentsCount: number;
  transactionCount: number;
  totalBidSol: string;
  currentTokenPriceSol: string | null;
  currentTokenPriceUsd: string | null;
  updatedAt: string;
}

export interface PriceUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  timestamp: number;
  priceSol: string;
  priceUsd: string | null;
  txType: "BUY" | "SELL";
  solAmount: string;
  tokenAmount: string;
  signature: string;
}

export interface TransactionEventDto {
  id: number;
  trenchId: number;
  txType: string;
  userAddress: string;
  solAmount: string | null;
  tokenAmount: string | null;
  totalDeposited: string | null;
  solAmountUsd: string | null;
  tokenPriceSol: string | null;
  tokenPriceUsd: string | null;
  signature: string;
  slot: number;
  blockTime: number | null;
  createdAt: string;
}

export interface LeaderboardItemEventDto {
  rank: number;
  participantId: number;
  userAddress: string;
  agentPda: string;
  agentName: string | null;
  tokenBalance: string;
  depositedSol: string;
  pnlSol: string;
}

export interface LeaderboardUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  topThree: LeaderboardItemEventDto[];
  totalParticipants: number;
}

export interface WsErrorEventDto {
  code: string;
  message: string;
}
