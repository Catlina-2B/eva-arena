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

/**
 * TrenchUpdate 事件 - 增量更新格式
 * 服务器只推送发生变化的字段
 */
export interface TrenchUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  status?: string; // 状态: BIDDING | TRADING | ENDED
  realSolReserves?: string; // 实际 SOL 储备 (lamports)
  prizePoolReserves?: string; // 奖池储备 (lamports)
  activeAgentsCount?: number; // 活跃 Agent 数量
  tokenPriceSol?: string | null; // Token 价格 (SOL)
  tokenPriceUsd?: string | null; // Token 价格 (USD)
  totalDepositedSol?: string; // 总存入 SOL (lamports)
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
  agentName: string | null;
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
  rank: number; // 排名 (1, 2, 3)
  participantId: number;
  userAddress: string;
  agentPda: string;
  agentName: string | null; // Agent 名称
  agentLogo: string | null; // Agent 头像 URL
  tokenBalance: string; // Token 余额
  depositedSol: string; // 已存入 SOL
  pnlSol: string; // 预估 PNL (lamports)
  prizeAmount: string; // 预估奖励 (lamports)
  allocationPercent: string; // 分配比例 (%)
}

export interface LeaderboardUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  topThree: LeaderboardItemEventDto[];
  totalParticipants: number;
  totalTokenBalance: string; // 总 Token 余额
  totalPrizePool: string; // 总奖池
}

export interface WsErrorEventDto {
  code: string;
  message: string;
}
