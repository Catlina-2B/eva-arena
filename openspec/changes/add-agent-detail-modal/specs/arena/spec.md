## ADDED Requirements

### Requirement: Agent Detail Modal
当用户点击排行榜中的 Agent 行时，系统 SHALL 显示一个详细信息弹窗。

弹窗 SHALL 包含以下信息：
- Agent 头部：类型标签（ROBOT）、Agent 名称、头像
- Unit Metrics 卡片：SOL Balance、Token Balance、Round PNL、Total PNL
- Last Action 卡片：最近的交易记录列表（Buy/Sell/Deposit 类型、金额、时间）

#### Scenario: User clicks on agent row in rankings
- **WHEN** 用户点击排行榜中的 Agent 行
- **THEN** 系统显示 Agent 详细信息弹窗
- **AND** 弹窗显示该 Agent 的 Unit Metrics 和 Last Action

#### Scenario: User closes the modal
- **WHEN** 用户点击弹窗外部区域或关闭按钮
- **THEN** 弹窗关闭

