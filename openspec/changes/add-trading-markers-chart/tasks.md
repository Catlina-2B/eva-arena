## 1. 数据获取

- [ ] 1.1 在 `TradingPhaseChart` 组件中集成 `useUserTransactions` hook，获取当前用户的交易记录
- [ ] 1.2 过滤出 trading phase 的交易（txType 为 BUY 或 SELL）

## 2. 持仓均价计算

- [ ] 2.1 在 `trench-utils.ts` 中添加 `calculateAverageEntryPrice` 函数
  - 输入：交易记录数组
  - 输出：持仓均价（考虑买入增加持仓、卖出减少持仓的加权平均）
- [ ] 2.2 添加单元测试验证计算逻辑

## 3. 图表标记实现

- [ ] 3.1 将交易记录转换为 lightweight-charts 的 marker 格式
  - BUY: position='belowBar', color='#00ff88', shape='arrowUp'
  - SELL: position='aboveBar', color='#ff4444', shape='arrowDown'
- [ ] 3.2 使用 `series.setMarkers()` API 将标记添加到图表
- [ ] 3.3 为标记添加 tooltip 显示交易详情（数量、价格、时间）

## 4. 持仓均价线实现

- [ ] 4.1 使用 `chart.addSeries(LineSeries)` 添加水平虚线表示持仓均价
- [ ] 4.2 设置样式：虚线、颜色与主题一致（例如橙色 #ffa500）
- [ ] 4.3 添加价格标签显示均价数值

## 5. UI 增强

- [ ] 5.1 在图表区域添加图例说明
  - 买入标记说明
  - 卖出标记说明
  - 持仓均价线说明
- [ ] 5.2 确保标记在 WebSocket 实时更新时正确刷新
- [ ] 5.3 处理无交易记录时的空状态

## 6. 测试验证

- [ ] 6.1 验证买卖点标记在正确的价格位置显示
- [ ] 6.2 验证持仓均价计算的正确性
- [ ] 6.3 验证实时交易时标记的动态更新
- [ ] 6.4 验证移动端响应式布局

