# Arena 页面数据获取逻辑文档

本文档详细说明 Arena 页面 (`src/pages/arena.tsx`) 的所有数据获取逻辑和方法。

---

## 目录

1. [概述](#概述)
2. [Block 推进机制与规则](#block-推进机制与规则)
3. [数据获取架构](#数据获取架构)
4. [核心数据源](#核心数据源)
5. [REST API 数据获取](#rest-api-数据获取)
6. [WebSocket 实时数据](#websocket-实时数据)
7. [Solana RPC 数据](#solana-rpc-数据)
8. [本地存储数据](#本地存储数据)
9. [数据转换层](#数据转换层)
10. [数据流图](#数据流图)

---

## 概述

Arena 页面是应用的核心交互页面，负责展示：
- 当前回合 (Trench) 的状态和进度
- 实时排行榜
- 实时交易活动
- 用户 Agent 状态和控制面板

页面使用多种数据获取方式组合：
- **REST API** (TanStack Query): 获取核心数据和定期轮询
- **WebSocket** (Socket.IO): 接收实时更新事件
- **Solana RPC WebSocket**: 订阅链上数据变化

---

## Block 推进机制与规则

### 核心概念

Arena 的每一回合 (Trench) 基于 **Solana 区块 (Slot)** 进行推进，而非传统的时间计时。这确保了回合进度与链上状态完全同步。

### 区块时间

| 参数 | 值 | 说明 |
|-----|---|------|
| Solana 区块时间 | ~400ms | 每个 slot 大约 400 毫秒 |
| 总回合时长 | ~20 分钟 | 3000 区块 × 400ms |

### 阶段划分

每回合共 **3000 个区块**，划分为三个阶段：

```
区块 0                    300                   2700                  3000
  │                        │                      │                      │
  ├────── BETTING ─────────┼───── TRADING ────────┼─── LIQUIDATION ──────┤
  │      (竞价阶段)          │     (交易阶段)        │     (清算阶段)         │
  │      300 区块           │     2400 区块        │     300 区块          │
  │      ~2 分钟            │     ~16 分钟         │     ~2 分钟           │
  └────────────────────────┴──────────────────────┴──────────────────────┘
```

### 阶段详情

| 阶段 | 区块范围 | 区块数 | 预估时长 | 后端状态 | 前端阶段 |
|-----|---------|-------|---------|---------|---------|
| **竞价阶段** | 0 - 299 | 300 | ~2 分钟 | `BIDDING` | `betting` |
| **交易阶段** | 300 - 2699 | 2400 | ~16 分钟 | `TRADING` | `trading` |
| **清算阶段** | 2700 - 2999 | 300 | ~2 分钟 | `ENDED` | `liquidation` |

### 区块进度计算

**核心公式**:

```typescript
currentBlock = currentSlot - biddingStartBlock
```

- `currentSlot`: 当前 Solana 链上的 slot (通过 RPC WebSocket 实时订阅)
- `biddingStartBlock`: 回合开始时的起始区块 (从后端 API 获取)

### 阶段判断逻辑

```typescript
// src/lib/trench-utils.ts

function blockToPhase(currentBlock: number): ArenaPhase {
  const BIDDING_BLOCKS = 300;
  const TRADING_BLOCKS = 2400;
  
  if (currentBlock < BIDDING_BLOCKS) {
    return "betting";    // 区块 0-299
  } else if (currentBlock < BIDDING_BLOCKS + TRADING_BLOCKS) {
    return "trading";    // 区块 300-2699
  } else {
    return "liquidation"; // 区块 2700-2999
  }
}
```

### 阶段判断优先级

前端使用以下优先级确定当前阶段：

1. **优先使用实时 Solana Slot** (最准确)
   - 当有 `currentSlot` 时，基于区块计算阶段
   - 这确保 UI 显示与链上状态实时同步
   
2. **回退到后端状态** (当无法获取 slot 时)
   - 使用后端返回的 `status` 字段
   - 状态映射: `BIDDING` → `betting`, `TRADING` → `trading`, `ENDED` → `liquidation`

```typescript
// 阶段计算逻辑
if (currentSlot !== undefined) {
  // 使用实时 slot 计算 - 更准确
  currentBlock = Math.max(0, currentSlot - biddingStart);
  phase = blockToPhase(currentBlock);
} else {
  // 回退到后端状态 - 可能有延迟
  phase = statusToPhase(trench.status);
}
```

### 配置常量

```typescript
// src/lib/trench-utils.ts
export const BLOCK_TIMING = {
  BIDDING_BLOCKS: 300,      // 竞价阶段区块数
  TRADING_BLOCKS: 2400,     // 交易阶段区块数
  LIQUIDATION_BLOCKS: 300,  // 清算阶段区块数
  TOTAL_BLOCKS: 3000,       // 总区块数
  MS_PER_BLOCK: 400,        // 每区块毫秒数 (~400ms)
};
```

### 进度条计算

```typescript
// 进度百分比 = 当前区块 / 总区块 × 100%
const progressPercent = (currentBlock / BLOCK_TIMING.TOTAL_BLOCKS) * 100;

// 阶段内进度 (用于阶段特定的进度显示)
const phaseProgress = calculatePhaseProgress(currentBlock, phase);
```

### 倒计时计算

```typescript
// 剩余时间 (秒) = 剩余区块 × 每区块毫秒数 / 1000
const remainingBlocks = totalBlocks - currentBlock;
const remainingSeconds = Math.ceil((remainingBlocks * BLOCK_TIMING.MS_PER_BLOCK) / 1000);
```

### 阶段规则

#### 1. 竞价阶段 (Betting Phase)

- **允许操作**: 存入 SOL、创建/配置 Agent
- **禁止操作**: 买入/卖出 Token
- **特殊情况**: 若无人存入 SOL，进入交易阶段后会显示 "Round Skipped"

#### 2. 交易阶段 (Trading Phase)

- **允许操作**: 买入/卖出 Token、Agent 自动交易
- **禁止操作**: 新用户存入 SOL
- **跳过条件**: 若竞价阶段无人参与 (`hasBets = false`)，显示跳过界面

```typescript
// arena.tsx 中的跳过逻辑
if (currentRound.phase === "trading" && !currentRound.hasBets) {
  return <RoundSkipped round={currentRound} />;
}
```

#### 3. 清算阶段 (Liquidation Phase)

- **自动操作**: 系统自动卖出所有持仓
- **结算**: 计算最终排名和奖金分配
- **显示**: 获胜者和奖金信息

### Slot 订阅实现

```typescript
// src/hooks/use-slot-subscription.ts
export function useSlotSubscription() {
  const [slot, setSlot] = useState<number | null>(null);

  useEffect(() => {
    const connection = getSolanaConnection();
    
    // 订阅 slot 变化
    const subscriptionId = connection.onSlotChange((slotInfo) => {
      setSlot(slotInfo.slot);
    });

    return () => {
      connection.removeSlotChangeListener(subscriptionId);
    };
  }, []);

  return { slot };
}
```

### 数据流示意

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Block 推进数据流                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Solana RPC                        Backend API                       │
│      │                                  │                            │
│      ▼                                  ▼                            │
│  ┌──────────────┐               ┌──────────────────┐                │
│  │ currentSlot  │               │ biddingStartBlock │                │
│  │  (实时订阅)   │               │  (trenchData)     │                │
│  └──────┬───────┘               └────────┬─────────┘                │
│         │                                 │                          │
│         └─────────────┬───────────────────┘                          │
│                       ▼                                              │
│         ┌─────────────────────────────────┐                          │
│         │ currentBlock = currentSlot -    │                          │
│         │               biddingStartBlock │                          │
│         └──────────────┬──────────────────┘                          │
│                        │                                             │
│                        ▼                                             │
│         ┌─────────────────────────────────┐                          │
│         │      blockToPhase(currentBlock) │                          │
│         │   0-299: betting                │                          │
│         │   300-2699: trading             │                          │
│         │   2700-2999: liquidation        │                          │
│         └──────────────┬──────────────────┘                          │
│                        │                                             │
│                        ▼                                             │
│         ┌─────────────────────────────────┐                          │
│         │      ArenaRound 对象             │                          │
│         │  - phase: ArenaPhase            │                          │
│         │  - currentBlock: number         │                          │
│         │  - totalBlocks: 3000            │                          │
│         └──────────────┬──────────────────┘                          │
│                        │                                             │
│                        ▼                                             │
│         ┌─────────────────────────────────┐                          │
│         │      UI 组件渲染                 │                          │
│         │  - ArenaHeader (进度条)          │                          │
│         │  - PreMarketBetting / ...       │                          │
│         └─────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 数据获取架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Arena Page                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ REST API     │  │ WebSocket    │  │ Solana RPC WebSocket   │ │
│  │ (Polling)    │  │ (Real-time)  │  │ (On-chain updates)     │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                  │                      │              │
│         ▼                  ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    React Query Cache                          ││
│  └──────────────────────────────────────────────────────────────┘│
│         │                  │                      │              │
│         ▼                  ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                  数据转换层 (trench-utils.ts)                 ││
│  └──────────────────────────────────────────────────────────────┘│
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                      UI 组件                                   ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心数据源

### 1. 认证状态

**来源**: Zustand Store (`useAuthStore`)

```typescript
// 使用方式
const { isAuthenticated } = useIsAuthenticated();
const { user } = useAuthStore();
const turnkeyAddress = user?.turnkeyAddress;
```

**相关文件**: 
- `src/stores/auth.ts`
- `src/hooks/use-auth.ts`

---

## REST API 数据获取

所有 REST API 调用使用 TanStack Query 管理，支持缓存、轮询和自动刷新。

### 1. 当前 Trench (回合) 数据

**Hook**: `useCurrentTrench`

```typescript
const {
  data: trenchData,
  isLoading: isTrenchLoading,
  error: trenchError,
} = useCurrentTrench();
```

**API 端点**: `GET /api/trenches/current`

**轮询间隔**: 5000ms (可配置)

**返回数据类型**: `TrenchDetailDto | null`

```typescript
interface TrenchDetailDto {
  id: number;                    // 数据库主键
  trenchId: string;              // 链上 ID (如 "eva-916")
  status: TrenchStatus;          // "BIDDING" | "TRADING" | "ENDED"
  tokenSymbol: string;           // Token 符号
  biddingStartBlock: string;     // 竞价开始区块
  biddingEndBlock: string;       // 竞价结束区块
  totalDepositedSol: string;     // 总存入 SOL (lamports)
  prizePoolReserves: string;     // 奖池储备
  currentTokenPriceSol: string;  // 当前 Token 价格
  participantCount: number;      // 参与者数量
  activeAgentsCount: number;     // 活跃 Agent 数量
  startTime?: string;            // 开始时间
  tradingStartTime?: string;     // 交易开始时间
  pnlSol?: string;               // 用户当前回合 PnL
  tokenBalance?: string;         // 用户 Token 余额
}
```

**实现文件**: 
- `src/hooks/use-trenches.ts` (Hook 定义)
- `src/services/api/trenches.ts` (API 调用)

---

### 2. 排行榜数据

**Hook**: `useLeaderboard`

```typescript
const { data: leaderboardData } = useLeaderboard(trenchId);
```

**API 端点**: `GET /api/trenches/{trenchId}/leaderboard`

**轮询间隔**: 5000ms

**返回数据类型**: `LeaderboardResponseDto`

```typescript
interface LeaderboardResponseDto {
  topThree: LeaderboardEntryDto[];  // 前三名
  currentUser?: LeaderboardEntryDto; // 当前用户 (可能不在前三)
  totalParticipants: number;
}

interface LeaderboardEntryDto {
  rank: number;
  userAddress: string;
  agentId?: string;
  agentName?: string;
  agentLogo?: string;
  tokenBalance: string;      // Token 余额
  depositedSol: string;      // 存入的 SOL
  pnlSol: string;            // 盈亏
  prizeAmount: string;       // 预估奖金
  isCurrentUser?: boolean;   // 是否当前用户
}
```

---

### 3. 交易记录数据

**Hook**: `useTrenchTransactions`

```typescript
const { data: transactionsData } = useTrenchTransactions(trenchId, {
  limit: 10,
  txType: ["DEPOSIT", "WITHDRAW", "BUY", "SELL"],
});
```

**API 端点**: `GET /api/trenches/{trenchId}/transactions`

**查询参数**:
- `userAddress`: 用户地址 (可选)
- `txType`: 交易类型数组
- `page`: 页码
- `limit`: 每页数量

**轮询间隔**: 5000ms

**返回数据类型**: `TransactionListResponseDto`

```typescript
interface TransactionDto {
  id: number;
  trenchId: number;
  txType: "DEPOSIT" | "WITHDRAW" | "BUY" | "SELL" | "CLAIM";
  userAddress: string;
  agentName?: string;
  solAmount?: string;
  tokenAmount?: string;
  totalDeposited?: string;
  signature: string;
  slot: number;
  blockTime?: string;
  createdAt: string;
  reason?: TransactionReasonDto;  // AI 决策原因
}
```

---

### 4. 用户 Agent 列表

**Hook**: `useMyAgents`

```typescript
const { data: agentsData, refetch: refetchAgents } = useMyAgents();
const userAgents = agentsData?.agents ?? [];
const hasAgent = userAgents.length > 0;
const primaryAgent = userAgents[0];
```

**API 端点**: `GET /api/agents`

**条件**: 仅在用户已登录时获取

**返回数据类型**: `AgentListResponseDto`

```typescript
interface AgentListResponseDto {
  agents: AgentSummaryDto[];
  total: number;
}

interface AgentSummaryDto {
  id: string;
  name: string;
  logo: string;
  status: "ACTIVE" | "PAUSED";
  createdAt: string;
  currentBalance: number;     // SOL 余额
  totalPnl: number;           // 总 PnL
  turnkeyAddress: string;     // Turnkey 钱包地址
  frequency: string;          // 操作频率
}
```

---

### 5. Agent 详情

**Hook**: `useAgent`

```typescript
const { data: agentDetail, refetch: refetchAgentDetail } = useAgent(primaryAgent?.id);
```

**API 端点**: `GET /api/agents/{id}`

**条件**: 需要 Agent ID 且用户已登录

**返回数据类型**: `AgentDetailDto`

```typescript
interface AgentDetailDto {
  id: string;
  name: string;
  logo: string;
  status: "ACTIVE" | "PAUSED";
  turnkeyAddress: string;
  prompt: string;              // AI Prompt
  strategy?: StrategyDto;      // 交易策略
  frequency: string;
  currentBalance: number;
  totalPnl: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### 6. Agent Panel 数据 (用于其他用户)

**方法**: `agentApi.getAgentPanelByUserAddress`

```typescript
const handleLoadAgentDetail = async (agentId: string): Promise<AgentDetailData | null> => {
  const agent = rankings.find((r) => r.agentId === agentId);
  const panelData = await agentApi.getAgentPanelByUserAddress(agent.userAddress);
  // ...转换数据
};
```

**API 端点**: `GET /api/agents/panel/by-address?userAddress={address}`

**用途**: 在排行榜中点击其他用户 Agent 时加载详情

---

## WebSocket 实时数据

### Trench WebSocket 订阅

**Hook**: `useTrenchSocket`

```typescript
const { isConnected, transactions: realtimeTransactions } = useTrenchSocket(
  onChainTrenchId ?? null,
  {
    autoInvalidate: true,
    dbTrenchId: trenchId,
  },
);
```

**连接地址**: `${API_BASE_URL}/trench` (Socket.IO namespace)

**订阅事件**:

| 事件类型 | 描述 | 回调处理 |
|---------|------|---------|
| `TRENCH_UPDATE` | Trench 状态更新 | 刷新 trench detail 和 current 查询缓存 |
| `PRICE_UPDATE` | 价格更新 | 刷新 price curve 查询缓存 |
| `TRANSACTION` | 新交易发生 | 追加到本地交易列表，刷新 transactions 查询缓存 |
| `LEADERBOARD_UPDATE` | 排行榜更新 | 刷新 leaderboard 查询缓存 |
| `ERROR` | 错误事件 | 打印错误日志 |

**实现文件**:
- `src/hooks/use-trench-socket.ts`
- `src/services/websocket/client.ts`
- `src/services/websocket/trench.ts`

**关键特性**:
- 自动重连 (最多 5 次尝试)
- 断线时自动回退到 REST API 轮询
- 收到实时数据后自动 invalidate React Query 缓存

---

## Solana RPC 数据

### 1. Slot 订阅

**Hook**: `useSlotSubscription`

```typescript
const { slot: currentSlot } = useSlotSubscription();
```

**连接**: Solana RPC WebSocket (`connection.onSlotChange`)

**用途**: 
- 实时获取当前 Solana slot
- 用于计算回合进度 (currentBlock = currentSlot - biddingStartBlock)
- 用于判断当前阶段 (betting/trading/liquidation)

**实现文件**:
- `src/hooks/use-slot-subscription.ts`
- `src/services/solana/connection.ts`

---

### 2. Turnkey 钱包余额订阅

**Hook**: `useTurnkeyBalance`

```typescript
const { balance: turnkeyBalance } = useTurnkeyBalance(turnkeyAddress);
```

**连接**: Solana RPC WebSocket (`connection.onAccountChange`)

**用途**:
- 实时监控 Agent 的 Turnkey 钱包 SOL 余额
- 用于 AgentDashboardCard 显示

**数据存储**: `useTurnkeyBalanceStore` (Zustand)

**实现文件**:
- `src/hooks/use-turnkey-balance.ts`
- `src/services/solana/balance.ts`

```typescript
// balance.ts 核心函数
export async function getBalance(address: string): Promise<number>;
export function subscribeBalance(address: string, callback: (balance: number) => void): () => void;
```

---

## 本地存储数据

### 首次访问检测

**Hook**: `useFirstVisit`

```typescript
const { isFirstVisit, markVisited } = useFirstVisit();
```

**存储键**: `eva_welcome_seen`

**用途**: 控制欢迎引导 Modal 的显示

**实现文件**: `src/hooks/use-first-visit.ts`

---

## 数据转换层

所有后端数据到前端 UI 类型的转换在 `src/lib/trench-utils.ts` 中实现。

### 1. Trench → ArenaRound

**函数**: `trenchToArenaRound`

```typescript
const currentRound: ArenaRound | null = useMemo(() => {
  return trenchToArenaRound(trenchData ?? null, currentSlot, leaderboardData);
}, [trenchData, currentSlot, leaderboardData]);
```

**转换逻辑**:
- 使用 Solana slot 计算当前区块进度
- 根据区块号判断阶段 (betting: 0-299, trading: 300-2699, liquidation: 2700-3000)
- 计算奖池金额和 Token 价格
- 从排行榜提取获胜者信息

---

### 2. Leaderboard → Rankings

**函数**: `leaderboardToRankings`

```typescript
const rankings = useMemo(() => {
  return leaderboardToRankings(
    leaderboardData,
    trenchData?.totalDepositedSol,
  );
}, [leaderboardData, trenchData?.totalDepositedSol]);
```

**转换内容**:
- Token 余额单位转换 (1e6)
- 计算持仓百分比
- SOL 余额单位转换 (1e9)
- 标记当前用户的 Agent

---

### 3. 获取当前用户排名 (未进前三时)

**函数**: `getCurrentUserRanking`

```typescript
const currentUserRanking = useMemo(() => {
  return getCurrentUserRanking(
    leaderboardData,
    trenchData?.totalDepositedSol,
  );
}, [leaderboardData, trenchData?.totalDepositedSol]);
```

---

### 4. Transactions → Activities

**函数**: `transactionsToActivities`

```typescript
const activities = useMemo(() => {
  // 合并实时和轮询获取的交易，去重
  const realtimeTxs = realtimeTransactions.map(tx => ({...}));
  const realtimeIds = new Set(realtimeTxs.map(tx => tx.id));
  const fetchedTxs = (transactionsData?.transactions ?? [])
    .filter(tx => !realtimeIds.has(tx.id));
  const allTransactions = [...realtimeTxs, ...fetchedTxs];
  
  return transactionsToActivities(allTransactions);
}, [transactionsData, realtimeTransactions]);
```

**去重策略**: 实时数据优先，ID 去重

---

## 数据流图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              数据获取层                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐     ┌────────────────────┐     ┌──────────────┐ │
│  │  useCurrentTrench  │     │  useTrenchSocket   │     │useSlotSub    │ │
│  │  (轮询 5s)          │     │  (WebSocket)       │     │(Solana WS)   │ │
│  └─────────┬──────────┘     └─────────┬──────────┘     └──────┬───────┘ │
│            │                          │                        │        │
│            ▼                          ▼                        ▼        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        trenchToArenaRound()                          ││
│  │   输入: trenchData + currentSlot + leaderboardData                   ││
│  │   输出: ArenaRound { phase, currentBlock, totalBlocks, ... }         ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│  ┌────────────────────┐            ▼                                    │
│  │   useLeaderboard   │ ──► leaderboardToRankings()                     │
│  │   (轮询 5s)         │     输出: AgentRanking[]                        │
│  └────────────────────┘                                                 │
│                                                                          │
│  ┌────────────────────┐                                                 │
│  │useTrenchTransactions│                                                │
│  │   (轮询 5s)         │ ──┐                                            │
│  └────────────────────┘    │                                            │
│                            ▼                                            │
│  ┌────────────────────┐   ┌────────────────────────────────────────────┐│
│  │useTrenchSocket     │   │ 实时 + 轮询数据合并 (ID去重)                 ││
│  │ transactions       │ ──► transactionsToActivities()                  ││
│  └────────────────────┘   │ 输出: ActivityItem[]                        ││
│                            └────────────────────────────────────────────┘│
│                                                                          │
│  ┌────────────────────┐     ┌────────────────────┐                      │
│  │    useMyAgents     │     │ useTurnkeyBalance  │                      │
│  │   (需登录)          │     │ (Solana WS 订阅)   │                      │
│  └─────────┬──────────┘     └─────────┬──────────┘                      │
│            │                          │                                  │
│            ▼                          ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                   AgentDashboardCard                                 ││
│  │   agent.balance ← turnkeyBalance || primaryAgent.currentBalance      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌────────────────────┐                                                 │
│  │   useFirstVisit    │ ──► 控制 WelcomeOnboardingModal 显示            │
│  │  (localStorage)    │                                                 │
│  └────────────────────┘                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API 端点汇总

| 端点 | 方法 | 用途 | 轮询 |
|-----|------|------|------|
| `/api/trenches/current` | GET | 获取当前回合 | 5s |
| `/api/trenches/{id}/leaderboard` | GET | 获取排行榜 | 5s |
| `/api/trenches/{id}/transactions` | GET | 获取交易记录 | 5s |
| `/api/agents` | GET | 获取用户 Agent 列表 | - |
| `/api/agents/{id}` | GET | 获取 Agent 详情 | - |
| `/api/agents/{id}/toggle` | PATCH | 切换 Agent 状态 | - |
| `/api/agents/panel/by-address` | GET | 通过地址获取 Agent 面板 | - |

---

## WebSocket 事件汇总

### Socket.IO (Trench Namespace)

| 事件 | 方向 | 描述 |
|-----|------|------|
| `subscribeTrench` | Client → Server | 订阅 Trench 更新 |
| `unsubscribeTrench` | Client → Server | 取消订阅 |
| `trenchUpdate` | Server → Client | Trench 状态变化 |
| `priceUpdate` | Server → Client | 价格变化 |
| `transaction` | Server → Client | 新交易 |
| `leaderboardUpdate` | Server → Client | 排行榜变化 |

### Solana RPC WebSocket

| 订阅类型 | 用途 |
|---------|------|
| `slotSubscribe` | 订阅 Slot 变化 (计算区块进度) |
| `accountSubscribe` | 订阅账户变化 (Turnkey 钱包余额) |

---

## 配置常量

```typescript
// src/hooks/use-trenches.ts
export const POLLING_INTERVAL = 5000; // 轮询间隔 (ms)

// src/lib/trench-utils.ts
export const BLOCK_TIMING = {
  BIDDING_BLOCKS: 300,      // 竞价阶段区块数 (~2分钟)
  TRADING_BLOCKS: 2400,     // 交易阶段区块数 (~16分钟)
  LIQUIDATION_BLOCKS: 300,  // 清算阶段区块数 (~2分钟)
  TOTAL_BLOCKS: 3000,       // 总区块数
  MS_PER_BLOCK: 400,        // 每区块时间 (~400ms)
};
```

---

## 错误处理

1. **加载状态**: `isTrenchLoading` 显示 loading spinner
2. **错误状态**: `trenchError` 显示错误信息
3. **无数据状态**: `!currentRound` 显示 "等待下一回合" 提示
4. **WebSocket 断线**: 自动回退到 REST API 轮询

---

## 文件索引

| 文件路径 | 描述 |
|---------|------|
| `src/pages/arena.tsx` | 主页面组件 |
| `src/hooks/use-trenches.ts` | Trench 相关 Hooks |
| `src/hooks/use-agents.ts` | Agent 相关 Hooks |
| `src/hooks/use-trench-socket.ts` | WebSocket 订阅 Hook |
| `src/hooks/use-slot-subscription.ts` | Solana Slot 订阅 Hook |
| `src/hooks/use-turnkey-balance.ts` | 钱包余额订阅 Hook |
| `src/hooks/use-first-visit.ts` | 首次访问检测 Hook |
| `src/services/api/trenches.ts` | Trench API 服务 |
| `src/services/api/agents.ts` | Agent API 服务 |
| `src/services/websocket/client.ts` | WebSocket 客户端单例 |
| `src/services/websocket/trench.ts` | Trench WebSocket 订阅函数 |
| `src/services/solana/connection.ts` | Solana 连接管理 |
| `src/services/solana/balance.ts` | 余额查询和订阅 |
| `src/lib/trench-utils.ts` | 数据转换工具函数 |

