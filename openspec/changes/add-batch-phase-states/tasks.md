## 1. 类型定义更新

- [x] 1.1 修改 `ArenaRound` 类型，添加 `hasBets` 和 `winners` 字段
- [x] 1.2 添加 `Winner` 接口定义

## 2. 组件实现

- [x] 2.1 创建 `TradingPhaseChart` 组件 - 使用 TradingView Lightweight Charts 展示曲线图
- [x] 2.2 创建 `RoundSettlement` 组件 - 展示结算结果和获胜者列表
- [x] 2.3 创建 `RoundSkipped` 组件 - 展示轮次跳过提示和倒计时

## 3. 页面集成

- [x] 3.1 更新 `src/components/arena/index.ts` 导出新组件
- [x] 3.2 更新 `src/services/mock.ts` 添加测试数据
- [x] 3.3 修改 `arena.tsx` 页面根据阶段切换组件展示

