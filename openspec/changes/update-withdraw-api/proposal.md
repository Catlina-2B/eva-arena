# Change: 更新 Withdraw 功能的 API 调用和金额计算

## Why

当前 Withdraw 功能的金额单位为 SOL，需要改为 lamport（Solana 最小单位）以匹配服务端 API 的要求。同时，最大可提取金额需要预留一定的 SOL 用于支付交易费用（Compute Units），确保交易能够成功执行。

## What Changes

- **BREAKING**: `AgentWithdrawDto` 的 `amount` 字段单位从 SOL 改为 lamport（1 SOL = 1,000,000,000 lamport）
- 修改 `WithdrawModal` 中的最大金额计算逻辑：`maxWithdrawable = balance - 5000 CU 对应的 SOL`
- 前端在调用 API 时将用户输入的 SOL 金额转换为 lamport
- 更新 UI 显示逻辑，确保用户始终看到 SOL 单位的金额

## Impact

- Affected specs: agent-withdraw（新增）
- Affected code:
  - `src/types/api.ts` - AgentWithdrawDto 类型注释更新
  - `src/components/agent/withdraw-modal.tsx` - 最大金额计算和 amount 转换
  - `src/pages/my-agent.tsx` - WithdrawModal 的 maxBalance 传入值调整
  - `src/components/wallet/wallet-interface-modal.tsx` - WithdrawModal 的 maxBalance 传入值调整

