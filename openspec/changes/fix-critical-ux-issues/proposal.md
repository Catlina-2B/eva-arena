# Change: Fix Critical UX Issues from Alpha Feedback

## Why
Alpha 阶段直播反馈和用户测试暴露了 5 个直接影响参与率和留存的 UX 问题。这些问题导致用户无法理解正在发生什么、无法找到关键功能入口、在低配设备上体验很差。

## What Changes
- 将 Agent Reasoning 区块移至 AgentDashboardCard 顶部（紧接 Agent 信息之后），使 AI 思考过程始终可见
- 在 Trading Phase 图表上添加缩放/拖拽操作提示，首次展示时自动显示
- 在 Agent 创建流程中为策略预设添加结构化摘要卡，将长文本 prompt 折叠为可展开的高级选项
- 添加 Tab Visibility 感知：非活跃 tab 暂停 WebSocket 订阅，切回时恢复并刷新数据；价格更新添加 throttle

## Impact
- Affected code: `agent-dashboard-card.tsx`, `trading-phase-chart.tsx`, `step-betting-strategy.tsx`, `step-trading-strategy.tsx`, `strategy-presets.ts`, `use-trench-socket.ts`, `use-slot-subscription.ts`, `use-turnkey-balance.ts`, `client.ts`
