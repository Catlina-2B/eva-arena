import type { Agent, AgentHistoryRound, TradeRecord } from "@/types";
import type { ExecutionLogEntry } from "@/components/arena/agent-dashboard-card";

export const mockAgent: Agent = {
  id: "eva-1",
  name: "Agent - 007",
  avatar: undefined,
  createdAt: new Date("2025-12-10T16:33:22"),
  status: "paused",
  balance: 231.0,
  totalDeposit: 100.0,
  totalWithdraw: 45.5,
  pnl: 324.12,
  frequency: 10,
};

// Mock execution logs for agent dashboard
export const mockExecutionLogs: ExecutionLogEntry[] = [
  {
    id: "1",
    agentId: "Eva-83000",
    phase: "Betting Phase",
    action: "Deposit",
    amount: 300,
  },
  {
    id: "2",
    agentId: "Eva-83000",
    phase: "Betting Phase",
    action: "Withdraw",
    amount: 300,
  },
  {
    id: "3",
    agentId: "Eva-83000",
    phase: "Trading Phase",
    action: "Buy",
    amount: 100,
  },
  {
    id: "4",
    agentId: "Eva-83000",
    phase: "Trading Phase",
    action: "Sell",
    amount: 10,
  },
  {
    id: "5",
    agentId: "Eva-83000",
    phase: "Liquidation",
    action: "Reward",
    amount: 10,
  },
];

export const mockAgentHistory: AgentHistoryRound[] = [
  {
    roundId: "eva-83999",
    tokenName: "EVA - 83999",
    rank: 45,
    pnl: -0.45,
    prize: 0.0,
    trades: 24,
  },
  {
    roundId: "eva-84000",
    tokenName: "EVA - 84000",
    rank: 12,
    pnl: 22.21,
    prize: 22.21,
    trades: 50,
  },
];

export const mockTrades: TradeRecord[] = [
  {
    id: "1",
    timestamp: new Date("2025-12-10T23:43:22"),
    type: "reward",
    tokenSymbol: "EVA",
    amount: 123.21,
    price: 0.0003,
    total: 0.0003,
    txHash: "5xBa...0F21",
    reasoning: "Top 10 finish reward",
  },
  {
    id: "2",
    timestamp: new Date("2025-12-10T23:43:22"),
    type: "buy",
    tokenSymbol: "EVA",
    amount: 123.21,
    price: null,
    total: 0.0003,
    txHash: "7yPq...3K89",
    reasoning: "Market opportunity detected",
  },
  {
    id: "3",
    timestamp: new Date("2025-12-10T23:43:22"),
    type: "withdraw",
    tokenSymbol: "EVA",
    amount: 123.21,
    price: null,
    total: 0.0003,
    txHash: "8zRt...4L90",
    reasoning: "User requested withdrawal",
  },
  {
    id: "4",
    timestamp: new Date("2025-12-10T23:43:22"),
    type: "deposit",
    tokenSymbol: "EVA",
    amount: 123.21,
    price: 0.0003,
    total: 0.0003,
    txHash: "9aSu...5M01",
    reasoning: "Initial deposit",
  },
];
