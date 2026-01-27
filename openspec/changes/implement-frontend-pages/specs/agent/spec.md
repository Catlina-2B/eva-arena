# Agent Capability

## ADDED Requirements

### Requirement: My Agent 页面

系统 SHALL 提供 My Agent 页面（路径 `/my-agent`），用于管理用户的 AI Agent。

#### Scenario: 页面访问

- **GIVEN** 用户已连接钱包
- **WHEN** 点击导航栏 MY AGENT 链接
- **THEN** 跳转到 My Agent 页面
- **AND** 显示用户的 Agent 列表

#### Scenario: 未登录访问

- **GIVEN** 用户未连接钱包
- **WHEN** 访问 /my-agent 路径
- **THEN** 显示引导用户连接钱包的提示

### Requirement: Agent 卡片展示

系统 SHALL 以卡片形式展示用户的 Agent 信息。

#### Scenario: Agent 信息显示

- **GIVEN** 用户有一个名为 "Eva.1" 的 Agent
- **WHEN** 查看 Agent 卡片
- **THEN** 显示 Agent 头像/图标
- **AND** 显示 Agent 名称 "Eva.1"
- **AND** 显示创建时间

### Requirement: 创建 Agent 入口

系统 SHALL 提供创建 Agent 的入口，引导用户创建新的 AI Agent。

#### Scenario: 创建入口显示

- **GIVEN** 用户在 My Agent 页面
- **WHEN** 查看页面
- **THEN** 显示 "Create Agent" 入口按钮/卡片

#### Scenario: 触发创建流程

- **GIVEN** 用户点击创建入口
- **WHEN** 操作执行
- **THEN** 打开 Create Agent 模态框

### Requirement: Agent 资金面板

系统 SHALL 显示 Agent 的资金信息，包括余额和充值/提款操作。

#### Scenario: 资金信息展示

- **GIVEN** Agent 账户有 14.02 SOL
- **WHEN** 查看 FUNDS 区域
- **THEN** 显示 "AVAILABLE BALANCE: 14.02 SOL"
- **AND** 显示 TOTAL DEPOSIT 累计充值金额
- **AND** 显示 DEPOSIT 和 WITHDRAW 按钮

#### Scenario: 充值操作

- **GIVEN** 用户点击 DEPOSIT 按钮
- **WHEN** 操作执行
- **THEN** 打开充值模态框

### Requirement: Agent 历史轮次

系统 SHALL 显示 Agent 参与的历史轮次记录。

#### Scenario: 历史列表展示

- **GIVEN** Agent 参与过多个轮次
- **WHEN** 查看 History 区域
- **THEN** 显示轮次列表（如 "ROUND: EVA - 83999"）
- **AND** 显示每轮的排名信息
- **AND** 点击可展开查看详情

### Requirement: 交易历史记录

系统 SHALL 显示 Agent 的详细交易历史记录。

#### Scenario: 交易记录表格

- **GIVEN** Agent 有交易记录
- **WHEN** 查看 TRADE HISTORY 区域
- **THEN** 显示表格包含：时间、类型、Token、数量、价格
- **AND** 按时间降序排列

### Requirement: 创建 Agent 表单

系统 SHALL 提供创建 Agent 的表单，包含必要的配置项。

#### Scenario: 表单字段展示

- **GIVEN** 用户打开创建 Agent 模态框
- **WHEN** 查看表单
- **THEN** 显示 Agent 名称输入框（必填，20字符以内）
- **AND** 显示 Logo 上传/选择区域
- **AND** 显示执行频率设置（固定 10s）
- **AND** 显示 CREATE 按钮

#### Scenario: 表单验证

- **GIVEN** 用户未填写 Agent 名称
- **WHEN** 点击 CREATE 按钮
- **THEN** 显示验证错误提示
- **AND** 不提交表单

#### Scenario: 成功创建

- **GIVEN** 用户填写了有效的表单数据
- **WHEN** 点击 CREATE 按钮
- **THEN** 显示加载状态
- **AND** 创建成功后关闭模态框
- **AND** 新 Agent 出现在列表中

