## 1. 代码清理

- [x] 1.1 移除 `USE_REAL_DATA` feature flag
- [x] 1.2 移除 mock 数据导入（mockAgent, mockAgentHistory, mockTrades）
- [x] 1.3 移除所有基于 `USE_REAL_DATA` 的条件判断

## 2. Agent 信息展示

- [x] 2.1 使用 `useMyAgents` 获取用户的 Agent
- [x] 2.2 显示 Agent 基本信息（名称、Logo、状态、创建时间）
- [x] 2.3 实现 Agent 状态切换按钮（调用 toggle API）
- [x] 2.4 添加编辑 Agent 入口

## 3. Agent Panel 数据展示

- [x] 3.1 使用 `useAgentPanel` 获取面板数据
- [x] 3.2 显示 Available Balance（当前余额）
- [x] 3.3 显示 Total Deposit / Total Withdraw
- [x] 3.4 显示 PnL 及图表
- [x] 3.5 实现 DEPOSIT 弹框流程
- [x] 3.6 实现 WITHDRAW 弹框流程

## 4. 历史记录展示

- [x] 4.1 使用 `useAgentTrenches` 获取 Trench 历史
- [x] 4.2 展示每轮的 Token 名称、交易次数、PnL、奖励
- [ ] 4.3 实现历史记录分页

## 5. 交易记录展示

- [x] 5.1 展开历史记录时加载该 Trench 的交易详情
- [x] 5.2 使用 `useAgentTransactions` 获取交易
- [x] 5.3 显示交易时间、类型、Token 金额、SOL 金额、TX 链接
- [x] 5.4 显示 Reasoning（AI 推理过程，hover 可见）
- [x] 5.5 实现交易记录分页

## 6. 加载状态与错误处理

- [x] 6.1 添加 Agent 加载状态
- [x] 6.2 添加 Panel 数据加载状态
- [x] 6.3 添加历史记录加载状态
- [x] 6.4 添加交易记录加载状态
- [x] 6.5 处理 API 错误情况

## 7. Deposit/Withdraw 弹框流程

### 7.1 Deposit 弹框
- [x] 7.1.1 创建 DepositModal 组件
- [x] 7.1.2 显示 Token 选择（SOL）和链选择（Solana）
- [x] 7.1.3 显示 Agent turnkeyAddress 的二维码
- [x] 7.1.4 显示充值地址和复制按钮
- [x] 7.1.5 显示处理时间等信息

### 7.2 Withdraw 弹框
- [x] 7.2.1 创建 WithdrawModal 组件
- [x] 7.2.2 显示可提现金额（MAX）
- [x] 7.2.3 输入提现金额和接收地址
- [x] 7.2.4 显示网络和手续费信息
- [x] 7.2.5 调用后端 Withdraw API
- [x] 7.2.6 显示交易状态和结果

### 7.3 集成
- [x] 7.3.1 在 My Agent 页面集成弹框
- [x] 7.3.2 DEPOSIT 按钮打开 Deposit 弹框
- [x] 7.3.3 WITHDRAW 按钮打开 Withdraw 弹框
- [x] 7.3.4 操作成功后刷新 Panel 数据

## 8. Wallet Interface 弹框

### 8.1 WalletInterfaceModal 组件
- [x] 8.1.1 创建 WalletInterfaceModal 组件
- [x] 8.1.2 显示 Total Balance（SOL）
- [x] 8.1.3 显示缩短的钱包地址和复制按钮
- [x] 8.1.4 显示 DISCONNECT 按钮
- [x] 8.1.5 显示 WITHDRAW / DEPOSIT 按钮
- [x] 8.1.6 显示 VIEW_TRANSACTIONS 链接

### 8.2 集成
- [x] 8.2.1 修改 WalletConnectButton 点击行为
- [x] 8.2.2 点击钱包地址打开 WalletInterfaceModal（而非退出登录）
- [x] 8.2.3 从弹框可打开 Deposit/Withdraw 子弹框
