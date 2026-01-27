## ADDED Requirements

### Requirement: Trading Chart Cyber Animation
TradingPhaseChart 组件 SHALL 展示动态的 cyber 风格背景动效，包括网格滚动动画和扫描光束效果。

动画规格:
- 网格滚动动画 (`cyber-grid-scroll`): 背景网格持续向右下方移动，周期 3 秒
- 扫描光束 (`scan-beam`): 绿色半透明光束从上到下扫描，周期 5 秒
- 所有动效 SHALL 使用 `pointer-events: none` 确保不影响图表交互
- 动画 SHALL 使用 `will-change` 属性优化渲染性能

#### Scenario: 网格背景动画展示
- **WHEN** 用户进入 Trading Phase 页面
- **THEN** 图表背景网格持续滚动，产生流动效果
- **AND** 扫描光束从顶部移动到底部，循环播放

#### Scenario: 动画不影响交互
- **WHEN** 用户与图表进行交互（如悬停、缩放）
- **THEN** 动效元素不会阻挡用户的鼠标事件
- **AND** 图表的所有交互功能正常工作

