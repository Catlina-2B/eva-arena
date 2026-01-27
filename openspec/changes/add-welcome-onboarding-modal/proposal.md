# Change: Add Welcome Onboarding Modal

## Why

首次进入 EVA 竞技场的用户需要了解游戏机制和规则。一个清晰的引导弹窗可以帮助新用户快速理解游戏的三个阶段（竞价、交易、清算）以及核心规则，提升用户体验和留存率。

## What Changes

- 新增 `WelcomeOnboardingModal` 组件，展示游戏机制介绍
- 使用 `localStorage` 存储用户是否已查看过弹窗
- 首次进入 Arena 页面时自动显示弹窗
- 弹窗内容包含：
  - 标题 "WELCOME TO EVA"
  - 游戏简介
  - 三个阶段的详细说明（Betting Phase、Trading Phase、Liquidation Phase）
  - "START GAME" 按钮关闭弹窗

## Impact

- Affected specs: arena-ui
- Affected code:
  - `src/components/arena/welcome-onboarding-modal.tsx` (新增)
  - `src/pages/arena.tsx` (引入弹窗)
  - `src/hooks/use-first-visit.ts` (新增，管理首次访问状态)

