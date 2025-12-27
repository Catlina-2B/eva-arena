/**
 * API Types - Based on backend DTOs
 */

// ============== Common Types ==============

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

// ============== Auth Types ==============

export interface LoginDto {
  publicKey: string;
  message: string;
  signature: string;
  chainType?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  walletAddress: string;
  chainType: string;
  createdAt: string;
  updatedAt: string;
}

// ============== Agent Types ==============

export type AgentStatus = "ACTIVE" | "PAUSED";
export type LlmProvider =
  | "OPENAI"
  | "DEEPSEEK"
  | "QWEN"
  | "CLAUDE"
  | "GEMINI"
  | "MOONSHOT"
  | "ZHIPU"
  | "MINIMAX"
  | "BAICHUAN"
  | "PLATFORM"
  | "CUSTOM";

export interface RangeConfig {
  min?: number;
  max?: number;
}

export interface DataSourceConfig {
  useOfficial: boolean;
  kline: boolean;
  indicators: ("EMA" | "MACD" | "KDJ")[];
  holders: boolean;
  tokenMetadata: boolean;
}

export interface FilterConfig {
  progress?: RangeConfig;
  time?: RangeConfig;
  pool?: RangeConfig;
  marketCap?: RangeConfig;
  volume?: RangeConfig;
  trades?: RangeConfig;
  netBuy?: RangeConfig;
  buyCount?: RangeConfig;
  sellCount?: RangeConfig;
  top10Holders?: RangeConfig;
  holderCount?: RangeConfig;
}

export interface TelegramNotificationConfig {
  chatId: string;
  token: string;
}

export interface NotificationConfig {
  telegram?: TelegramNotificationConfig;
  email?: string;
  notifyOnExternalSale: boolean;
  notifyOnPause: boolean;
}

