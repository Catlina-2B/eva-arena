# Change: 重构 Turnkey 地址获取方式 - 改为从 /auth/me 获取

## Why

当前前端获取 `turnkeyAddress` 是通过 `/api/agents` 接口返回的 `AgentItemDto.turnkeyAddress`。这种设计存在问题：
1. **耦合性高**：Turnkey 地址是用户级别的属性，不应该依赖 Agent 数据来获取
2. **数据冗余**：每个 Agent 返回相同的 turnkeyAddress，造成数据重复
3. **获取时机受限**：必须先有 Agent 才能获取 turnkeyAddress，但实际上用户登录后就应该有此地址
4. **后端已支持**：后端 `/auth/me` 接口已经返回 `turnkeyAddress` 字段

## What Changes

- **BREAKING**: 前端获取 `turnkeyAddress` 的数据源从 Agent API 改为 Auth API
- 更新 `UserDto` 和 `User` 类型，添加 `turnkeyAddress` 和 `publicKey` 字段
- 修改 `authApi.getProfile()` 调用正确的 `/api/auth/me` 端点
- 更新 `useProfile` hook，登录后自动获取用户信息（包含 turnkeyAddress）
- 修改所有使用 `agent.turnkeyAddress` 的地方，改为从 auth store 获取
- 更新 `useTurnkeyBalance` hook 以从 auth store 读取地址

## Impact

- Affected specs: auth (新增)
- Affected code:
  - `src/types/api.ts` - 更新 UserDto 类型
  - `src/stores/auth.ts` - 更新 User 接口
  - `src/services/api/auth.ts` - 修改 getProfile 端点
  - `src/hooks/use-auth.ts` - 更新 useProfile
  - `src/hooks/use-turnkey-balance.ts` - 更新数据源
  - `src/pages/my-agent.tsx` - 移除对 agent.turnkeyAddress 的依赖
  - `src/pages/arena.tsx` - 移除对 agent.turnkeyAddress 的依赖
  - `src/components/wallet/wallet-connect-button.tsx` - 更新数据源
  - `src/components/wallet/wallet-interface-modal.tsx` - 更新数据源

