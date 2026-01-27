## MODIFIED Requirements

### Requirement: Phase Progress Display

竞技场头部 SHALL 显示当前阶段的进度信息：
- 进度条 SHALL 基于当前阶段的起始区块到结束区块计算百分比
- 阶段文案 SHALL 动态显示当前激活阶段的名称
- 阶段文案 SHALL 左对齐显示
- 区块计数器 SHALL 显示当前区块号与当前阶段结束区块号的比例

#### Scenario: Trading Phase 进度显示
- **WHEN** 当前阶段为 trading（区块 300-2700）
- **AND** 当前区块为 1500
- **THEN** 进度条显示 50%（(1500-300)/(2700-300) = 50%）
- **AND** 阶段文案显示 "TRADING PHASE"
- **AND** 文案左对齐

#### Scenario: Liquidation Phase 进度显示
- **WHEN** 当前阶段为 liquidation（区块 2700-3000）
- **AND** 当前区块为 2850
- **THEN** 进度条显示 50%（(2850-2700)/(3000-2700) = 50%）
- **AND** 阶段文案显示 "LIQUIDATION PHASE"
- **AND** 文案左对齐

