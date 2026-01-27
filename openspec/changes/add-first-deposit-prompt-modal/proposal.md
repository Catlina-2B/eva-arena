# Change: Add First Deposit Prompt Modal

## Why

当用户首次注册登录并创建 Agent 后，需要提示他们进行首次充值 (Deposit) 以便 Agent 能够参与竞技场博弈。如果用户没有资金，Agent 无法进行任何交易活动，因此引导用户进行充值是重要的 onboarding 流程。

## What Changes

- 新增 `FirstDepositPromptModal` 组件，在用户首次创建 Agent 后弹出，提示用户进行充值
- Modal 设计遵循 Figma 设计稿 (node-id: 56-8490)
- Modal 包含 "DEPOSIT" 主按钮和 "SKIP FOR LATER" 跳过选项
- 使用 localStorage 记录用户是否已看过该提示，避免重复显示
- Modal UI 风格参考现有的 `start-timing-modal.tsx` 组件

## Impact

- Affected specs: onboarding, agent-navigation
- Affected code:
  - `src/components/agent/first-deposit-prompt-modal.tsx` (新建)
  - `src/hooks/use-first-deposit-prompt.ts` (新建)
  - `src/pages/create-agent.tsx` (触发显示 modal)
  - `src/pages/my-agent.tsx` (可能作为显示位置)
  - `src/components/agent/index.ts` (导出新组件)

