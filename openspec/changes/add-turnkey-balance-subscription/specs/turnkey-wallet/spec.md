## ADDED Requirements

### Requirement: Turnkey 地址来源
用户的 Turnkey 钱包地址 SHALL 从 `/auth/me` 接口的 `turnkeyAddress` 字段获取，而非从 agent 数据获取。

#### Scenario: 用户登录后获取 Turnkey 地址
- **WHEN** 用户成功登录并调用 `/auth/me` 接口
- **THEN** 响应中包含 `turnkeyAddress` 字段
- **AND** 该地址存储在 auth store 的 user 对象中

#### Scenario: 充值弹框显示 Turnkey 地址
- **WHEN** 用户打开充值弹框
- **THEN** 显示的充值地址为 auth store 中的 `turnkeyAddress`
- **AND** QR 码对应该地址

### Requirement: Turnkey 余额全局状态
系统 SHALL 使用 Zustand store 管理 Turnkey 钱包余额的全局状态。

#### Scenario: 初始状态
- **WHEN** 应用启动
- **THEN** 余额 store 的初始状态为 `balance: 0, isLoading: false, error: null`

#### Scenario: 余额更新
- **WHEN** 收到新的余额数据
- **THEN** store 的 `balance` 更新为新值（单位：SOL）
- **AND** `lastUpdated` 更新为当前时间戳

#### Scenario: 余额获取失败
- **WHEN** 余额订阅或获取失败
- **THEN** store 的 `error` 设置为错误信息
- **AND** `isLoading` 设置为 `false`

### Requirement: Solana RPC 余额订阅
系统 SHALL 通过 Solana RPC WebSocket 订阅 Turnkey 钱包的 SOL 余额变化。

#### Scenario: 初始余额获取
- **WHEN** 用户登录且存在 turnkeyAddress
- **THEN** 系统调用 `connection.getBalance()` 获取初始余额
- **AND** 余额（lamports）转换为 SOL 后存入 store

#### Scenario: 订阅余额变化
- **WHEN** 获取初始余额后
- **THEN** 系统调用 `connection.onAccountChange()` 订阅账户变化
- **AND** 订阅 ID 存储在 store 中

#### Scenario: 接收余额更新
- **WHEN** Solana 账户余额发生变化
- **THEN** `onAccountChange` 回调被触发
- **AND** 新的 lamports 余额转换为 SOL 后更新 store

#### Scenario: 用户登出
- **WHEN** 用户登出
- **THEN** 调用 `connection.removeAccountChangeListener()` 取消订阅
- **AND** 重置余额 store 状态

### Requirement: 余额显示一致性
所有显示 Turnkey 钱包余额的组件 SHALL 使用全局余额 store 的数据。

#### Scenario: WalletInterfaceModal 显示余额
- **WHEN** 用户打开钱包界面弹框
- **THEN** 显示的 Total Balance 来自 useTurnkeyBalance hook

#### Scenario: MyAgentPage 显示余额
- **WHEN** 用户访问 My Agent 页面
- **THEN** 资金卡片中的 Available Balance 来自 useTurnkeyBalance hook

#### Scenario: 余额实时更新
- **WHEN** Turnkey 钱包收到充值或发生提现
- **THEN** 所有显示余额的组件在几秒内同步更新显示
