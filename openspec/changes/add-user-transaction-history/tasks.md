## 1. Implementation

- [x] 1.1 在 `src/hooks/use-trenches.ts` 中新增 `useUserTransactions` hook
  - 调用 `trenchApi.getTransactions(trenchId, { userAddress, ...params })`
  - 接收 trenchId、userAddress 和其他查询参数

- [x] 1.2 在 `src/hooks/index.ts` 中导出 `useUserTransactions`

- [x] 1.3 修改 `src/pages/my-agent.tsx` 中的 `HistoryRow` 组件
  - 从 auth store 获取当前登录用户的 wallet address
  - 将 `useAgentTransactions` 替换为 `useUserTransactions`
  - 传入 trenchId 和用户 address 来获取交易记录

- [x] 1.4 修改 `src/components/arena/agent-dashboard-card.tsx` 的 EXECUTION LOGS
  - 移除 mock 的 `executionLogs` props
  - 新增 `trenchId` props
  - 在组件内部使用 `useUserTransactions` hook 获取用户交易记录
  - 将 TransactionDto 转换为 ExecutionLogEntry 格式展示

- [x] 1.5 修改 `src/pages/arena.tsx`
  - 从当前 trench 获取 trenchId
  - 传递 trenchId 给 AgentDashboardCard 组件
  - 移除 mock 的 executionLogs 数据