export interface AgentItemDto {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  pdaAddress: string;
  turnkeyAddress: string;
  frequency: string;
  status: AgentStatus;
  dataSourceConfig: DataSourceConfig;
  filterConfig: FilterConfig;
  llmProvider: LlmProvider;
  llmModel?: string;
  currentBalance: number;
  totalPnl: number;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDetailDto extends AgentItemDto {
  llmApiKey?: string;
  llmApiEndpoint?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  bettingStrategyPrompt: string;
  tradingStrategyPrompt?: string;
  notificationConfig?: NotificationConfig;
  autoPauseEnabled: boolean;
  autoPauseThreshold?: number;
  totalDeposited: number;
  totalWithdrawn: number;
  creationFee: number;
  creationTxHash?: string;
}

export interface AgentListResponseDto {
  agents: AgentItemDto[];
}

export interface AgentPanelDto {
  id: string;
  name: string;
  logo?: string;
  status: AgentStatus;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalPnl: number;
  currentRound: number;
  turnkeyAddress: string;
  pdaAddress: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  logo?: string;
  pdaAddress: string;
  turnkeyAddress?: string;
  frequency?: string;
  status?: AgentStatus;
  dataSourceConfig?: DataSourceConfig;
  filterConfig: FilterConfig;
  llmProvider?: LlmProvider;
  llmModel?: string;
  llmApiKey?: string;
  llmApiEndpoint?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  bettingStrategyPrompt: string;
  tradingStrategyPrompt?: string;
  notificationConfig?: NotificationConfig;
  autoPauseEnabled?: boolean;
  autoPauseThreshold?: number;
  creationTxHash?: string;
}

export interface UpdateAgentDto {
  name?: string;
  description?: string;
  logo?: string;
  frequency?: string;
  status?: AgentStatus;
  dataSourceConfig?: DataSourceConfig;
  filterConfig?: FilterConfig;
  llmProvider?: LlmProvider;
  llmModel?: string;
  llmApiKey?: string;
  llmApiEndpoint?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  bettingStrategyPrompt?: string;
  tradingStrategyPrompt?: string;
  notificationConfig?: NotificationConfig;
  autoPauseEnabled?: boolean;
  autoPauseThreshold?: number;
}

export interface AgentDepositDto {
  amount: number;
  txHash: string;
  fromAddress: string;
}

export interface AgentWithdrawDto {
  /** Amount in lamports (1 SOL = 1,000,000,000 lamports) */
  amount: number;
  toAddress: string;
}

export interface AgentWithdrawResponseDto {
  success: boolean;
  txHash?: string;
  balanceAfter: number;
  error?: string;
}

// AgentLogosResponseDto is now a simple string array
export type AgentLogosResponseDto = string[];

// Prompt template response
export interface PromptTemplateResponseDto {
  bettingStrategyTemplate: string;
  tradingStrategyTemplate: string;
}

// ============== Trench Types ==============

export type TrenchStatus = "BIDDING" | "TRADING" | "ENDED";
export type TransactionType = "DEPOSIT" | "WITHDRAW" | "BUY" | "SELL" | "CLAIM";

export interface TrenchListItemDto {
  id: number;
  trenchId: string;
  trenchPda: string;
  status: TrenchStatus;
  tokenMint: string | null;
  tokenSymbol: string | null;
  currentTokenPriceSol: string | null;
  currentTokenPriceUsd: string | null;
  totalDepositedSol: string;
  participantCount: number;
  biddingStartBlock: string;
  startTime: string | null;
  tradingStartTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface TrenchListResponseDto {
  trenches: TrenchListItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface TrenchDetailDto {
  id: number;
  trenchId: string;
  trenchPda: string;
  creator: string;
  status: TrenchStatus;
  tokenMint: string | null;
  tokenVault: string | null;
  tokenDecimals: number;
  tokenSymbol: string | null;
  tokenName: string | null;
  totalDepositedSol: string;
  virtualSolReserves: string;
  virtualTokenReserves: string;
  realSolReserves: string;
  realTokenReserves: string;
  initialVirtualTokenReserves: string;
  prizePoolReserves: string;
  currentTokenPriceSol: string | null;
  currentTokenPriceUsd: string | null;
  biddingStartBlock: string;
  biddingEndBlock: string;
  tradingEndBlock: string;
  startTime: string | null;
  tradingStartTime: string | null;
  endTime: string | null;
  participantCount: number;
  activeAgentsCount: number;
  transactionCount: number;
  totalBidSol: string;
  pnlSol: string | null;
  tokenBalance: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricePointDto {
  timestamp: number;
  price: string;
}

export interface PriceCurveResponseDto {
  trenchId: number;
  trenchPda: string;
  unit: "SOL" | "USDT";
  pricePoints: PricePointDto[];
  totalTrades: number;
}

/** 交易推理详情 */
export interface TransactionReasonDto {
  id: number;
  content: string;
  action: string;
  createdAt: string;
}

export interface TransactionDto {
  id: number;
  trenchId: number;
  txType: TransactionType;
  agentName: string;
  userAddress: string;
  solAmount: string | null;
  tokenAmount: string | null;
  totalDeposited: string | null;
  signature: string;
  slot: number;
  blockTime: number | null;
  reasonId?: number;
  reason?: TransactionReasonDto;
  /** @deprecated 使用 reason.content */
  reasoningChain?: string;
  /** @deprecated 使用 reason.content */
  reasoningOutput?: string;
  /** @deprecated 使用 reason.action */
  reasoningAction?: string;
  createdAt: string;
}

export interface TransactionListResponseDto {
  transactions: TransactionDto[];
  total: number;
}

export interface LeaderboardItemDto {
  rank: number;
  participantId: number;
  userAddress: string;
  agentPda: string;
  agentId: string | null;
  agentName: string | null;
  agentLogo: string | null;
  tokenBalance: string;
  depositedSol: string;
  pnlSol: string;
  prizeAmount: string;
  isCurrentUser: boolean;
}

export interface LeaderboardResponseDto {
  trenchId: number;
  trenchPda: string;
  topThree: LeaderboardItemDto[];
  currentUser: LeaderboardItemDto | null;
  totalParticipants: number;
}

// ============== Strategy Types ==============

export type StrategyStatus = "ENABLED" | "DISABLED";
export type StrategyType = "PUBLIC" | "PRIVATE";

export interface StrategyItemDto {
  id: string;
  name: string;
  prompt: string;
  status: StrategyStatus;
  type: StrategyType;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyListResponseDto {
  strategies: StrategyItemDto[];
  total: number;
}

export interface CreateStrategyDto {
  name: string;
  prompt: string;
  status?: StrategyStatus;
  type?: StrategyType;
}

export interface UpdateStrategyDto {
  name?: string;
  prompt?: string;
  status?: StrategyStatus;
  type?: StrategyType;
}

// ============== Price Types ==============

export interface SolPriceResponseDto {
  price: string;
  decimals: number;
  rawPrice: string;
  updatedAt: string;
}

// ============== Agent Trench Types ==============

export interface AgentTrenchDto {
  id: number;
  trenchId: string;
  trenchPda: string;
  tokenMint: string;
  status: TrenchStatus;
  biddingStartBlock: number;
  biddingEndBlock: number;
  tradingEndBlock: number;
  startTime?: string;
  createdAt: string;
  depositedSol: string;
  tokenBalance: string;
  totalBuySol: string;
  totalSellSol: string;
  pnlSol: string;
  isClaimed: boolean;
  transactionCount: number;
}

export interface AgentTrenchListResponseDto {
  trenches: AgentTrenchDto[];
  total: number;
}

export interface AgentTrenchDetailResponseDto extends AgentTrenchDto {
  transactions: TransactionDto[];
}

// ============== Trench History Types ==============

export interface TrenchHistoryItemDto {
  /** 参与记录 ID */
  id: number;
  /** Trench 数据库 ID */
  trenchId: number;
  /** Trench 状态 */
  trenchStatus: TrenchStatus;
  /** Token 符号 */
  tokenSymbol: string | null;
  /** 用户地址 (turnkey 地址) */
  userAddress: string;
  /** 存入 SOL (lamports) */
  depositedSol: string;
  /** 提现 SOL (lamports) */
  totalWithdrawnSol: string;
  /** 持有代币数量 */
  tokenBalance: string;
  /** 总买入 SOL (lamports) */
  totalBuySol: string;
  /** 总卖出 SOL (lamports) */
  totalSellSol: string;
  /** 盈亏 SOL (lamports) */
  pnlSol: string;
  /** 排名 (结算后有值) */
  rank: number | null;
  /** 奖励金额 (lamports) */
  prizeAmount: string;
  /** 奖励是否已结算 */
  isPrizeSettled: boolean;
  /** Trench 开始时间 */
  trenchStartTime: string | null;
  /** Trench 结束时间 */
  trenchEndTime: string | null;
  /** 参与创建时间 */
  createdAt: string;
}

export interface TrenchHistoryResponseDto {
  /** Trench 参与历史 */
  history: TrenchHistoryItemDto[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
}

// ============== PNL Timeline Types ==============

export interface PnlTimelineItemDto {
  /** PNL 值 (lamports) */
  pnl: string;
  /** 时间戳 */
  timestamp: string;
}

export interface UserPnlTimelineResponseDto {
  /** PNL 时间线数据（按时间升序） */
  timeline: PnlTimelineItemDto[];
}
