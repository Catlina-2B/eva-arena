## Context

EVA Arena 每轮游戏经历三个主要阶段，当前仅实现了竞价阶段的 UI。需要扩展支持交易阶段和结算阶段的展示，以及处理无人投注的异常情况。

### 阶段流转

```
阶段一 (Block 0-300)    阶段二 (Block 300-2700)    阶段三 (Block 2700-3000)
     竞价阶段       -->       交易阶段        -->       结算阶段
  PreMarketBetting        TradingPhaseChart         RoundSettlement
                    \
                     --> 无人投注时
                         RoundSkipped
```

## Goals / Non-Goals

### Goals

- 实现三个阶段的完整 UI 展示
- 使用 TradingView Lightweight Charts 展示交易图表
- 支持 1M/5M/15M 时间周期切换
- 展示结算获胜者和奖励分配
- 处理无人投注的边界情况

### Non-Goals

- 实时 WebSocket 数据推送（后续实现）
- 图表交互功能（缩放、标注等）
- 历史轮次回放

## Decisions

### 1. 图表库选择

**Decision**: 使用 TradingView Lightweight Charts

**Rationale**:
- 项目已在 `project.md` 中指定使用该库
- 轻量级，性能好
- 支持 React 集成
- 满足基本曲线图展示需求

### 2. 状态判断逻辑

**Decision**: 通过 `phase` + `hasBets` 组合判断展示哪个组件

```typescript
if (phase === "betting") {
  return <PreMarketBetting />
}
if (phase === "trading") {
  return hasBets ? <TradingPhaseChart /> : <RoundSkipped />
}
if (phase === "liquidation") {
  return <RoundSettlement />
}
```

### 3. 组件共享样式

**Decision**: 复用 `PreMarketBetting` 的边框装饰和网格背景

所有阶段组件保持一致的视觉风格：
- 绿色角落装饰
- 网格背景图案
- 边框样式

## Risks / Trade-offs

- **Risk**: TradingView 初始化可能有延迟
  - **Mitigation**: 添加加载状态指示器

- **Risk**: 实时数据未接入
  - **Mitigation**: 先使用 mock 数据，预留数据接口

## Open Questions

- 图表曲线是否需要渐变填充效果？（参考 Figma 设计有绿色渐变）
- 结算阶段是否需要动画效果？

