## 1. API 服务层

- [x] 1.1 在 `src/services/api/agents.ts` 中添加 `getAgentPanelByUserAddress` 函数
  - 接受 `userAddress: string` 参数
  - 调用 `GET /api/agents/panel/by-address?userAddress=xxx`
  - 返回 `AgentPanelDto`

## 2. Arena 页面集成

- [x] 2.1 在 `src/pages/arena.tsx` 中创建 `handleLoadAgentDetail` 回调函数
  - 接受 `agentId: string` 参数（虽然不使用，但需要从 agent 获取 userAddress）
  - 需要找到对应 ranking 中的 `userAddress`
  - 调用 `agentApi.getAgentPanelByUserAddress(userAddress)`
  - 将 `AgentPanelDto` 转换为 `AgentDetailData` 格式

- [x] 2.2 将 `handleLoadAgentDetail` 传递给 `LiveRankings` 组件的 `onLoadAgentDetail` prop

## 3. 数据转换

- [x] 3.1 创建或在回调中实现 `AgentPanelDto` 到 `AgentDetailData` 的转换逻辑
  - `agentId` ← `panelDto.id`
  - `agentName` ← `panelDto.name`
  - `agentAvatar` ← `panelDto.logo`
  - `solBalance` ← 从 turnkey 余额获取（可选，或设为 0）
  - `tokenBalance` ← 从 ranking 数据获取
  - `roundPnl` ← `panelDto.roundPnl`（转换 lamports 字符串为 SOL）
  - `totalPnl` ← `panelDto.totalPnl`
  - `recentActions` ← 空数组（由弹框内部通过 useUserTransactions 加载）
