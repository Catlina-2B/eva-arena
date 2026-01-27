# WebSocket Protocol Update

## MODIFIED Requirements

### Requirement: WebSocket 事件消息格式

前端 WebSocket 客户端 SHALL 直接接收事件数据，而不是包装在 `WsMessage<T>` 结构中。

#### Scenario: 接收 trenchUpdate 事件
- **WHEN** 服务器推送 `trenchUpdate` 事件
- **THEN** 事件处理器直接接收 `TrenchUpdateEventDto` 数据（非 `WsMessage<TrenchUpdateEventDto>`）

#### Scenario: 接收 leaderboardUpdate 事件
- **WHEN** 服务器推送 `leaderboardUpdate` 事件
- **THEN** 事件处理器直接接收 `LeaderboardUpdateEventDto` 数据

### Requirement: TrenchUpdate 增量更新格式

`TrenchUpdateEventDto` SHALL 支持增量更新，所有字段（除 `trenchId` 和 `trenchPda`）为可选。

```typescript
interface TrenchUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  status?: string;              // 状态: BIDDING | TRADING | ENDED
  realSolReserves?: string;     // 实际 SOL 储备 (lamports)
  prizePoolReserves?: string;   // 奖池储备 (lamports)
  activeAgentsCount?: number;   // 活跃 Agent 数量
  tokenPriceSol?: string | null; // Token 价格 (SOL)
  tokenPriceUsd?: string | null; // Token 价格 (USD)
  totalDepositedSol?: string;   // 总存入 SOL (lamports)
}
```

#### Scenario: 接收部分字段更新
- **WHEN** 用户 Deposit 触发 trenchUpdate
- **THEN** 仅包含 `totalDepositedSol`, `prizePoolReserves` 等变化字段

### Requirement: Leaderboard 排行榜数据格式

`LeaderboardUpdateEventDto` SHALL 包含完整的排行榜信息，包括奖励预估。

```typescript
interface LeaderboardItemEventDto {
  rank: number;                // 排名 (1, 2, 3)
  participantId: number;
  userAddress: string;
  agentPda: string;
  agentName: string | null;    // Agent 名称
  agentLogo: string | null;    // Agent 头像 URL
  tokenBalance: string;        // Token 余额
  depositedSol: string;        // 已存入 SOL
  pnlSol: string;              // 预估 PNL (lamports)
  prizeAmount: string;         // 预估奖励 (lamports)
  allocationPercent: string;   // 分配比例 (%)
}

interface LeaderboardUpdateEventDto {
  trenchId: number;
  trenchPda: string;
  topThree: LeaderboardItemEventDto[];
  totalParticipants: number;
  totalTokenBalance: string;   // 总 Token 余额
  totalPrizePool: string;      // 总奖池
}
```

#### Scenario: 排行榜包含奖励信息
- **WHEN** 服务器推送 leaderboardUpdate 事件
- **THEN** 每个排行榜项目包含 `prizeAmount` 和 `allocationPercent` 字段

