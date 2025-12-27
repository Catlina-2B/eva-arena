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
 * Determine phase based on current block number
 *
 * Phase boundaries:
 * - betting: 0 - 299 (前 300 区块)
 * - trading: 300 - 2699 (中间 2400 区块)
 * - liquidation: 2700 - 3000 (最后 300 区块)
 */
function blockToPhase(currentBlock: number): ArenaPhase {
  if (currentBlock < BLOCK_TIMING.BIDDING_BLOCKS) {
    return "betting";
  } else if (
    currentBlock <
    BLOCK_TIMING.BIDDING_BLOCKS + BLOCK_TIMING.TRADING_BLOCKS
  ) {
    return "trading";
  } else {
    return "liquidation";
  }
}

/**
 * Calculate current block progress within a trench using Solana slot
 *
 * Phase determination:
 * - When currentSlot is available, use block-based phase calculation for real-time accuracy
 * - Otherwise, fall back to backend status
 *
 * Block boundaries:
 * - BIDDING/betting: 0-299 (前 300 区块)
 * - TRADING/trading: 300-2699 (中间 2400 区块)
 * - ENDED/liquidation: 2700-3000 (最后 300 区块)
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

  // Calculate current block using Solana slot
  let currentBlock = 0;
  let phase: ArenaPhase;

  if (currentSlot !== undefined) {
    // Use actual Solana slot: currentBlock = currentSlot - biddingStartBlock
    currentBlock = Math.max(0, currentSlot - biddingStart);
    currentBlock = Math.min(currentBlock, totalBlocks);

    // When we have real-time slot data, determine phase based on block number
    // This ensures UI shows correct phase even if backend status is delayed
    phase = blockToPhase(currentBlock);
  } else {
    // Fallback: estimate based on time (less accurate)
    const biddingEnd = parseInt(trench.biddingEndBlock);
    const biddingDuration = biddingEnd - biddingStart;

    // Use backend status for phase when no real-time slot data
    phase = statusToPhase(trench.status);

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
 * Prize distribution percentages for winners
 */
const PRIZE_DISTRIBUTION = {
  FIRST: 50,
  SECOND: 30,
  THIRD: 15,
  OTHERS: 5,
} as const;

/**
 * Convert TrenchDetailDto to ArenaRound for UI components
 *
 * @param trench - Trench detail from API
 * @param currentSlot - Current Solana slot from RPC (optional)
 * @param leaderboard - Leaderboard data for winners calculation (optional)
 */
export function trenchToArenaRound(
  trench: TrenchDetailDto | null,
  currentSlot?: number,
  leaderboard?: LeaderboardResponseDto,
): ArenaRound | null {
  if (!trench) return null;

  const { currentBlock, totalBlocks, phase } = calculateBlockProgress(
    trench,
    currentSlot,
  );

  // Calculate prize pool from deposited SOL (80% goes to prize pool)
  const totalDepositedSol = parseFloat(trench.prizePoolReserves) / 1e9; // lamports to SOL
  const prizePool = totalDepositedSol * 0.8;

  // Get token price
  const tokenPrice = trench.currentTokenPriceSol
    ? parseFloat(trench.currentTokenPriceSol)
    : 0;

  // Check if there are bets - use totalDepositedSol as the source of truth
  // since participantCount might not be in sync with actual deposits
  const hasBets =
    parseFloat(trench.totalDepositedSol) > 0 || trench.participantCount > 0;

  // Calculate winners from leaderboard data
  const winners = calculateWinners(prizePool, leaderboard);

  // Calculate next round countdown based on remaining blocks in liquidation phase
  let nextRoundCountdown: number | undefined;
  if (phase === "liquidation") {
    const remainingBlocks = totalBlocks - currentBlock;
    nextRoundCountdown = Math.max(
      0,
      Math.ceil((remainingBlocks * BLOCK_TIMING.MS_PER_BLOCK) / 1000),
    );
  }

  return {
    id: `eva-${trench.trenchId}`,
    trenchDbId: trench.id,
    tokenName: trench.tokenSymbol || `EVA-${trench.trenchId}`,
    startBlock: parseInt(trench.biddingStartBlock),
    currentBlock,
    totalBlocks,
    phase,
    totalSol: totalDepositedSol,
    totalPrizePool: prizePool,
    tokenPrice,
    activeAgents: trench.activeAgentsCount,
    tokenAlloc: 50,
    lpAlloc: 20,
    prizeFund: 80,
    hasBets,
    winners,
    nextRoundCountdown,
  };
}

/**
 * Calculate winners from leaderboard data with prize distribution
 * - 1st place: 50%
 * - 2nd place: 30%
 * - 3rd place: 15%
 * - Others: 5%
 */
