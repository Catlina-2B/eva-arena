# Wallet Capability

## ADDED Requirements

### Requirement: 钱包连接按钮

系统 SHALL 在导航栏提供钱包连接按钮，支持用户连接 Solana 钱包。

#### Scenario: 未连接状态

- **GIVEN** 用户未连接钱包
- **WHEN** 查看导航栏
- **THEN** 显示 "CONNECT WALLET" 按钮

#### Scenario: 已连接状态

- **GIVEN** 用户已连接钱包
- **WHEN** 查看导航栏
- **THEN** 显示钱包地址（缩写形式如 "8xBa...0F21"）
- **AND** 点击可打开钱包详情面板

### Requirement: 钱包连接流程

系统 SHALL 支持通过 Particle Auth 连接主流 Solana 钱包。

#### Scenario: 发起连接

- **GIVEN** 用户点击 CONNECT WALLET 按钮
- **WHEN** 操作执行
- **THEN** 打开 Particle Auth 连接界面
- **AND** 显示支持的钱包选项

#### Scenario: 连接成功

- **GIVEN** 用户在钱包中确认连接
- **WHEN** 连接完成
- **THEN** 导航栏显示已连接状态
- **AND** 更新全局钱包状态
- **AND** 显示成功提示

#### Scenario: 连接失败

- **GIVEN** 用户取消连接或发生错误
- **WHEN** 连接失败
- **THEN** 显示错误提示信息
- **AND** 保持未连接状态

### Requirement: 钱包详情面板

系统 SHALL 提供钱包详情面板，显示账户信息和操作入口。

#### Scenario: 面板展示

- **GIVEN** 用户已连接钱包
- **WHEN** 点击钱包地址
- **THEN** 打开钱包详情面板
- **AND** 显示 "WALLET_INTERFACE" 标题
- **AND** 显示 Total Balance（如 "14.02 SOL"）
- **AND** 显示完整钱包地址（带复制按钮）

#### Scenario: 操作按钮

- **GIVEN** 钱包详情面板打开
- **WHEN** 查看面板
- **THEN** 显示 WITHDRAW 按钮
- **AND** 显示 DEPOSIT 按钮
- **AND** 显示 DISCONNECT 按钮
- **AND** 显示 VIEW_TRANSACTIONS 链接

### Requirement: 断开钱包连接

系统 SHALL 支持用户断开钱包连接。

#### Scenario: 断开连接

- **GIVEN** 用户点击 DISCONNECT 按钮
- **WHEN** 操作执行
- **THEN** 断开钱包连接
- **AND** 清除本地钱包状态
- **AND** 导航栏恢复显示 CONNECT WALLET 按钮
- **AND** 如在需要登录的页面，跳转到首页

### Requirement: 充值模态框

系统 SHALL 提供充值模态框，支持用户向 Agent 账户充值 SOL。

#### Scenario: 打开充值模态框

- **GIVEN** 用户点击 DEPOSIT 按钮
- **WHEN** 操作执行
- **THEN** 打开充值模态框
- **AND** 显示当前钱包余额
- **AND** 显示充值金额输入框

#### Scenario: 执行充值

- **GIVEN** 用户输入充值金额
- **WHEN** 点击确认按钮
- **THEN** 发起链上交易
- **AND** 显示交易状态
- **AND** 成功后更新余额显示

### Requirement: 提款模态框

系统 SHALL 提供提款模态框，支持用户从 Agent 账户提取 SOL。

#### Scenario: 打开提款模态框

- **GIVEN** 用户点击 WITHDRAW 按钮
- **WHEN** 操作执行
- **THEN** 打开提款模态框
- **AND** 显示可提取余额
- **AND** 显示提款金额输入框

#### Scenario: 执行提款

- **GIVEN** 用户输入提款金额（不超过可用余额）
- **WHEN** 点击确认按钮
- **THEN** 发起链上交易
- **AND** 显示交易状态
- **AND** 成功后更新余额显示

