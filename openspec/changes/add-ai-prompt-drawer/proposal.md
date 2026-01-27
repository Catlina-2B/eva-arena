# Change: Add AI Prompt Generation Drawer

## Why
在 Create Agent 页面中，用户点击 "AI-GENERATED" 按钮时需要打开一个聊天式的 AI Prompt 生成器抽屉，通过引导式问答帮助用户生成策略 Prompt。后端 Strategy Wizard API 已经就绪，需要前端集成。

## What Changes
- 新增 `AIPromptDrawer` 抽屉组件，实现聊天式交互界面
- 集成后端 Strategy Wizard API (`/agents/strategy-wizard/config` 和 `/agents/strategy-wizard/generate`)
- 在 `create-agent.tsx` 页面的 "AI-GENERATED" 按钮点击时打开抽屉
- 支持 Betting 和 Trading 两种策略类型的生成
- 生成完成后显示预览，用户可确认或重试
- 确认后将生成的 Prompt 填充到对应的文本框

## Impact
- Affected specs: agent-creation
- Affected code:
  - `frontend-new/src/pages/create-agent.tsx` - 集成抽屉组件
  - `frontend-new/src/components/agent/ai-prompt-drawer.tsx` - 新建抽屉组件
  - `frontend-new/src/services/api/agents.ts` - 添加 Strategy Wizard API
  - `frontend-new/src/types/api.ts` - 添加 Strategy Wizard 类型定义
  - `frontend-new/src/hooks/use-agents.ts` - 添加 Wizard hooks

## Design Reference
- Figma: https://www.figma.com/design/vbZiWKh4KbiSk7TqoMKzGl/EVA?node-id=291-21866
- 聊天式界面，AI 消息在左侧，用户选择在右侧
- 问题包含选项按钮，用户点击选择
- 生成后显示参数摘要和策略预览
- 支持 Retry 和 Confirm 操作

