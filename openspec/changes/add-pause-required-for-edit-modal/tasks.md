## 1. Implementation

- [x] 1.1 创建 `PauseRequiredModal` 组件 (`src/components/agent/pause-required-modal.tsx`)
  - 复用 `StartTimingModal` 的样式结构
  - 标题：NOTICE
  - 提示文字：Please pause the agent first
  - 两个按钮：CANCEL（取消）、PAUSE（暂停，绿色填充按钮）
  
- [x] 1.2 修改 `my-agent.tsx` 页面的编辑逻辑
  - 添加 `isPauseRequiredModalOpen` 状态
  - 修改 `onEdit` 回调：当 Agent 状态为 ACTIVE 时显示 PauseRequiredModal
  - 处理 PAUSE 按钮点击：暂停 Agent 后打开 EditAgentModal

- [x] 1.3 修改 `arena.tsx` 页面的编辑逻辑
  - 添加 `isPauseRequiredModalOpen` 状态
  - 修改 `onEditName` 回调：当 Agent 状态为 ACTIVE 时显示 PauseRequiredModal
  - 处理 PAUSE 按钮点击：暂停 Agent 后打开 EditAgentModal

- [x] 1.4 导出新组件
  - 在 `src/components/agent/index.ts` 中导出 `PauseRequiredModal`
