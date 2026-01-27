## 1. Implementation

- [x] 1.1 添加 lamport 转换常量和工具函数（LAMPORTS_PER_SOL = 1_000_000_000）
- [x] 1.2 定义默认 CU 费用预留常量（DEFAULT_CU_RESERVE = 5000 lamport）
- [x] 1.3 更新 `AgentWithdrawDto` 类型注释，说明 amount 单位为 lamport
- [x] 1.4 修改 `WithdrawModal` 的 `maxBalance` prop 含义和最大金额计算逻辑
- [x] 1.5 修改 `WithdrawModal` 的 `onWithdraw` 回调，将 SOL 转换为 lamport
- [x] 1.6 更新 `my-agent.tsx` 中 WithdrawModal 的 maxBalance 传入值
- [x] 1.7 更新 `wallet-interface-modal.tsx` 中 WithdrawModal 的 maxBalance 传入值

