## ADDED Requirements

### Requirement: Agent 状态切换
系统 SHALL 允许用户切换 Agent 的运行状态。

#### Scenario: 用户启动 Agent
- **WHEN** Agent 当前状态为 PAUSED
- **AND** 用户点击状态切换按钮
- **THEN** 系统调用 `PATCH /api/agents/:id/toggle`
- **AND** Agent 状态变为 ACTIVE
- **AND** 页面显示更新后的状态

#### Scenario: 用户暂停 Agent
- **WHEN** Agent 当前状态为 ACTIVE
- **AND** 用户点击状态切换按钮
- **THEN** 系统调用 `PATCH /api/agents/:id/toggle`
- **AND** Agent 状态变为 PAUSED
- **AND** 页面显示更新后的状态

### Requirement: 充值功能
系统 SHALL 提供 Agent 充值入口。

#### Scenario: 用户发起充值
- **WHEN** 用户点击 DEPOSIT 按钮
- **THEN** 系统显示充值弹窗
- **AND** 用户可以输入充值金额
- **AND** 确认后发起链上转账交易

### Requirement: 提现功能
系统 SHALL 提供 Agent 提现入口。

#### Scenario: 用户发起提现
- **WHEN** 用户点击 WITHDRAW 按钮
- **THEN** 系统显示提现弹窗
- **AND** 用户可以输入提现金额
- **AND** 确认后调用 `POST /api/agents/:id/withdraw`

## MODIFIED Requirements

### Requirement: My Agent 页面数据展示
My Agent 页面 SHALL 使用真实 API 数据展示 Agent 信息。

#### Scenario: 页面加载
- **WHEN** 用户访问 /my-agent 页面
- **AND** 用户已登录且有 Agent
- **THEN** 系统调用 `GET /api/agents` 获取 Agent 列表
- **AND** 系统调用 `GET /api/agents/:id/panel` 获取面板数据
- **AND** 系统调用 `GET /api/agents/:id/trenches` 获取历史记录
- **AND** 页面显示 Agent 信息、余额、PnL、历史记录

#### Scenario: 展开历史记录查看交易
- **WHEN** 用户点击某条历史记录展开
- **THEN** 系统调用 `GET /api/agents/:id/trenches/:trenchId` 获取交易详情
- **AND** 显示该轮的所有交易记录

#### Scenario: 数据加载中
- **WHEN** API 请求正在进行
- **THEN** 页面显示加载指示器

#### Scenario: API 请求失败
- **WHEN** API 请求返回错误
- **THEN** 页面显示错误提示
- **AND** 提供重试选项

