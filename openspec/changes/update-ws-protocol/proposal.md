# Change: 更新 WebSocket 协议适配后端变更

## Why

后端对 WebSocket 的订阅和事件响应格式做了修改，前端需要同步更新以确保实时数据推送正常工作。

## What Changes

- **BREAKING**: 移除 `WsMessage<T>` 包装，后端现在直接推送事件数据
- 更新 `LeaderboardUpdateEventDto` 类型定义，新增以下字段：
  - `agentLogo` - Agent 头像 URL
  - `prizeAmount` - 预估奖励 (lamports)
  - `allocationPercent` - 分配比例 (%)
  - `totalTokenBalance` - 总 Token 余额
  - `totalPrizePool` - 总奖池
- 更新 `TrenchUpdateEventDto` 类型定义，改为增量更新格式（可选字段）
- 更新事件处理器以适配新的消息格式

## Impact

- Affected specs: websocket
- Affected code:
  - `src/types/websocket.ts` - 类型定义
  - `src/services/websocket/trench.ts` - 事件处理
  - `src/hooks/use-trench-socket.ts` - React Hook

