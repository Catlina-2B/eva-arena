# Change: Add Pause Required Modal for Agent Editing

## Why

当用户尝试修改一个正在运行（ACTIVE）状态的 Agent 时，需要先暂停 Agent 才能进行编辑。这是为了防止在 Agent 活跃执行策略时修改配置导致的潜在问题。目前系统没有这个限制，需要添加一个提示弹窗引导用户先暂停 Agent。

## What Changes

- 新增 `PauseRequiredModal` 组件，用于提示用户需要先暂停 Agent
- 修改 my-agent 页面的编辑按钮逻辑：当 Agent 处于 ACTIVE 状态时，点击编辑按钮显示 PauseRequiredModal 而非直接打开 EditAgentModal
- 弹窗提供两个操作：取消（关闭弹窗）或暂停（暂停 Agent 后继续编辑流程）

## Impact

- Affected specs: `my-agent`
- Affected code:
  - `src/components/agent/pause-required-modal.tsx` (新增)
  - `src/pages/my-agent.tsx` (修改编辑逻辑)
  - `src/pages/arena.tsx` (可选：如果 arena 页面也有编辑功能)

