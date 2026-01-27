# Change: 优化首页认证和 Agent 导航流程

## Why

当前登录后会强制跳转到 `/create-agent` 页面，即使用户只是想查看首页。同时，没有 Agent 的用户被限制无法访问首页，体验不佳。首页应该根据用户状态展示不同的提示卡片，而不是强制跳转。

## What Changes

1. **移除登录后强制跳转**
   - 移除 `WalletConnectButton` 中的 `useAgentCheck` 自动跳转逻辑
   - 用户登录后保持在当前页面

2. **允许无 Agent 用户访问首页**
   - 首页不再要求用户必须有 Agent
   - 无 Agent 用户可以正常浏览首页内容

3. **首页根据状态展示不同卡片**
   - 未登录：展示 `WelcomeCard`（连接钱包提示）
   - 已登录无 Agent：展示 `CreateAgentCard`（创建 Agent 提示）
   - 已登录有 Agent：展示 `AgentDashboardCard`（Agent 状态面板）

4. **Agent 状态切换功能**
   - `AgentDashboardCard` 支持显示 Agent 状态（交易中/已暂停）
   - 集成 `toggleAgentStatus` API 实现状态切换
   - 根据 Agent 状态展示对应的操作按钮

## Impact

- Affected specs: `agent-navigation`
- Affected code:
  - `src/components/wallet/wallet-connect-button.tsx` - 移除 useAgentCheck
  - `src/hooks/use-agent-check.ts` - 可能需要调整或移除
  - `src/pages/arena.tsx` - 已实现的状态判断逻辑（保持）
  - `src/components/arena/agent-dashboard-card.tsx` - 集成 toggle API
  - `src/hooks/use-agents.ts` - 添加 toggle mutation hook

