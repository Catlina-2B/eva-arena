# Change: 创建 Agent 时从后端获取默认 Prompt 模板

## Why

当前创建 Agent 页面的 `Betting Strategy Prompt` 字段没有预填充内容，用户需要从零开始编写策略。后端已提供 `GET /agents/prompt-template` 接口返回系统默认的博弈策略模板。前端应调用此接口获取模板，作为默认值预填充到表单中，提升用户体验。

## What Changes

- **新增 API 调用**: 添加 `getPromptTemplate` 方法到 `agentApi` 服务
- **新增 React Query Hook**: 创建 `usePromptTemplate` hook 用于获取模板
- **新增类型定义**: 添加 `PromptTemplateResponseDto` 类型
- **更新创建页面**: 在 `create-agent.tsx` 中调用接口，将模板预填充到 `bettingStrategy` 字段

## Impact

- Affected specs: agent
- Affected code:
  - `src/services/api/agents.ts` - 添加 API 方法
  - `src/hooks/use-agents.ts` - 添加 hook
  - `src/types/api.ts` - 添加类型
  - `src/pages/create-agent.tsx` - 使用模板预填充表单