function calculateWinners(
  prizePool: number,
  leaderboard?: LeaderboardResponseDto,
): import("@/types").Winner[] | undefined {
  if (!leaderboard || leaderboard.topThree.length === 0) {
    return undefined;
  }

  const winners: import("@/types").Winner[] = [];
  const topThree = leaderboard.topThree;

  // Distribution percentages for each rank
  const percentages = [
    PRIZE_DISTRIBUTION.FIRST,
    PRIZE_DISTRIBUTION.SECOND,
    PRIZE_DISTRIBUTION.THIRD,
  ];

  for (let i = 0; i < Math.min(3, topThree.length); i++) {
    const participant = topThree[i];
    const percentage = percentages[i];
    const prize = (prizePool * percentage) / 100;

    winners.push({
      rank: i + 1,
      agentId: participant.agentId || participant.userAddress,
      agentName:
        participant.agentName || `Agent ${participant.userAddress.slice(0, 8)}`,
      prize,
      percentage,
    });
  }

  // Add "Others" entry if there are more participants
  if (leaderboard.totalParticipants > 3) {
    const othersPrize = (prizePool * PRIZE_DISTRIBUTION.OTHERS) / 100;
    winners.push({
      rank: 4,
      agentId: "others",
      agentName: "Others",
      prize: othersPrize,
      percentage: PRIZE_DISTRIBUTION.OTHERS,
    });
  }

  return winners;
}

/**
 * Total token supply for percentage calculation (1 billion tokens)
 */
const TOTAL_TOKEN_SUPPLY = 1_000_000_000;

/**
 * Convert LeaderboardResponseDto to AgentRanking array (top 3 only)
 * @param leaderboard - Leaderboard data from API
 * @param totalDepositedSol - Total deposited SOL in lamports (for allocation calculation)
 * @param currentUserAddress - Current user's wallet address
 */
export function leaderboardToRankings(
  leaderboard: LeaderboardResponseDto | undefined,
  totalDepositedSol?: string,
  currentUserAddress?: string,
): AgentRanking[] {
  if (!leaderboard) return [];

  const rankings: AgentRanking[] = [];
  const totalDeposited = totalDepositedSol ? parseFloat(totalDepositedSol) : 0;

  // Add top three only
  for (const item of leaderboard.topThree) {
    const tokenAmount = parseInt(item.tokenBalance) / 1e6; // Adjust decimals
    const supplyPercentage = (tokenAmount / TOTAL_TOKEN_SUPPLY) * 100;
    const depositedSol = parseFloat(item.depositedSol);
    const betAmount = depositedSol / 1e9; // Convert lamports to SOL
    const allocationPercent = totalDeposited > 0 
      ? (depositedSol / totalDeposited) * 100 
      : 0;

    rankings.push({
      rank: item.rank,
      agentId: item.agentId || item.userAddress,
      agentName: item.agentName || `Agent ${item.userAddress.slice(0, 8)}`,
      agentAvatar: undefined,
      tokenAmount,
      pnlSol: parseFloat(item.pnlSol) / 1e9,
      prizeAmount: parseFloat(item.prizeAmount) / 1e9,
      supplyPercentage,
      isOwned: item.isCurrentUser || item.userAddress === currentUserAddress,
      betAmount,
      allocationPercent,
    });
  }

  return rankings;
}

/**
 * Get current user ranking info (when not in top 3)
 * @param leaderboard - Leaderboard data from API
 * @param totalDepositedSol - Total deposited SOL in lamports (for allocation calculation)
 */
export function getCurrentUserRanking(
  leaderboard: LeaderboardResponseDto | undefined,
  totalDepositedSol?: string,
): AgentRanking | null {
  if (!leaderboard?.currentUser) return null;
  
  // Only return if user is not in top 3
  if (leaderboard.currentUser.rank <= 3) return null;

  const tokenAmount = parseInt(leaderboard.currentUser.tokenBalance) / 1e6;
  const supplyPercentage = (tokenAmount / TOTAL_TOKEN_SUPPLY) * 100;
  const totalDeposited = totalDepositedSol ? parseFloat(totalDepositedSol) : 0;
  const depositedSol = parseFloat(leaderboard.currentUser.depositedSol);
  const betAmount = depositedSol / 1e9;
  const allocationPercent = totalDeposited > 0 
    ? (depositedSol / totalDeposited) * 100 
    : 0;

  return {
    rank: leaderboard.currentUser.rank,
    agentId:
      leaderboard.currentUser.agentId || leaderboard.currentUser.userAddress,
    agentName: leaderboard.currentUser.agentName || "My Agent",
    tokenAmount,
    pnlSol: parseFloat(leaderboard.currentUser.pnlSol) / 1e9,
    prizeAmount: parseFloat(leaderboard.currentUser.prizeAmount) / 1e9,
    supplyPercentage,
    isOwned: true,
    betAmount,
    allocationPercent,
  };
}

