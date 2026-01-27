# Tasks: 重构 Turnkey 地址获取方式

## 1. 类型更新
- [x] 1.1 更新 `src/types/api.ts` 中的 `UserDto`，添加 `publicKey` 和 `turnkeyAddress` 字段
- [x] 1.2 更新 `src/stores/auth.ts` 中的 `User` 接口，添加 `publicKey` 和 `turnkeyAddress` 字段

## 2. Auth API 修改
- [x] 2.1 修改 `src/services/api/auth.ts` 中的 `getProfile`，调用 `/api/auth/me` 端点
- [x] 2.2 确保 `useProfile` hook 在登录后正确获取用户信息

## 3. 余额订阅更新
- [x] 3.1 更新 `src/components/wallet/wallet-connect-button.tsx`，从 auth store 获取 turnkeyAddress
- [x] 3.2 更新 `src/components/wallet/wallet-interface-modal.tsx`，从 auth store 获取地址

## 4. 页面组件更新
- [x] 4.1 更新 `src/pages/my-agent.tsx`，移除对 `primaryAgent?.turnkeyAddress` 的依赖
- [x] 4.2 更新 `src/pages/arena.tsx`，移除对 agent.turnkeyAddress 的依赖

## 5. 类型兼容性修复
- [x] 5.1 更新 `src/hooks/use-trenches.ts`，将 `walletAddress` 改为 `publicKey`
- [x] 5.2 更新 `src/hooks/use-wallet-auth.ts`，将 `walletAddress` 改为 `publicKey`

## 6. 清理（可选）
- [ ] 6.1 评估是否需要从 `AgentItemDto` 和 `AgentPanelDto` 中移除 `turnkeyAddress` 字段
- [ ] 6.2 更新相关测试（如有）
