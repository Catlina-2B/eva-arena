## 1. Type Definitions
- [x] 1.1 在 `types/api.ts` 中添加 Strategy Wizard 相关类型定义

## 2. API Integration
- [x] 2.1 在 `services/api/agents.ts` 中添加 `getStrategyWizardConfig` API
- [x] 2.2 在 `services/api/agents.ts` 中添加 `generateStrategyPrompt` API

## 3. Hooks
- [x] 3.1 在 `hooks/use-agents.ts` 中添加 `useStrategyWizardConfig` hook
- [x] 3.2 在 `hooks/use-agents.ts` 中添加 `useGenerateStrategyPrompt` mutation hook

## 4. AI Prompt Drawer Component
- [x] 4.1 创建 `components/agent/ai-prompt-drawer.tsx` 抽屉组件
- [x] 4.2 实现聊天消息显示（AI 消息在左，用户选择在右）
- [x] 4.3 实现问题与选项渲染
- [x] 4.4 实现用户选择交互
- [x] 4.5 实现策略生成和预览显示
- [x] 4.6 实现 Retry 和 Confirm 按钮功能
- [x] 4.7 实现底部文本输入框（用于自定义选项）

## 5. Page Integration
- [x] 5.1 在 `create-agent.tsx` 中集成 `AIPromptDrawer`
- [x] 5.2 实现 AI-GENERATED 按钮点击打开抽屉
- [x] 5.3 实现生成的 Prompt 回填到对应输入框

