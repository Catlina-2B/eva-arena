# Tasks: 更新 WebSocket 协议

## 1. 类型定义更新

- [x] 1.1 更新 `TrenchUpdateEventDto` 为增量更新格式（所有字段可选）
- [x] 1.2 更新 `LeaderboardItemEventDto` 新增 `agentLogo`, `prizeAmount`, `allocationPercent` 字段
- [x] 1.3 更新 `LeaderboardUpdateEventDto` 新增 `totalTokenBalance`, `totalPrizePool` 字段
- [x] 1.4 移除 `WsMessage<T>` 包装的使用（后端直接推送数据）

## 2. 服务层更新

- [x] 2.1 更新 `src/services/websocket/trench.ts` 事件处理器，移除 `msg.data` 访问
- [x] 2.2 确保事件处理器直接接收事件数据
- [x] 2.3 将 `trenchId` 参数类型从 `number` 改为 `string`（使用链上 trenchId 而非数据库主键）

## 3. Hook 层更新

- [x] 3.1 更新 `use-trench-socket.ts`：
  - 将 `trenchId` 参数类型改为 `string`（链上 trench ID）
  - 新增 `dbTrenchId` 选项用于 query invalidation

## 4. 页面/组件更新

- [x] 4.1 更新 `arena.tsx`：传递链上 `trenchId` 给 WebSocket，`dbTrenchId` 用于 query invalidation
- [x] 4.2 更新 `trading-phase-chart.tsx`：使用正确的 trench ID

## 5. 验证

- [x] 5.1 TypeScript 编译通过，等待与后端联调验证

