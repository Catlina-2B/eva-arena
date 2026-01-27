# Change: 在首页曲线图上展示买卖点和持仓均价

## Why

当前 Arena 首页的交易曲线图只显示价格走势，用户无法直观看到自己 Agent 的交易点位和持仓均价。通过在图表上标记买卖点和持仓均价线，可以帮助用户更好地理解 Agent 的交易行为和策略效果。

## What Changes

- 从 Agent Dashboard 的 Execution logs 获取当前用户的 trading phase 交易（BUY/SELL）
- 在 TradingPhaseChart 组件中添加买卖点标记（markers）
  - 买入点（BUY）：绿色向上箭头标记
  - 卖出点（SELL）：红色向下箭头标记
- 计算并显示持仓均价线（average entry price）
  - 使用加权平均计算买入均价
  - 显示为水平虚线
- 添加图例说明买卖标记和均价线的含义

## Impact

- Affected specs: `arena-chart` (新增)
- Affected code:
  - `src/components/arena/trading-phase-chart.tsx` - 添加标记和均价线
  - `src/hooks/use-trenches.ts` - 可能需要添加新的 hook 获取用户交易
  - `src/lib/trench-utils.ts` - 添加计算持仓均价的工具函数

