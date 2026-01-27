# Change: 修复 My Agent History 模块接口调用

## Why

当前 my-agent 页面的 History 模块使用了错误的接口。它调用了 `GET /api/agents/:id/trenches` 来获取历史记录，但应该使用 `GET /api/trenches/history` 接口来获取用户的 Trench 参与历史。展开时获取交易记录也应该使用 `GET /api/trenches/:trenchId/transactions` 接口，而非 Agent 相关的接口。

## What Changes

- **BREAKING**: 修改 History 模块的数据获取逻辑
  - 将 `useAgentTrenches` hook 替换为新的 `useTrenchHistory` hook，调用 `GET /api/trenches/history`
  - 展开 History Row 时使用 `useTrenchTransactions` hook 获取该轮的交易记录，调用 `GET /api/trenches/:trenchId/transactions`
- 在 `trenchApi` 中添加 `getTrenchHistory` 方法
- 在 `use-trenches.ts` 中添加 `useTrenchHistory` hook
- 添加 `TrenchHistoryItemDto` 和 `TrenchHistoryResponseDto` 类型定义
- 更新 `my-agent.tsx` 中的数据转换逻辑以适配新的响应格式

## Impact

- Affected specs: my-agent
- Affected code:
  - `src/types/api.ts` - 添加新的类型定义
  - `src/services/api/trenches.ts` - 添加新的 API 方法
  - `src/hooks/use-trenches.ts` - 添加新的 hook
  - `src/hooks/index.ts` - 导出新的 hook
  - `src/pages/my-agent.tsx` - 更新数据获取逻辑

