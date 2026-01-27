## 1. Implementation

- [x] 1.1 修改 ArenaHeader 组件中的进度条计算逻辑，使用整体进度 `currentBlock / totalBlocks` 替代阶段内进度
- [x] 1.2 移除基于 `phaseStart`/`phaseEnd` 的进度计算
- [x] 1.3 验证进度条在各阶段切换时连续显示，不会归零重新开始
