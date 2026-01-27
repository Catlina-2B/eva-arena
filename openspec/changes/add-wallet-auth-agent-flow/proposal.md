# Change: 实现钱包签名登录与 Agent 检查流程

## Why
用户连接钱包后需要进行签名登录，登录后自动检查是否有 Agent，如果没有则跳转到创建 Agent 页面。创建 Agent 时需要使用后端提供的 Logo 列表而非本地占位符。

## What Changes
- 钱包连接后自动触发签名登录流程
- 使用 Particle 钱包签名生成登录凭证
- 调用后端 `/api/auth/login` 完成身份验证
- 登录成功后自动检查用户是否有 Agent
- 无 Agent 时自动跳转到 `/create-agent` 页面
- Create Agent 页面使用后端 `/api/agents/logos` 返回的 Logo 列表
- 完善 Create Agent 表单提交逻辑，调用后端创建 API

## Impact
- Affected specs: auth, agent
- Affected code:
  - `src/components/wallet/wallet-connect-button.tsx` - 添加登录流程
  - `src/hooks/use-wallet-auth.ts` - 新增钱包签名登录 Hook
  - `src/pages/create-agent.tsx` - 使用后端 Logo 列表，完善创建逻辑
  - `src/hooks/use-agents.ts` - 添加 Logo 查询 Hook（已存在）
  - `src/services/api/agents.ts` - Logo API（已存在）

## Dependencies
- 后端 Auth API: `POST /api/auth/login`
- 后端 Agent API: `GET /api/agents/logos`, `GET /api/agents`, `POST /api/agents`

