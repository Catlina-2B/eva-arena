## MODIFIED Requirements

### Requirement: Agent Dashboard Card Execution Logs

AgentDashboardCard 组件 SHALL 展示当前登录用户在当前 trench 的真实交易记录，而非 mock 数据。

组件必须:
- 接收 `trenchId` 作为 props
- 使用 `useUserTransactions` hook 获取用户交易记录
- 从 auth store 获取当前登录用户的 wallet address
- 将 TransactionDto 格式转换为 ExecutionLogEntry 格式展示
- 支持加载状态和空状态展示

#### Scenario: 展示用户在当前 round 的交易记录

- **WHEN** 用户已登录且 Arena 页面显示 AgentDashboardCard
- **THEN** 组件调用 trench transactions 接口
- **AND** 传入当前 trenchId 和用户的 wallet address
- **AND** 在 EXECUTION LOGS 区域展示用户的交易记录列表

#### Scenario: 交易记录加载中

- **WHEN** 交易记录正在加载
- **THEN** 展示加载指示器

#### Scenario: 无交易记录

- **WHEN** 用户在当前 trench 没有交易记录
- **THEN** 展示空状态提示信息

