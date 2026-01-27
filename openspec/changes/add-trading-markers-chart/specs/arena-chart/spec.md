## ADDED Requirements

### Requirement: Trading Phase Chart Markers

系统 SHALL 在 Trading Phase 曲线图上显示当前用户 Agent 的买卖点标记。

#### Scenario: 显示买入标记

- **WHEN** 用户的 Agent 在 trading phase 执行了 BUY 交易
- **THEN** 图表上该时间点位置显示绿色向上箭头标记
- **AND** 标记 tooltip 显示交易详情（Token 数量、SOL 价格、交易时间）

#### Scenario: 显示卖出标记

- **WHEN** 用户的 Agent 在 trading phase 执行了 SELL 交易
- **THEN** 图表上该时间点位置显示红色向下箭头标记
- **AND** 标记 tooltip 显示交易详情（Token 数量、SOL 价格、交易时间）

#### Scenario: 实时更新标记

- **WHEN** 用户的 Agent 执行新的交易
- **THEN** 图表标记在 1 秒内更新反映新交易

#### Scenario: 无交易记录

- **WHEN** 用户在当前 trench 没有 trading phase 交易
- **THEN** 图表正常显示价格曲线，无买卖标记

### Requirement: Average Entry Price Display

系统 SHALL 在曲线图上显示当前持仓的平均入场价格。

#### Scenario: 显示持仓均价线

- **WHEN** 用户持有 Token（tokenBalance > 0）
- **THEN** 图表上显示一条水平虚线表示持仓均价
- **AND** 虚线旁边显示价格数值标签

#### Scenario: 计算持仓均价

- **GIVEN** 用户有以下交易：
  - BUY 1000 tokens @ 0.001 SOL
  - BUY 2000 tokens @ 0.002 SOL
  - SELL 500 tokens @ 0.003 SOL
- **WHEN** 计算持仓均价
- **THEN** 均价 = (1000 * 0.001 + 2000 * 0.002) / (1000 + 2000) = 0.00167 SOL
- **AND** 当前持仓 = 2500 tokens

#### Scenario: 全部卖出后无均价线

- **WHEN** 用户已卖出全部持仓（tokenBalance = 0）
- **THEN** 图表不显示持仓均价线

### Requirement: Chart Legend

系统 SHALL 提供图例说明图表上各元素的含义。

#### Scenario: 显示图例

- **WHEN** 用户查看 Trading Phase 曲线图
- **THEN** 图表区域显示图例，包含：
  - 买入标记说明（绿色箭头 = BUY）
  - 卖出标记说明（红色箭头 = SELL）
  - 持仓均价线说明（虚线 = Avg Entry）

#### Scenario: 图例响应式

- **WHEN** 在移动端查看图表
- **THEN** 图例以紧凑形式显示，不遮挡图表内容

