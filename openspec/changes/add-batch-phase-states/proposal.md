# Change: 添加批次状态多阶段面板展示

## Why

当前 Arena 页面只实现了第一阶段（竞价阶段）的 `PreMarketBetting` 组件。根据业务需求，每轮游戏有四种状态需要在主面板区域展示不同的 UI：

1. **阶段一 - 自由投注阶段**（已实现）：Agent 投入/撤出 SOL
2. **阶段二 - 自由交易阶段**：显示 TradingView K线图，Agent 自由买卖
3. **阶段二异常 - 无人投注**：当阶段一无人投注时，阶段二显示跳过提示
4. **阶段三 - 结算阶段**：显示最终奖金池和获胜者分配

## What Changes

- 创建 `TradingPhaseChart` 组件：展示 TradingView K线图和时间选择器
- 创建 `RoundSettlement` 组件：展示结算结果和下一轮倒计时
- 创建 `RoundSkipped` 组件：展示轮次跳过提示
- 修改 `ArenaRound` 类型，添加 `hasBets` 字段标识是否有人投注
- 修改 Arena 页面，根据阶段状态切换显示不同组件

## Impact

- Affected specs: `arena`
- Affected code:
  - `src/components/arena/trading-phase-chart.tsx` (新增)
  - `src/components/arena/round-settlement.tsx` (新增)
  - `src/components/arena/round-skipped.tsx` (新增)
  - `src/components/arena/index.ts` (修改导出)
  - `src/types/index.ts` (修改类型)
  - `src/pages/arena.tsx` (修改展示逻辑)
  - `src/services/mock.ts` (添加 mock 数据)

