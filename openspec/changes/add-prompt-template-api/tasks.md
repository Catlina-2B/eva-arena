## 1. 添加类型定义

- [x] 1.1 在 `types/api.ts` 中添加 `PromptTemplateResponseDto` 类型

## 2. 添加 API 调用

- [x] 2.1 在 `services/api/agents.ts` 中添加 `getPromptTemplate` 方法
- [x] 2.2 在 `hooks/use-agents.ts` 中添加 `usePromptTemplate` hook
- [x] 2.3 在 `hooks/index.ts` 中导出新 hook

## 3. 更新创建 Agent 页面

- [x] 3.1 在 `create-agent.tsx` 中调用 `usePromptTemplate` 获取模板
- [x] 3.2 当模板加载完成后，预填充到 `bettingStrategy` 字段
- [x] 3.3 添加加载状态处理

