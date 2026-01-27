# Change: 添加 Turnkey 钱包地址和余额订阅功能

## Why
当前充值弹框中的 turnkeyAddress 来自 agent 数据，但实际应该从用户认证接口 `/auth/me` 返回。同时，用户的 Turnkey 钱包余额需要通过 Solana RPC WebSocket 实时订阅更新，确保所有显示余额的地方都使用统一的全局状态。

## What Changes
- **BREAKING**: `/auth/me` 接口返回新增 `turnkeyAddress` 字段
- 新增全局 Turnkey 钱包余额 store，使用 Zustand 管理
- 新增 Solana RPC WebSocket 订阅账户余额功能（使用 `connection.onAccountChange`）
- 充值弹框使用来自用户认证信息的 `turnkeyAddress`
- 所有显示 Turnkey 钱包余额的组件使用全局余额状态

## Impact
- Affected specs: 新增 `turnkey-wallet` capability
- Affected code:
  - `src/types/api.ts` - 更新 UserDto 类型添加 turnkeyAddress
  - `src/stores/auth.ts` - 更新 User 接口添加 turnkeyAddress
  - `src/stores/turnkey-balance.ts` - 新增余额 store
  - `src/services/solana/balance.ts` - 新增 Solana RPC 余额服务
  - `src/hooks/use-turnkey-balance.ts` - 新增余额订阅 hook
  - `src/components/agent/deposit-modal.tsx` - 更新充值地址来源
  - `src/components/wallet/wallet-interface-modal.tsx` - 使用全局余额
  - `src/pages/my-agent.tsx` - 使用全局余额
