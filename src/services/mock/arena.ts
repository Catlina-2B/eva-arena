import type { ActivityItem, AgentRanking, ArenaRound, Winner } from "@/types";

export const mockArenaRound: ArenaRound = {
  id: "eva-121506",
  trenchDbId: 1,
  tokenName: "EVA-121506",
  startBlock: 121506,
  currentBlock: 841,
  totalBlocks: 3000,
  phase: "betting",
  totalSol: 20,
  totalPrizePool: 16,
  tokenPrice: 0.0005,
  activeAgents: 168,
  tokenAlloc: 50,
  lpAlloc: 20,
  prizeFund: 80,
  hasBets: true,
};

// Mock data for trading phase
export const mockTradingRound: ArenaRound = {
  id: "eva-121506",
  trenchDbId: 1,
  tokenName: "EVA-121506",
  startBlock: 121506,
  currentBlock: 1500,
  totalBlocks: 3000,
  phase: "trading",
  totalSol: 153.775,
  totalPrizePool: 123.02,
  tokenPrice: 0.001914,
  activeAgents: 168,
  tokenAlloc: 50,
  lpAlloc: 20,
  prizeFund: 80,
  hasBets: true,
};

// Mock data for skipped round (no bets)
export const mockSkippedRound: ArenaRound = {
  id: "eva-121507",
  trenchDbId: 2,
  tokenName: "EVA-121507",
  startBlock: 121507,
  currentBlock: 500,
  totalBlocks: 3000,
  phase: "trading",
  totalSol: 0,
  totalPrizePool: 0,
  tokenPrice: 0,
  activeAgents: 0,
  tokenAlloc: 50,
  lpAlloc: 20,
  prizeFund: 80,
  hasBets: false,
  nextRoundCountdown: 6,
};

// Mock winners for settlement phase
export const mockWinners: Winner[] = [
  {
    rank: 1,
    agentId: "agent-1",
    agentName: "Agent-1",
    prize: 24.02,
    percentage: 50,
  },
  {
    rank: 2,
    agentId: "agent-2",
    agentName: "Agent-2",
    prize: 12.02,
    percentage: 30,
  },
  {
    rank: 3,
    agentId: "agent-3",
    agentName: "Agent-3",
    prize: 5.02,
    percentage: 15,
  },
  {
    rank: 4,
    agentId: "others",
    agentName: "Others",
    prize: 1.02,
    percentage: 5,
  },
];

// Mock data for settlement phase
export const mockSettlementRound: ArenaRound = {
  id: "eva-121506",
  trenchDbId: 1,
  tokenName: "EVA-121506",
  startBlock: 121506,
  currentBlock: 2900,
  totalBlocks: 3000,
  phase: "liquidation",
  totalSol: 153.775,
  totalPrizePool: 123.02,
  tokenPrice: 0.005,
  activeAgents: 168,
  tokenAlloc: 50,
  lpAlloc: 20,
  prizeFund: 80,
  hasBets: true,
  winners: mockWinners,
  nextRoundCountdown: 6,
};

export const mockRankings: AgentRanking[] = [
  {
    rank: 1,
    agentId: "agent-1",
    agentName: "Agent 1",
    tokenAmount: 60231210,
    pnlSol: 12.04,
    supplyPercentage: 17.96,
  },
  {
    rank: 2,
    agentId: "agent-2",
    agentName: "Agent 2",
    tokenAmount: 45101000,
    pnlSol: 8.55,
    supplyPercentage: 12.15,
  },
  {
    rank: 3,
    agentId: "agent-3",
    agentName: "Agent 3",
    tokenAmount: 31600420,
    pnlSol: 4.1,
    supplyPercentage: 8.96,
  },
  {
    rank: 4,
    agentId: "my-agent",
    agentName: "My Agent",
    agentAvatar: undefined,
    tokenAmount: 45201000,
    pnlSol: 8.55,
    supplyPercentage: 12.15,
    isOwned: true,
  },
  {
    rank: 5,
    agentId: "agent-5",
    agentName: "My Agent",
    tokenAmount: 45201000,
    pnlSol: 8.55,
    supplyPercentage: 12.15,
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "deposit",
    agentId: "agent-1",
    agentName: "Agent-1",
    tokenAmount: 5492,
    solAmount: 0.4,
    timestamp: new Date(),
  },
  {
    id: "2",
    type: "withdraw",
    agentId: "agent-1",
    agentName: "Agent-1",
    tokenAmount: 1231,
    solAmount: 0.1,
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "3",
    type: "deposit",
    agentId: "agent-1",
    agentName: "Agent-1",
    tokenAmount: 5492,
    solAmount: 0.4,
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "4",
    type: "withdraw",
    agentId: "agent-1",
    agentName: "Agent-1",
    tokenAmount: 1231,
    solAmount: 0.1,
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "5",
    type: "deposit",
    agentId: "agent-1",
    agentName: "Agent-1",
    tokenAmount: 5492,
    solAmount: 0.4,
    timestamp: new Date(Date.now() - 240000),
  },
];

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 10) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}
