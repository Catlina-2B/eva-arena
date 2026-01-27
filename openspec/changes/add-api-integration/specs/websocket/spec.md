## ADDED Requirements

### Requirement: WebSocket Client Configuration

系统 SHALL 提供一个 Socket.IO 客户端，用于连接后端 WebSocket 服务。

#### Scenario: 连接 WebSocket 服务
- **WHEN** 需要接收实时数据
- **THEN** 使用 Socket.IO 连接到 `{API_BASE_URL}/trench` 命名空间
- **AND** 支持 WebSocket 和 Polling 两种传输方式
- **AND** 支持自动重连（最多 5 次，延迟递增）

#### Scenario: 连接状态变化
- **WHEN** 连接状态发生变化（连接/断开/错误）
- **THEN** 触发相应的状态回调
- **AND** UI 可以根据状态显示连接指示器

---

### Requirement: Trench Subscription

系统 SHALL 支持订阅特定 Trench 的实时更新。

#### Scenario: 订阅 Trench
- **WHEN** 调用 `subscribeTrench(trenchId)`
- **THEN** 向服务器发送 `subscribeTrench` 事件
- **AND** 携带 `{ trenchId: number }`
- **AND** 服务器返回订阅确认

#### Scenario: 取消订阅 Trench
- **WHEN** 调用 `unsubscribeTrench(trenchId)` 或组件卸载
- **THEN** 向服务器发送 `unsubscribeTrench` 事件
- **AND** 停止接收该 Trench 的更新

---

### Requirement: Trench Update Event

系统 SHALL 处理 `trenchUpdate` 事件，更新 Trench 状态。

#### Scenario: 接收 Trench 状态更新
- **WHEN** 服务器推送 `trenchUpdate` 事件
- **THEN** 解析消息格式 `{ event, data, timestamp }`
- **AND** 数据包含：id, trenchId, status, totalDepositedSol, participantCount, activeAgentsCount 等
- **AND** 通知 UI 更新相关显示

#### Scenario: Trench 阶段变化
- **WHEN** `trenchUpdate` 事件中 status 字段变化（BIDDING -> TRADING -> ENDED）
- **THEN** 触发阶段变化回调
- **AND** UI 切换到对应阶段的显示

---

### Requirement: Price Update Event

系统 SHALL 处理 `priceUpdate` 事件，实时更新价格数据。

#### Scenario: 接收价格更新
- **WHEN** 服务器推送 `priceUpdate` 事件
- **THEN** 解析数据：trenchId, timestamp, priceSol, priceUsd, txType, solAmount, tokenAmount
- **AND** 更新 K 线图数据
- **AND** 更新当前价格显示

#### Scenario: 添加价格点到图表
- **WHEN** 接收到新的价格更新
- **THEN** 将 `{ timestamp, price }` 添加到图表数据
- **AND** 图表平滑更新显示

---

### Requirement: Transaction Event

系统 SHALL 处理 `transaction` 事件，显示实时交易活动。

#### Scenario: 接收新交易通知
- **WHEN** 服务器推送 `transaction` 事件
- **THEN** 解析数据：txType (DEPOSIT/WITHDRAW/BUY/SELL/CLAIM), userAddress, solAmount, tokenAmount, signature
- **AND** 在活动 Feed 中添加新条目
- **AND** 新条目出现动画效果

#### Scenario: 交易类型显示
- **WHEN** 显示交易活动
- **THEN** DEPOSIT 显示为绿色 "+"
- **AND** WITHDRAW 显示为红色 "-"
- **AND** BUY 显示为买入图标
- **AND** SELL 显示为卖出图标

---

### Requirement: Leaderboard Update Event

系统 SHALL 处理 `leaderboardUpdate` 事件，实时更新排行榜。

#### Scenario: 接收排行榜更新
- **WHEN** 服务器推送 `leaderboardUpdate` 事件
- **THEN** 解析数据：topThree (前三名), totalParticipants
- **AND** 更新排行榜 UI 显示
- **AND** 如果当前用户排名变化，高亮显示

#### Scenario: 排名变化动画
- **WHEN** 排行榜数据更新
- **AND** 排名发生变化
- **THEN** 显示排名变化动画（上升/下降指示器）

---

### Requirement: Trench Socket Hook

系统 SHALL 提供 `useTrenchSocket` Hook 封装 WebSocket 逻辑。

#### Scenario: Hook 自动管理连接生命周期
- **WHEN** 组件挂载并传入 `trenchId`
- **THEN** 自动连接 WebSocket 并订阅该 Trench
- **WHEN** 组件卸载或 `trenchId` 变化
- **THEN** 自动取消订阅并清理

#### Scenario: Hook 返回实时数据状态
- **WHEN** 使用 `useTrenchSocket(trenchId)`
- **THEN** 返回 `{ isConnected, latestPrice, latestTransaction, leaderboard, error }`
- **AND** 状态变化时触发组件重渲染

#### Scenario: Hook 支持事件回调
- **WHEN** 使用 `useTrenchSocket` 的事件回调选项
- **THEN** 可以注册 `onPriceUpdate`, `onTransaction`, `onLeaderboardUpdate` 回调
- **AND** 收到对应事件时执行回调

---

### Requirement: Connection Status Indicator

系统 SHALL 在 UI 中显示 WebSocket 连接状态。

#### Scenario: 显示已连接状态
- **WHEN** WebSocket 连接成功
- **THEN** 显示绿色连接指示器
- **AND** 工具提示显示 "实时数据已连接"

#### Scenario: 显示断开状态
- **WHEN** WebSocket 断开连接
- **THEN** 显示红色断开指示器
- **AND** 工具提示显示 "正在重连..." 或 "连接已断开"

#### Scenario: 自动重连
- **WHEN** WebSocket 意外断开
- **THEN** 自动尝试重连
- **AND** UI 显示重连状态
- **AND** 重连成功后恢复正常状态

---

### Requirement: WebSocket Error Handling

系统 SHALL 处理 WebSocket 错误事件。

#### Scenario: 接收服务端错误
- **WHEN** 服务器推送 `error` 事件
- **THEN** 解析错误数据 `{ code, message }`
- **AND** 显示错误通知
- **AND** 根据错误类型决定是否重试

#### Scenario: 连接超时处理
- **WHEN** WebSocket 连接超时
- **THEN** 显示超时错误提示
- **AND** 提供手动重连按钮

