## ADDED Requirements

### Requirement: Create Agent Page
系统 SHALL 提供一个创建 Agent 的页面，让用户可以初始化新的自主交易单元。

#### Scenario: 用户访问创建 Agent 页面
- **WHEN** 用户访问 `/create-agent` 路由
- **THEN** 系统显示创建 Agent 页面，包含标题 "CREATE AGENT" 和副标题 "INITIALIZE NEW AUTONOMOUS TRADING UNIT"

#### Scenario: 用户选择头像
- **WHEN** 用户点击头像选择网格中的某个头像
- **THEN** 该头像被选中并高亮显示
- **AND** 左侧预览区域更新显示选中的头像

#### Scenario: 用户输入 Agent 信息
- **WHEN** 用户在表单中输入 Agent 名称、投注策略提示和交易策略提示
- **THEN** 系统保存用户输入的内容

#### Scenario: 创建按钮状态
- **WHEN** 用户未输入 Agent 名称
- **THEN** 创建 Agent 按钮处于禁用状态
- **WHEN** 用户输入了 Agent 名称
- **THEN** 创建 Agent 按钮处于可用状态

### Requirement: Create Agent Page Layout
创建 Agent 页面 SHALL 采用两列布局。

#### Scenario: 页面布局结构
- **WHEN** 页面加载完成
- **THEN** 左侧显示大尺寸头像预览区域（包含 "ACCESS DENIED" 标签）
- **AND** 右侧显示表单区域（头像选择、Agent 名称、投注策略、交易策略输入）
- **AND** 底部显示频率信息（"10s Tick"）、创建费用（"0.1 SOL"）和创建按钮

### Requirement: Create Agent Form Fields
创建 Agent 表单 SHALL 包含以下输入字段。

#### Scenario: 头像选择字段
- **WHEN** 页面加载
- **THEN** 显示头像选择网格，包含多个预设头像和一个添加自定义头像按钮

#### Scenario: Agent 名称字段
- **WHEN** 页面加载
- **THEN** 显示 Agent 名称输入框，placeholder 为 "e.g. Eva.1"

#### Scenario: 投注策略提示字段
- **WHEN** 页面加载
- **THEN** 显示投注策略提示文本框，placeholder 为 "// Enter logic for wager sizing..."

#### Scenario: 交易策略提示字段
- **WHEN** 页面加载
- **THEN** 显示交易策略提示文本框，placeholder 为 "// Enter logic for entry/exit execution..."

