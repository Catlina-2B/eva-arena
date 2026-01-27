## 1. 类型定义更新
- [ ] 1.1 更新 `src/types/api.ts` 中 UserDto 添加 `turnkeyAddress` 字段
- [ ] 1.2 更新 `src/stores/auth.ts` 中 User 接口添加 `turnkeyAddress` 字段

## 2. Turnkey 余额全局状态
- [ ] 2.1 创建 `src/stores/turnkey-balance.ts` 余额 store
- [ ] 2.2 Store 包含：balance、isLoading、error、lastUpdated、subscriptionId 状态
- [ ] 2.3 Store actions：setBalance、setLoading、setError、setSubscriptionId、reset

## 3. Solana RPC 余额服务
- [ ] 3.1 在 `src/services/solana/` 创建 `balance.ts` 余额服务
- [ ] 3.2 实现 `getBalance(address)` 获取初始余额
- [ ] 3.3 实现 `subscribeBalance(address, callback)` 订阅余额变化（使用 connection.onAccountChange）
- [ ] 3.4 更新 `src/services/solana/index.ts` 导出新服务

## 4. 余额订阅 Hook
- [ ] 4.1 创建 `src/hooks/use-turnkey-balance.ts` hook
- [ ] 4.2 Hook 功能：从 auth store 获取 turnkeyAddress
- [ ] 4.3 Hook 功能：初始化时获取余额、订阅余额变化
- [ ] 4.4 Hook 功能：返回 { balance, isLoading, error, turnkeyAddress }
- [ ] 4.5 更新 `src/hooks/index.ts` 导出新 hook

## 5. 组件更新
- [ ] 5.1 更新 `src/components/agent/deposit-modal.tsx` 从 auth store 获取 turnkeyAddress
- [ ] 5.2 更新 `src/components/wallet/wallet-interface-modal.tsx` 使用 useTurnkeyBalance hook
- [ ] 5.3 更新 `src/pages/my-agent.tsx` 使用 useTurnkeyBalance hook 获取余额

## 6. Provider 集成
- [ ] 6.1 创建 `src/components/turnkey-balance-provider.tsx` 或在 App 中初始化订阅
- [ ] 6.2 确保登录后自动开始订阅，登出后取消订阅
