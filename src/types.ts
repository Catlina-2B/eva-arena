export type Phase = 'BIDDING' | 'TRADING' | 'LIQUIDATION' | 'ENDED';

export type AgentType = 'USER' | 'BOT_HOLDER' | 'BOT_ARBITRAGE' | 'BOT_SNIPER' | 'BOT_CUSTOM';

export interface Agent {
    id: string;
    name: string;
    type: AgentType;
    initialSol: number;
    currentSol: number;
    tokenBalance: number;
    depositedSol: number; // For bidding phase
    isUser: boolean;
    strategy?: string; // AI prompt for bot behavior
    isActive: boolean; // Whether the agent is actively participating
    description?: string; // Optional description of the agent
    walletId?: string; // Associated Turnkey wallet ID
}

export interface Wallet {
    id: string;
    address: string;
    name: string;
    agentId?: string; // Associated agent ID if any
    agentName?: string; // Associated agent name for display
    balance: {
        sol: number;
        tokens: Record<string, number>; // tokenAddress -> balance
    };
    createdAt: number;
    isExported: boolean; // Whether private key has been exported
    turnkeyWalletId: string; // Turnkey wallet identifier
}

export interface AMM {
    solReserve: number;
    tokenReserve: number;
    k: number;
    feeRate: number; // 0.0025
}

export interface Trench {
    id: string;
    name: string;
    createdAt: number;
    status: Phase;
}

export interface GameState {
    id: string; // Trench ID
    name: string; // Token Name
    round: number;
    currentBlock: number; // Current block number in the round
    totalBlocks: number; // Total blocks for the round (e.g. 300)
    phase: Phase;
    amm: AMM;
    prizePool: number;
    agents: Agent[];
    logs: string[];
    priceHistory: { time: number; price: number }[];
}

export const TOTAL_ROUND_BLOCKS = 3000; // Total duration in blocks (60s at 5 blocks/100ms)
export const BIDDING_BLOCKS = 1000; // First 1000 blocks (20s)
export const TRADING_BLOCKS = 1500; // Next 1500 blocks (30s)
export const LIQUIDATION_BLOCKS = 500; // Last 500 blocks (10s)

export const BLOCKS_PER_TICK = 5; // 5 blocks per 100ms tick = 50 blocks/sec
export const TICK_RATE_MS = 100; // Update every 100ms
export const BLOCKS_PER_SECOND = 50;

export const INITIAL_SOL_RESERVE_RATIO = 0.2; // 20% of bids to AMM
export const INITIAL_TOKEN_RESERVE_RATIO = 0.5; // 50% of tokens to AMM
export const PRIZE_POOL_RATIO = 0.8; // 80% of bids to Prize Pool
