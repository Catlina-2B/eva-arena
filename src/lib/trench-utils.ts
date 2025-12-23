/**
 * Utility functions for converting between backend Trench data and frontend types
 */

import type {
  TrenchDetailDto,
  LeaderboardResponseDto,
  TransactionDto,
} from "@/types/api";
import type {
  ArenaRound,
  ArenaPhase,
  AgentRanking,
  ActivityItem,
} from "@/types";

/**
 * Block timing constants
 * Based on Solana's ~400ms block time
 */
export const BLOCK_TIMING = {
  BIDDING_BLOCKS: 300, // First 300 blocks (~2 min)
  TRADING_BLOCKS: 2400, // Next 2400 blocks (~16 min)
  LIQUIDATION_BLOCKS: 300, // Final 300 blocks (~2 min)
  TOTAL_BLOCKS: 3000, // Total round duration
  MS_PER_BLOCK: 400, // ~400ms per block on Solana
};

/**
 * Convert Trench status to frontend phase
 *
 * Backend status mapping:
 * - BIDDING -> betting (竞价阶段)
 * - TRADING -> trading (交易阶段)
 * - ENDED -> liquidation (清算/结算阶段)
 */
export function statusToPhase(status: string): ArenaPhase {
  switch (status) {
    case "BIDDING":
      return "betting";
    case "TRADING":
      return "trading";
    case "ENDED":
      return "liquidation";
    default:
      return "betting";
  }
}

/**
 * Calculate current block progress within a trench using Solana slot
 *
 * Uses backend status directly to determine phase:
 * - BIDDING: 竞价阶段 (前 300 区块)
 * - TRADING: 交易阶段 (300-2700 区块)
 * - ENDED: 清算阶段 (2700-3000 区块)
 *
 * @param trench - Trench detail from API
 * @param currentSlot - Current Solana slot from RPC (optional, falls back to time-based estimate)
 */
export function calculateBlockProgress(
  trench: TrenchDetailDto,
  currentSlot?: number,
): {
  currentBlock: number;
  totalBlocks: number;
  phase: ArenaPhase;
} {
  const biddingStart = parseInt(trench.biddingStartBlock);

  // Total blocks includes all phases: betting (300) + trading (2400) + liquidation (300) = 3000
  const totalBlocks = BLOCK_TIMING.TOTAL_BLOCKS;

  // Use backend status directly for phase
  const phase = statusToPhase(trench.status);

  // Calculate current block using Solana slot
  let currentBlock = 0;

  if (currentSlot !== undefined) {
    // Use actual Solana slot: currentBlock = currentSlot - biddingStartBlock
    currentBlock = Math.max(0, currentSlot - biddingStart);
    currentBlock = Math.min(currentBlock, totalBlocks);
  } else {
    // Fallback: estimate based on time (less accurate)
    const biddingEnd = parseInt(trench.biddingEndBlock);
    const biddingDuration = biddingEnd - biddingStart;

    if (trench.status === "BIDDING") {
      if (trench.startTime) {
        const elapsed = Date.now() - new Date(trench.startTime).getTime();

        currentBlock = Math.min(
          Math.floor(elapsed / BLOCK_TIMING.MS_PER_BLOCK),
          biddingDuration - 1,
        );
      }
    } else if (trench.status === "TRADING") {
      if (trench.tradingStartTime) {
        const elapsed =
          Date.now() - new Date(trench.tradingStartTime).getTime();

        currentBlock =
          biddingDuration +
          Math.min(
            Math.floor(elapsed / BLOCK_TIMING.MS_PER_BLOCK),
            BLOCK_TIMING.TRADING_BLOCKS - 1,
          );
      } else {
        currentBlock = biddingDuration;
      }
    } else if (trench.status === "ENDED") {
      currentBlock = totalBlocks;
    }
  }

  return { currentBlock, totalBlocks, phase };
}

/**
 * Convert TrenchDetailDto to ArenaRound for UI components
 *
 * @param trench - Trench detail from API
 * @param currentSlot - Current Solana slot from RPC (optional)
 */
