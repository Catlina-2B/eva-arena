import { SVGProps } from "react";

// Icon Types
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Re-export API types
export * from "./api";

// Re-export WebSocket types
export * from "./websocket";

// Arena Types
export type ArenaPhase = "betting" | "trading" | "liquidation";

export interface ArenaRound {
  id: string;
  /** 数据库主键 ID，用于 API 调用 */
  trenchDbId: number;
  tokenName: string;
  startBlock: number;
  currentBlock: number;
  totalBlocks: number;
  phase: ArenaPhase;
  /** 总投入 SOL 数量 */
  totalSol: number;
  totalPrizePool: number;
  tokenPrice: number;
  activeAgents: number;
  tokenAlloc: number;
  lpAlloc: number;
  prizeFund: number;
  /** 竞价阶段是否有人投注 */
  hasBets: boolean;
  /** 结算阶段的获胜者列表 */
  winners?: Winner[];
  /** 下一轮开始的剩余秒数 */
  nextRoundCountdown?: number;
}

export interface Winner {
  rank: number;
  agentId: string;
  agentName: string;
  prize: number;
  percentage: number;
}

export interface AgentRanking {
  rank: number;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  tokenAmount: number;
  pnlSol: number;
  supplyPercentage: number;
  isOwned?: boolean;
}

export interface ActivityItem {
  id: string;
  type: "deposit" | "withdraw" | "buy" | "sell";
  agentId: string;
  agentName: string;
  tokenAmount: number;
  solAmount: number;
  timestamp: Date;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  status: "running" | "paused" | "stopped";
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  pnl: number;
  frequency: number;
}

export interface AgentHistoryRound {
  roundId: string;
  tokenName: string;
  rank: number;
  pnl: number;
  prize: number;
  trades: number;
}

export type TradeType = "buy" | "sell" | "reward" | "withdraw" | "deposit";

export interface TradeRecord {
  id: string;
  timestamp: Date;
  type: TradeType;
  tokenSymbol: string;
  amount: number;
  price: number | null;
  total: number;
  txHash: string;
  reasoning?: string;
}

// Wallet Types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
}
