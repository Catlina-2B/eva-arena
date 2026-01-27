## ADDED Requirements

### Requirement: Withdraw Amount Unit

Withdraw 功能调用服务端 API 时，`amount` 参数 MUST 使用 lamport 作为单位（1 SOL = 1,000,000,000 lamport）。

#### Scenario: 用户提取 1 SOL

- **WHEN** 用户在 WithdrawModal 输入 1 SOL 并提交
- **THEN** 前端调用 `/api/agents/{id}/withdraw` 时 body 中的 `amount` 值为 1000000000

#### Scenario: 用户提取 0.5 SOL

- **WHEN** 用户在 WithdrawModal 输入 0.5 SOL 并提交
- **THEN** 前端调用 API 时 `amount` 值为 500000000

### Requirement: Maximum Withdrawable Amount

可提取的最大金额 MUST 为账户余额减去默认 5000 lamport 的 CU 费用预留。

#### Scenario: 余额为 1 SOL 时的最大可提取金额

- **WHEN** 用户账户余额为 1 SOL（1,000,000,000 lamport）
- **THEN** 最大可提取金额为 999,995,000 lamport（约 0.999995 SOL）

#### Scenario: 余额不足以支付 CU 费用

- **WHEN** 用户账户余额小于或等于 5000 lamport
- **THEN** 最大可提取金额为 0，用户无法进行提取操作

### Requirement: UI Amount Display

用户界面 MUST 始终以 SOL 为单位显示金额，前端在提交时内部转换为 lamport。

#### Scenario: 输入框显示单位

- **WHEN** 用户查看 WithdrawModal
- **THEN** 金额输入框应显示 SOL 单位标识

#### Scenario: MAX 按钮计算

- **WHEN** 用户点击 MAX 按钮
- **THEN** 输入框填入的金额为 (余额 - 5000 lamport) 转换为 SOL 后的值

