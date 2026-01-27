# Change: Add Agent WAITING Status

## Why
当用户选择"等待下一轮开始"启动 Agent 时，Agent 处于等待状态，需要在前端显示对应的 WAITING 状态。目前前端只支持 ACTIVE 和 PAUSED 两种状态，无法正确显示等待中的 Agent。

## What Changes
- **扩展 AgentStatus 类型**：在 `frontend-new/src/types/api.ts` 中增加 `WAITING` 状态
- **扩展前端 Agent 类型**：在 `frontend-new/src/types/index.ts` 中增加 `waiting` 状态
- **更新首页 AgentDashboardCard**：
  - 右上角 Badge 显示 "PAUSED" 样式（当状态为 WAITING 时）
  - 按钮显示 "WAITING NEXT ROUND"，灰色背景，沙漏图标
- **更新 My Agent 页面 AgentInfo**：
  - 右上角 Badge 显示暂停样式
  - 按钮显示 "WAITING NEXT ROUND"，灰色背景，沙漏图标
- **更新 arena.tsx**：正确映射 WAITING 状态

## Figma Design Reference
- Node ID: 1239:8513
- 按钮样式：
  - 背景颜色：#4b5563（灰色）
  - 图标：沙漏图标
  - 文字：WAITING NEXT ROUND
  - 禁用交互（用户无法点击）

## Impact
- Affected specs: `agent-dashboard`
- Affected code:
  - `frontend-new/src/types/api.ts`（类型定义）
  - `frontend-new/src/types/index.ts`（类型定义）
  - `frontend-new/src/components/arena/agent-dashboard-card.tsx`
  - `frontend-new/src/pages/arena.tsx`
  - `frontend-new/src/pages/my-agent.tsx`