export function trenchToArenaRound(
  trench: TrenchDetailDto | null,
  currentSlot?: number,
): ArenaRound | null {
  if (!trench) return null;

  const { currentBlock, totalBlocks, phase } = calculateBlockProgress(
    trench,
    currentSlot,
  );

  // Calculate prize pool from deposited SOL (80% goes to prize pool)
  const totalDepositedSol = parseFloat(trench.totalDepositedSol) / 1e9; // lamports to SOL
  const prizePool = totalDepositedSol * 0.8;

  // Get token price
  const tokenPrice = trench.currentTokenPriceSol
    ? parseFloat(trench.currentTokenPriceSol)
    : 0;

  // Check if there are bets (participants > 0)
  const hasBets = trench.participantCount > 0;

  return {
    id: `eva-${trench.trenchId}`,
    tokenName: trench.tokenSymbol || `EVA-${trench.trenchId}`,
    startBlock: parseInt(trench.biddingStartBlock),
    currentBlock,
    totalBlocks,
    phase,
    totalPrizePool: prizePool,
    tokenPrice,
    activeAgents: trench.activeAgentsCount,
    tokenAlloc: 50,
    lpAlloc: 20,
    prizeFund: 80,
    hasBets,
    nextRoundCountdown: phase === "liquidation" ? 6 : undefined,
  };
}

/**
 * Convert LeaderboardResponseDto to AgentRanking array
 */
export function leaderboardToRankings(
  leaderboard: LeaderboardResponseDto | undefined,
  currentUserAddress?: string,
): AgentRanking[] {
  if (!leaderboard) return [];

  const rankings: AgentRanking[] = [];

  // Add top three
  for (const item of leaderboard.topThree) {
    rankings.push({
      rank: item.rank,
      agentId: item.agentId || item.userAddress,
      agentName: item.agentName || `Agent ${item.userAddress.slice(0, 8)}`,
      agentAvatar: undefined,
      tokenAmount: parseInt(item.tokenBalance) / 1e6, // Adjust decimals
      solValue: parseFloat(item.depositedSol) / 1e9,
      supplyPercentage: 0, // Would need total supply to calculate
      isOwned: item.isCurrentUser || item.userAddress === currentUserAddress,
    });
  }

  // Add current user if not in top three
  if (leaderboard.currentUser && leaderboard.currentUser.rank > 3) {
    rankings.push({
      rank: leaderboard.currentUser.rank,
      agentId:
        leaderboard.currentUser.agentId || leaderboard.currentUser.userAddress,
      agentName: leaderboard.currentUser.agentName || "My Agent",
      tokenAmount: parseInt(leaderboard.currentUser.tokenBalance) / 1e6,
      solValue: parseFloat(leaderboard.currentUser.depositedSol) / 1e9,
      supplyPercentage: 0,
      isOwned: true,
    });
  }

  return rankings;
}

/**
 * Convert TransactionDto array to ActivityItem array
 */
export function transactionsToActivities(
  transactions: TransactionDto[] | undefined,
): ActivityItem[] {
  if (!transactions) return [];

  // Include DEPOSIT, WITHDRAW, BUY, and SELL transaction types
  const validTypes = ["DEPOSIT", "WITHDRAW", "BUY", "SELL"];

  return transactions
    .filter((tx) => validTypes.includes(tx.txType))
    .slice(0, 10)
    .map((tx) => ({
      id: tx.id.toString(),
      type: tx.txType.toLowerCase() as "deposit" | "withdraw" | "buy" | "sell",
      agentId: tx.userAddress,
      agentName: `Agent ${tx.userAddress.slice(0, 8)}`,
      tokenAmount: tx.tokenAmount ? parseInt(tx.tokenAmount) / 1e6 : 0,
      solAmount: tx.solAmount ? parseFloat(tx.solAmount) / 1e9 : 0,
      timestamp: new Date(tx.createdAt),
    }));
}

/**
 * Format SOL amount from lamports
 */
export function lamportsToSol(lamports: string | number): number {
  const value = typeof lamports === "string" ? parseFloat(lamports) : lamports;

  return value / 1e9;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;

  return num.toFixed(2);
}
