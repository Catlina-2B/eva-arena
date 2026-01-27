## 1. 移除登录后强制跳转

- [x] 1.1 移除 `WalletConnectButton` 中的 `useAgentCheck` 调用
- [x] 1.2 验证登录后不再自动跳转到 `/create-agent`

## 2. Agent 状态切换集成

- [x] 2.1 在 `use-agents.ts` 中添加 `useToggleAgentStatus` mutation hook（已存在）
- [x] 2.2 更新 `AgentDashboardCard` 组件支持 `isToggling` 加载状态
- [x] 2.3 在 arena 页面传递 toggle handler 到 `AgentDashboardCard`

## 3. 验证首页状态展示

- [x] 3.1 验证未登录用户看到 `WelcomeCard`
- [x] 3.2 验证已登录无 Agent 用户看到 `CreateAgentCard`
- [x] 3.3 验证已登录有 Agent 用户看到 `AgentDashboardCard` 及正确状态
- [x] 3.4 验证 Agent 状态切换功能正常工作
