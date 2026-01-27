# Change: 添加 Agent 思考状态行与浮动思考列表

## Why

用户需要在 Arena 首页的 Agent Dashboard 中实时查看 Agent 的思考状态和决策历史。目前执行日志只显示交易记录，缺少 LLM 决策推理过程的展示。用户希望了解 Agent 为什么做出某个决策，以便优化策略。

## What Changes

### 1. Agent Dashboard 执行日志顶部添加思考状态行
- 在 `AgentDashboardCard` 组件的 EXECUTION LOGS 区域顶部添加一行，展示最新一条思考记录
- 显示内容包括：思考状态（ACTION/INACTION）、简要摘要
- 添加一个图标按钮，点击后打开 `ReasoningModal` 查看完整思考内容
- 参考 `my-agent.tsx` 中 `HistoryRow` 的交互模式

### 2. 大屏幕浮动思考按钮
- 在大屏幕尺寸（`lg` 及以上，即 `>=1024px`）下，网页右侧边缘浮动一个按钮
- 按钮图标使用灯泡或脑部图标，表示"思考"
- 支持拖拽功能，可以在垂直方向上拖动
- 支持左右吸附：拖拽到屏幕左半部分时吸附到左侧边缘，右半部分时吸附到右侧边缘

### 3. 浮动思考列表面板
- 点击浮动按钮后，在按钮旁边（根据吸附位置，左吸附时显示在右侧，右吸附时显示在左侧）展开一个思考列表面板
- 列表展示用户 Agent 的思考历史（调用 `/agents/think-reasons` API）
- 列表项包括：时间、Trench ID、状态（ACTION/INACTION）、摘要
- 点击列表项可打开 `ReasoningModal` 查看完整内容
- 支持分页或无限滚动加载更多

### 4. 新增 API 调用 Hook
- 创建 `useThinkReasons` Hook，封装 `/agents/think-reasons` API 调用
- 支持分页参数和 trenchId 过滤

## Impact

- **Affected specs**: agent-dashboard
- **Affected code**: 
  - `src/components/arena/agent-dashboard-card.tsx` - 添加思考状态行
  - `src/components/arena/index.ts` - 导出新组件
  - `src/components/arena/floating-think-button.tsx` - 新增浮动按钮组件
  - `src/components/arena/think-list-panel.tsx` - 新增思考列表面板
  - `src/hooks/use-think-reasons.ts` - 新增 API Hook
  - `src/hooks/index.ts` - 导出新 Hook
  - `src/services/api/agent.ts` - 添加 think-reasons API 方法
  - `src/types/api.ts` - 添加 ThinkReason 相关类型
  - `src/pages/arena.tsx` - 集成浮动按钮
