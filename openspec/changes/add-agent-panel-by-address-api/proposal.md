# Change: 为 Live Rankings Agent 弹框添加 Agent Panel API 集成

## Why

在 Arena 页面的 Live Rankings 组件中，点击 Agent 会弹出 Agent 详情弹框 (`AgentDetailModal`)，但目前弹框中的 Agent 数据（如 SOL 余额、Total PnL、Round PnL 等）未能从后端获取真实数据。后端已有 `GET /api/agents/panel/by-address?userAddress=xxx` 接口，可以通过用户的 turnkey 地址获取 Agent Panel 数据。

## What Changes

1. **API 服务层**: 在 `src/services/api/agents.ts` 中添加 `getAgentPanelByUserAddress` 函数，调用 `GET /api/agents/panel/by-address` 接口
2. **Arena 页面**: 在 `src/pages/arena.tsx` 中实现 `onLoadAgentDetail` 回调，调用新的 API 获取 Agent 数据
3. **数据转换**: 将后端返回的 `AgentPanelDto` 转换为前端 `AgentDetailData` 格式

## Impact

- **Affected specs**: arena-agent-modal (新增)
- **Affected code**:
  - `src/services/api/agents.ts` - 添加新的 API 函数
  - `src/pages/arena.tsx` - 实现 `onLoadAgentDetail` 回调
  - `src/components/arena/live-rankings.tsx` - 传递回调 (已支持)
  - `src/components/arena/agent-detail-modal.tsx` - 显示数据 (已支持)

