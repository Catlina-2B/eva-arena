# Change: 统一阶段进度条显示

## Why

当前 ArenaHeader 组件中的阶段进度展示存在问题：
1. 进度条是基于整轮的总区块数计算的，但阶段标签是分开显示的，视觉上没有统一
2. 阶段标签目前是居中对齐的，不符合整体布局的左对齐风格
3. 需要让进度条从当前阶段的起始区块开始计算，并动态显示当前阶段的文案

## What Changes

- 修改进度条计算逻辑：从当前阶段的起始区块开始计算进度百分比
- 将阶段标签改为左对齐，仅显示当前激活的阶段文案
- 动态切换阶段文案（Trading Phase / Liquidation Phase）

## Impact

- Affected specs: arena-ui
- Affected code: `src/components/arena/arena-header.tsx`

