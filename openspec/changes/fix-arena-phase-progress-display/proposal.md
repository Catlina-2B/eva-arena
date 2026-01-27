# Change: 修复 Arena 进度条显示逻辑

## Why
当前 ArenaHeader 组件中的进度条是按阶段分别计算进度的，导致在 betting 阶段（0-300 区块）进度条正常显示，但进入 trading 阶段（300-2700 区块）后进度条归零重新开始。用户期望进度条应该反映整个轮次的总进度（0-3000 区块），不区分阶段。

## What Changes
- 修改 ArenaHeader 组件中进度条的计算逻辑，从基于当前阶段的进度改为基于整个轮次的总进度
- 进度条应显示 `currentBlock / totalBlocks` 的比例，而不是当前阶段内的进度
- 保留阶段标签显示（Betting Phase / Trading Phase / Liquidation Phase）用于告知用户当前处于哪个阶段

## Impact
- Affected specs: arena
- Affected code: `src/components/arena/arena-header.tsx`

