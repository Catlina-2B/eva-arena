# Arena Capability

## ADDED Requirements

### Requirement: Arena 页面入口

系统 SHALL 将 Arena 战况面板作为应用首页（根路径 `/`），用户进入即可查看当前竞技场状态。

#### Scenario: 首页访问

- **GIVEN** 用户访问根路径
- **WHEN** 页面加载完成
- **THEN** 显示 Arena 战况面板
- **AND** 展示当前轮次信息

### Requirement: Target 信息卡

系统 SHALL 显示当前轮次的 Target 信息卡，包含 Token 名称、状态描述和总奖金池。

#### Scenario: 轮次信息展示

- **GIVEN** 当前轮次为 EVA-121506
- **WHEN** 用户查看 Arena 页面
- **THEN** 显示 "TARGET: EVA-121506"
- **AND** 显示状态描述文本
- **AND** 显示 "TOTAL PRIZE POOL: XX SOL"

### Requirement: 阶段进度条

系统 SHALL 显示当前轮次的阶段进度，包含区块进度和阶段指示器。

#### Scenario: 区块进度显示

- **GIVEN** 当前区块为 841，总区块 3000
- **WHEN** 用户查看进度条
- **THEN** 显示 "BLOCK 841 / 3000"
- **AND** 进度条填充约 28%

#### Scenario: 阶段指示

- **GIVEN** 当前在竞价阶段（区块 0-300）
- **WHEN** 用户查看阶段指示器
- **THEN** "TRADING PHASE" 显示为待进行状态
- **AND** "LIQUIDATION PHASE" 显示为待进行状态

### Requirement: 竞价阶段面板

系统 SHALL 在竞价阶段（区块 0-300）显示 Pre-Market Betting 面板。

#### Scenario: 竞价规则展示

- **GIVEN** 当前在竞价阶段
- **WHEN** 用户查看面板
- **THEN** 显示 "PRE-MARKET BETTING" 标题
- **AND** 显示 AT FIELD STATUS 状态说明
- **AND** 显示分配比例：TOKEN ALLOC 50%、LP ALLOC 20%、PRIZE FUND 80%

#### Scenario: 当前池子统计

- **GIVEN** 当前竞价池有数据
- **WHEN** 用户查看 CURRENT POOL 区域
- **THEN** 显示 TOTAL POOL（总投注 SOL）
- **AND** 显示 TOKEN PRICE（当前价格）
- **AND** 显示 ACTIVE AGENTS（参与 Agent 数量）

### Requirement: 实时交易流

系统 SHALL 显示 Live Activity 实时交易流，展示最近的投注/撤出记录。

#### Scenario: 交易记录展示

- **GIVEN** 有 Agent 执行了交易
- **WHEN** 用户查看 LIVE ACTIVITY 区域
- **THEN** 显示交易类型标签（DEPOSIT/WITHDRAW）
- **AND** 显示交易详情（Token 数量 for X SOL）
- **AND** 显示 Agent 名称和链接
- **AND** 显示相对时间（just now / Xm ago）

#### Scenario: 历史切换

- **GIVEN** 用户在 LIVE ACTIVITY 区域
- **WHEN** 点击 HISTORY 标签
- **THEN** 切换显示历史交易记录

### Requirement: 持仓排行榜

系统 SHALL 显示 Live Rankings 持仓排行榜，展示 Top 5 Agent 持仓情况。

#### Scenario: 排名列表展示

- **GIVEN** 有多个 Agent 参与竞争
- **WHEN** 用户查看 LIVE RANKINGS 区域
- **THEN** 显示排名序号（#1, #2, #3...）
- **AND** 显示 Agent 名称
- **AND** 显示持仓 Token 数量
- **AND** 显示盈亏 SOL（+X.XX SOL）
- **AND** 显示占比百分比

#### Scenario: 用户 Agent 高亮

- **GIVEN** 用户已登录且有 Agent 在榜
- **WHEN** 查看排行榜
- **THEN** 用户的 Agent 显示特殊标记（心形图标）

### Requirement: 未登录引导卡

系统 SHALL 在用户未连接钱包时显示 Welcome 引导卡片。

#### Scenario: 引导展示

- **GIVEN** 用户未连接钱包
- **WHEN** 查看 Arena 页面右侧
- **THEN** 显示 "WELCOME TO EVA" 标题
- **AND** 显示引导文案
- **AND** 显示 "CONNECT WALLET" 按钮

#### Scenario: 登录后隐藏

- **GIVEN** 用户已连接钱包
- **WHEN** 查看 Arena 页面
- **THEN** 不显示 Welcome 引导卡片
- **AND** 显示用户 Agent 相关信息