/**
 * Get 3rd place token amount for gap calculation
 */
export function getThirdPlaceTokenAmount(
  leaderboard: LeaderboardResponseDto | undefined,
): number {
  if (!leaderboard?.topThree?.length) return 0;
  
  const thirdPlace = leaderboard.topThree.find(item => item.rank === 3);
  if (!thirdPlace) return 0;
  
  return parseInt(thirdPlace.tokenBalance) / 1e6;
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
      signature: tx.signature,
      reason: tx.reason
        ? {
            id: tx.reason.id,
            content: tx.reason.content,
            action: tx.reason.action,
            createdAt: tx.reason.createdAt,
          }
        : undefined,
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

/**
 * Format number with fixed decimal places, avoiding scientific notation
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 6)
 */
export function formatDecimal(num: number, decimals: number = 6): string {
  // Handle edge cases
  if (!Number.isFinite(num)) return "0";

  // Use toFixed to ensure fixed decimal places and avoid scientific notation
  return num.toFixed(decimals);
}

/**
 * Format small numbers with subscript notation for leading zeros
 * e.g., 0.00001234 -> 0.0₄1234
 *
 * @param num - Number to format (string or number)
 * @param threshold - Number of leading zeros to trigger subscript (default: 4)
 * @param significantDigits - Number of significant digits to show (default: 6)
 * @param trimTrailingZeros - Whether to remove trailing zeros (default: true)
 */
export function formatSmallNumber(
  num: string | number,
  threshold: number = 4,
  significantDigits: number = 6,
  trimTrailingZeros: boolean = true,
): string {
  // Handle edge cases
  if (num === 0 || num === "0") return "0";

  // Convert to string, avoiding scientific notation
  const numStr = typeof num === "number" ? num.toFixed(20) : num;

  if (!numStr.includes(".")) return numStr;

  const [intPart, decimalPart] = numStr.split(".");

  // Count leading zeros in decimal part
  let zeroCount = 0;
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === "0") {
      zeroCount++;
    } else {
      break;
    }
  }

  // If leading zeros >= threshold, use subscript format
  if (zeroCount >= threshold) {
    const subscript = zeroCount
      .toString()
      .split("")
      .map((n) => "₀₁₂₃₄₅₆₇₈₉"[parseInt(n)])
      .join("");
    const remainingPart = decimalPart.slice(zeroCount);

    // Take specified significant digits
    let formattedRemaining = remainingPart.slice(0, significantDigits);

    // Trim or pad zeros
    if (trimTrailingZeros) {
      formattedRemaining = formattedRemaining.replace(/0+$/, "");
    } else {
      formattedRemaining = formattedRemaining.padEnd(significantDigits, "0");
    }

    // If remaining is empty after trimming, show 0
    if (formattedRemaining === "") {
      return `${intPart}.0${subscript}`;
    }

    return `${intPart}.0${subscript}${formattedRemaining}`;
  }

  // Otherwise, format normally from first non-zero digit
  const firstNonZeroIndex = decimalPart.search(/[1-9]/);
  if (firstNonZeroIndex === -1) {
    // All zeros in decimal part
    return trimTrailingZeros ? intPart : `${intPart}.${decimalPart}`;
  }

  let formattedDecimal = decimalPart.slice(
    0,
    firstNonZeroIndex + significantDigits,
  );

  if (trimTrailingZeros) {
    formattedDecimal = formattedDecimal.replace(/0+$/, "");
    if (formattedDecimal === "" || formattedDecimal.match(/^0+$/)) {
      return intPart;
    }
  }

  return `${intPart}.${formattedDecimal}`;
}

/**
 * Format price with smart formatting - uses subscript for very small numbers,
 * K/M/B for large numbers
 */
export function formatPrice(num: number): string {
  if (!Number.isFinite(num) || num === 0) return "0";

  const absNum = Math.abs(num);

  // Large numbers: use K/M/B format
  if (absNum >= 1000) {
    return formatCompactNumber(num);
  }

  // Normal numbers (>= 0.0001): use fixed decimals
  if (absNum >= 0.0001) {
    const decimals = absNum >= 1 ? 4 : 6;
    return num.toFixed(decimals).replace(/\.?0+$/, "");
  }

  // Very small numbers: use subscript notation
  return formatSmallNumber(num, 4, 4, true);
}
