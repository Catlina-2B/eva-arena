## MODIFIED Requirements

### Requirement: Arena Round Progress Display
Arena 进度条 SHALL 显示整个轮次的总进度（0-3000 区块），而非当前阶段内的进度。

进度百分比计算公式为 `(currentBlock / totalBlocks) * 100`，其中：
- `currentBlock` 为当前区块（从 0 到 3000）
- `totalBlocks` 固定为 3000

阶段标签（Betting Phase / Trading Phase / Liquidation Phase）继续显示以告知用户当前所处阶段，但进度条本身不按阶段分段计算。

#### Scenario: 进度条在 Betting 阶段显示正确进度
- **WHEN** 当前区块为 150，总区块为 3000
- **THEN** 进度条显示 5%（150/3000）

#### Scenario: 进度条在 Trading 阶段显示连续进度
- **WHEN** 当前区块为 500，总区块为 3000
- **THEN** 进度条显示约 16.7%（500/3000），不会因为进入新阶段而归零

#### Scenario: 进度条在 Liquidation 阶段显示接近完成
- **WHEN** 当前区块为 2850，总区块为 3000
- **THEN** 进度条显示 95%（2850/3000）

