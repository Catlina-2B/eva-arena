## ADDED Requirements

### Requirement: Agent WAITING Status Display
系统 SHALL 支持显示 Agent 的 WAITING（等待下一轮）状态，当 Agent 被设置为等待下一轮启动时，前端需要正确展示该状态。

#### Scenario: WAITING 状态在首页 Dashboard 卡片中的显示
- **WHEN** Agent 的 status 为 "WAITING"
- **THEN** 右上角 Badge 显示 "PAUSED"，使用 warning 样式
- **AND** 操作按钮显示灰色背景（#4b5563）
- **AND** 按钮显示沙漏图标和 "WAITING NEXT ROUND" 文字
- **AND** 按钮禁用用户点击

#### Scenario: WAITING 状态在 My Agent 页面中的显示
- **WHEN** Agent 的 status 为 "WAITING"
- **THEN** 右上角 Badge 显示 "PAUSED"，使用 default 样式
- **AND** 操作按钮显示灰色背景（#4b5563）
- **AND** 按钮显示沙漏图标和 "WAITING NEXT ROUND" 文字
- **AND** 按钮禁用用户点击

#### Scenario: WAITING 状态到 ACTIVE 状态的转换
- **WHEN** 新一轮开始且 Agent 状态从 WAITING 变为 ACTIVE
- **THEN** 界面自动更新显示 RUNNING 状态
- **AND** 按钮变为绿色 PAUSE 按钮

## MODIFIED Requirements

### Requirement: Agent Status Type Definition
Agent 状态类型 SHALL 包含三种状态：ACTIVE（运行中）、PAUSED（已暂停）、WAITING（等待下一轮）。

#### Scenario: API 返回 WAITING 状态
- **WHEN** 后端 API 返回 Agent 的 status 为 "WAITING"
- **THEN** 前端正确解析并映射为 waiting 状态
- **AND** 界面显示对应的 WAITING 状态 UI
