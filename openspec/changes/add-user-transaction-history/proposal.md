# Change: 用户交易记录功能 - My Agent History 和 Arena Execution Logs

## Why

当前系统存在两个需要展示用户交易记录的地方：
1. My Agent 页面的 History 部分 - 使用 agent 的交易记录接口
2. Arena 页面的 AgentDashboardCard 组件的 EXECUTION LOGS - 目前使用 mock 数据

用户希望这两处都能展示自己的真实交易记录，需要调用 trench 的交易接口 (`/api/trenches/:trenchId/transactions`) 并传入用户登录的 wallet address 来过滤。

## What Changes

- 新增 `useUserTransactions` hook，调用 trench transactions 接口，支持传入 userAddress 参数
- 修改 My Agent 页面的 `HistoryRow` 组件，使用新的 `useUserTransactions` hook
- 修改 Arena 页面的 `AgentDashboardCard` 组件，使用新 hook 替换 mock 的 executionLogs
- 从 auth store 获取当前登录用户的 wallet address 作为查询参数

## Impact

- Affected specs: `my-agent`, `arena-components`
- Affected code:
  - `src/hooks/use-trenches.ts` - 新增 hook
  - `src/hooks/index.ts` - 导出新 hook
  - `src/pages/my-agent.tsx` - 使用新 hook
  - `src/components/arena/agent-dashboard-card.tsx` - 使用新 hook 替换 mock 数据
  - `src/pages/arena.tsx` - 传递 trenchId 和调用 hook

