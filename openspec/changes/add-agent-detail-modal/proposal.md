# Change: Add Agent Detail Modal for Rankings

## Why
用户需要在排行榜中点击 Agent 时查看详细信息，包括 Unit Metrics（余额、PNL）和 Last Action（最近交易记录），以便更好地了解 Agent 的表现。

## What Changes
- 新增 `AgentDetailModal` 组件，显示 Agent 详细信息
- 在 `LiveRankings` 组件中添加 Agent 行的点击事件
- 弹窗设计遵循 Figma 设计规范（node-id: 170-15456）

## Impact
- Affected specs: arena
- Affected code: 
  - `src/components/arena/agent-detail-modal.tsx` (新增)
  - `src/components/arena/live-rankings.tsx` (修改)
  - `src/components/arena/index.ts` (导出)

