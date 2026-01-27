## ADDED Requirements

### Requirement: 通过用户地址获取 Agent Panel 数据

前端 SHALL 提供 API 函数，通过用户的 turnkey 地址获取对应 Agent 的面板数据。

#### Scenario: 成功获取 Agent Panel 数据

- **GIVEN** 用户在 Arena 页面的 Live Rankings 中
- **WHEN** 用户点击某个 Agent 行
- **THEN** 系统打开 Agent 详情弹框
- **AND** 系统调用 `GET /api/agents/panel/by-address?userAddress={turnkeyAddress}` 获取 Agent 数据
- **AND** 弹框显示从 API 返回的真实数据（SOL Balance、Token Balance、Round PnL、Total PnL）

#### Scenario: 处理 API 请求失败

- **GIVEN** 用户点击了 Live Rankings 中的 Agent
- **WHEN** API 请求失败或返回空数据
- **THEN** 弹框 SHALL 显示从 ranking 数据中获取的默认值
- **AND** 系统 SHALL 在控制台记录错误信息

### Requirement: Agent Panel 数据格式转换

前端 SHALL 将后端 `AgentPanelDto` 格式转换为 `AgentDetailData` 格式供弹框使用。

#### Scenario: 正确转换数据格式

- **GIVEN** API 返回 `AgentPanelDto` 数据
- **WHEN** 系统处理响应数据
- **THEN** 系统 SHALL 转换字段映射：
  - `agentId` ← `AgentPanelDto.id`
  - `agentName` ← `AgentPanelDto.name`
  - `agentAvatar` ← `AgentPanelDto.logo`
  - `totalPnl` ← `AgentPanelDto.totalPnl`
  - `roundPnl` ← `AgentPanelDto.roundPnl`（lamports 字符串转换为 SOL 数值）
  - `tokenBalance` ← 从 ranking 数据获取
  - `solBalance` ← 默认为 0（或从其他来源获取）
  - `recentActions` ← 空数组（由弹框内部加载）

### Requirement: Live Rankings 传递回调

`LiveRankings` 组件 SHALL 接收 `onLoadAgentDetail` 回调并在点击 Agent 时调用。

#### Scenario: 传递并调用加载回调

- **GIVEN** Arena 页面渲染 `LiveRankings` 组件
- **WHEN** 用户点击 Agent 行
- **THEN** 组件 SHALL 调用 `onLoadAgentDetail(agentId)` 回调
- **AND** 等待回调返回的 `AgentDetailData` 并传递给 `AgentDetailModal`

