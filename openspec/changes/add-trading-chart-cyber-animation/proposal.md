# Change: 为 TradingPhaseChart 组件添加 Cyber 扫描动效

## Why
当前 TradingPhaseChart 组件的背景网格是静态的，缺乏动态视觉效果。添加类似 Aura 设计稿中的 cyber-grid 动画和扫描光束效果，可以增强科技感和视觉吸引力，与整体 EVA 赛博朋克风格更加一致。

## What Changes
- 添加网格背景滚动动画 (`cyber-grid-anim`)，使背景网格产生持续移动的效果
- 添加扫描光束效果 (`cyber-scan-line`)，从上到下扫描的绿色光束，增加科技感
- 动画使用 CSS `@keyframes` 实现，无需额外依赖
- 动效使用 `pointer-events: none` 确保不影响用户交互

## Impact
- Affected specs: `arena-ui` (新增)
- Affected code: 
  - `src/components/arena/trading-phase-chart.tsx` - 主要修改文件
  - `src/styles/globals.css` - 可能需要添加全局 CSS 动画（或使用内联样式）

