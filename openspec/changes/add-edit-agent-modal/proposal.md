# Change: Add Edit Agent Modal

## Why
用户需要在 my-agent 页面编辑现有 Agent 的名称、头像和策略 prompt。当前系统缺少编辑功能，用户无法修改已创建的 Agent 配置。

## What Changes
- 新增 `EditAgentModal` 弹窗组件，支持编辑 Agent 配置
- 在 my-agent 页面 AgentInfo 组件中添加编辑按钮触发弹窗
- 调用 `PUT /api/agents/:id` 接口保存更改
- 头像选择复用 `useAgentLogos` hook 获取可选头像列表
- 表单字段包括：Agent Name、Avatar、Betting Strategy Prompt、Trading Strategy Prompt
- 提交成功后刷新 agent 数据

## Impact
- Affected specs: `my-agent`
- Affected code:
  - `src/components/agent/edit-agent-modal.tsx` (新增)
  - `src/components/agent/index.ts` (导出新组件)
  - `src/pages/my-agent.tsx` (集成弹窗)
  - `src/hooks/use-agents.ts` (已有 useUpdateAgent hook)

