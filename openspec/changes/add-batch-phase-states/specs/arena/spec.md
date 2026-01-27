## ADDED Requirements

### Requirement: 交易阶段图表面板

系统 SHALL 在交易阶段（区块 300-2700）且有投注记录时显示 TradingPhaseChart 组件。

#### Scenario: 图表面板展示

- **GIVEN** 当前阶段为 trading
- **AND** 竞价阶段有 Agent 投注
- **WHEN** 用户查看 Arena 页面
- **THEN** 显示 EVA/SOL 交易对标识和当前价格
- **AND** 显示 TradingView 曲线图（Line Chart）
- **AND** 显示时间周期选择器（1M/5M/15M）
- **AND** 5M 为默认选中状态

#### Scenario: 时间周期切换

- **GIVEN** 用户在交易图表页面
- **WHEN** 点击 15M 按钮
- **THEN** 图表切换为 15 分钟周期曲线
- **AND** 15M 按钮显示选中状态

### Requirement: 结算阶段面板

系统 SHALL 在结算阶段（区块 2700-3000）显示 RoundSettlement 组件。

#### Scenario: 结算信息展示

- **GIVEN** 当前阶段为 liquidation
- **WHEN** 用户查看 Arena 页面
- **THEN** 显示 "ROUND SETTLEMENT" 标题
- **AND** 显示 FINAL PRIZE POOL 和金额
- **AND** 显示 WINNERS (TOP 3) 列表

#### Scenario: 获胜者列表展示

- **GIVEN** 结算阶段有获胜者数据
- **WHEN** 用户查看获胜者区域
- **THEN** 显示 #1 Agent 名称和奖励（50%）
- **AND** 显示 #2 Agent 名称和奖励（30%）
- **AND** 显示 #3 Agent 名称和奖励（15%）
- **AND** 显示 Others 和奖励（5%）

#### Scenario: 下一轮倒计时

- **GIVEN** 当前在结算阶段
- **WHEN** 用户查看结算面板
- **THEN** 显示 "NEXT ROUND" 标签和倒计时
- **AND** 倒计时格式为 MM:SS

### Requirement: 无投注轮次跳过

系统 SHALL 在交易阶段但无投注记录时显示 RoundSkipped 组件。

#### Scenario: 跳过提示展示

- **GIVEN** 当前阶段为 trading
- **AND** 竞价阶段无人投注（hasBets = false）
- **WHEN** 用户查看 Arena 页面
- **THEN** 显示 "ROUND EXCEPTION" 警告标签
- **AND** 显示 "Due to no bets being placed during the free betting phase"
- **AND** 显示 "The current round is skipped"（skipped 带下划线）
- **AND** 显示 "/// NEED TO WAIT FOR THE NEXT ARENA ROUND TO OPEN ///"

#### Scenario: 下一轮初始化倒计时

- **GIVEN** 当前轮次被跳过
- **WHEN** 用户查看跳过面板
- **THEN** 显示彩色边框倒计时卡片
- **AND** 显示 "NEXT_ROUND_INIT" 标签
- **AND** 显示倒计时 MM:SS
- **AND** 显示 "AWAITING SEQUENCE START"
- **AND** 显示进度条

## MODIFIED Requirements

### Requirement: 竞价阶段面板

系统 SHALL 在竞价阶段（区块 0-300）显示 Pre-Market Betting 面板。

#### Scenario: 竞价规则展示

- **GIVEN** 当前阶段为 betting
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

#### Scenario: 阶段切换到交易阶段

- **GIVEN** 竞价阶段结束
- **AND** 有 Agent 投注（hasBets = true）
- **WHEN** 进入区块 300
- **THEN** 面板切换为 TradingPhaseChart
- **AND** 显示交易图表

#### Scenario: 阶段切换到跳过状态

- **GIVEN** 竞价阶段结束
- **AND** 无 Agent 投注（hasBets = false）
- **WHEN** 进入区块 300
- **THEN** 面板切换为 RoundSkipped
- **AND** 显示轮次跳过提示

