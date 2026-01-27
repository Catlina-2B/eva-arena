## 1. 类型定义

- [x] 1.1 在 `src/types/api.ts` 添加 `TrenchHistoryItemDto` 类型
- [x] 1.2 在 `src/types/api.ts` 添加 `TrenchHistoryResponseDto` 类型

## 2. API 服务层

- [x] 2.1 在 `src/services/api/trenches.ts` 添加 `getTrenchHistory` 方法

## 3. Hooks 层

- [x] 3.1 在 `src/hooks/use-trenches.ts` 添加 `useTrenchHistory` hook
- [x] 3.2 在 `src/hooks/index.ts` 导出 `useTrenchHistory`

## 4. 页面组件更新

- [x] 4.1 修改 `src/pages/my-agent.tsx` 将 `useAgentTrenches` 替换为 `useTrenchHistory`
- [x] 4.2 更新 `historyItemToRound` 函数以适配 `TrenchHistoryItemDto`
- [x] 4.3 更新 `HistoryRow` 组件中的交易记录获取逻辑，使用 `useTrenchTransactions` 并传递 `userAddress`
- [x] 4.4 移除不再使用的 `useAgentTrenches` 导入
