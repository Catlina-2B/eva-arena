## ADDED Requirements

### Requirement: API Client Configuration

系统 SHALL 提供一个集中配置的 HTTP 客户端，支持：
- Base URL 配置（支持环境变量）
- 请求超时设置
- 自动 JSON 序列化/反序列化
- 统一的响应格式解包（`{ code, message, data }` -> `data`）

#### Scenario: 配置 API Base URL
- **WHEN** 应用启动时
- **THEN** API 客户端从环境变量 `VITE_API_BASE_URL` 读取 base URL
- **AND** 默认超时时间为 30 秒

#### Scenario: 响应自动解包
- **WHEN** API 返回 `{ code: 0, message: null, data: {...} }`
- **THEN** 客户端自动提取 `data` 字段返回给调用方

---

### Requirement: Authentication Token Management

系统 SHALL 自动管理 JWT Token 的注入和刷新：
- 每次请求自动携带 `Authorization: Bearer <token>`
- 当收到 401 响应时，尝试使用 refresh token 刷新
- 刷新成功后重试原请求
- 刷新失败时清除认证状态并跳转登录

#### Scenario: 请求自动携带 Token
- **WHEN** 用户已登录
- **AND** 发起需要认证的 API 请求
- **THEN** 请求头自动添加 `Authorization: Bearer {accessToken}`

#### Scenario: Token 自动刷新
- **WHEN** API 返回 401 Unauthorized
- **AND** 存在有效的 refresh token
- **THEN** 系统自动调用 `/api/auth/refresh` 获取新 token
- **AND** 使用新 token 重试原请求

#### Scenario: 刷新失败登出
- **WHEN** Token 刷新请求失败
- **THEN** 清除本地存储的 tokens
- **AND** 将用户导航到首页

---

### Requirement: Auth API Service

系统 SHALL 提供认证 API 服务，支持：
- 钱包签名登录
- Token 刷新
- 获取当前用户信息

#### Scenario: 钱包登录
- **WHEN** 用户完成钱包签名
- **THEN** 调用 `POST /api/auth/login` 提交 publicKey, message, signature
- **AND** 返回 accessToken, refreshToken, user 信息
- **AND** 将 tokens 保存到认证状态 Store

#### Scenario: 获取用户信息
- **WHEN** 调用 `getProfile()`
- **THEN** 发送 `GET /api/auth/profile` 请求
- **AND** 返回当前登录用户信息

---

### Requirement: Agent API Service

系统 SHALL 提供 Agent 管理 API 服务，支持完整的 CRUD 和业务操作。

#### Scenario: 获取我的 Agent 列表
- **WHEN** 调用 `getMyAgents()`
- **THEN** 发送 `GET /api/agents` 请求（需认证）
- **AND** 返回当前用户的所有 Agent 列表

#### Scenario: 创建 Agent
- **WHEN** 调用 `createAgent(data)`
- **THEN** 发送 `POST /api/agents` 请求
- **AND** 返回创建的 Agent 详情

#### Scenario: 获取 Agent 面板
- **WHEN** 调用 `getAgentPanel(id)`
- **THEN** 发送 `GET /api/agents/{id}/panel` 请求
- **AND** 返回 Agent 的余额、PnL、充值/提现统计

#### Scenario: Agent 充值
- **WHEN** 调用 `deposit(id, data)`
- **THEN** 发送 `POST /api/agents/{id}/deposit` 请求
- **AND** 返回更新后的 Agent Panel 信息

#### Scenario: Agent 提现
- **WHEN** 调用 `withdraw(id, data)`
- **THEN** 发送 `POST /api/agents/{id}/withdraw` 请求
- **AND** 返回提现结果（包含交易 hash）

#### Scenario: 切换 Agent 状态
- **WHEN** 调用 `toggleStatus(id)`
- **THEN** 发送 `PATCH /api/agents/{id}/toggle` 请求
- **AND** 返回状态切换后的 Agent Panel

#### Scenario: 获取 Agent Logo 选项
- **WHEN** 调用 `getAgentLogos()`
- **THEN** 发送 `GET /api/agents/logos` 请求
- **AND** 返回可用的 mecha 和 pilot 类型 logo URL 列表

---

### Requirement: Trench API Service

系统 SHALL 提供 Trench 竞技场 API 服务。

#### Scenario: 获取当前活跃 Trench
- **WHEN** 调用 `getCurrentTrench()`
- **THEN** 发送 `GET /api/trenches/current` 请求
- **AND** 返回当前 BIDDING 或 TRADING 状态的 Trench，或 null

#### Scenario: 获取 Trench 详情
- **WHEN** 调用 `getTrenchDetail(trenchId)`
- **THEN** 发送 `GET /api/trenches/{trenchId}` 请求
- **AND** 返回完整的 Trench 信息（含 Token 信息、储备量、统计）

#### Scenario: 获取价格曲线
- **WHEN** 调用 `getPriceCurve(trenchId, unit)`
- **THEN** 发送 `GET /api/trenches/{trenchId}/price-curve?unit={unit}` 请求
- **AND** 返回价格点列表（timestamp, price）

#### Scenario: 获取排行榜
- **WHEN** 调用 `getLeaderboard(trenchId)`
- **THEN** 发送 `GET /api/trenches/{trenchId}/leaderboard` 请求
- **AND** 返回前三名和当前用户排名

---

### Requirement: Strategy API Service

系统 SHALL 提供策略管理 API 服务。

#### Scenario: 获取公开策略列表
- **WHEN** 调用 `getPublicStrategies()`
- **THEN** 发送 `GET /api/strategies/public` 请求
- **AND** 返回公开且启用的策略列表

#### Scenario: 创建策略
- **WHEN** 调用 `createStrategy(data)`
- **THEN** 发送 `POST /api/strategies` 请求（需认证）
- **AND** 返回创建的策略详情

---

### Requirement: Price API Service

系统 SHALL 提供价格查询 API 服务。

#### Scenario: 获取 SOL 价格
- **WHEN** 调用 `getSolPrice()`
- **THEN** 发送 `GET /api/price/sol` 请求
- **AND** 返回当前 SOL/USD 价格

---

### Requirement: React Query Integration

系统 SHALL 使用 React Query 管理服务端状态，提供：
- 自动缓存
- 后台刷新
- Loading/Error 状态
- 乐观更新

#### Scenario: 缓存数据
- **WHEN** 相同的查询请求再次发起
- **THEN** 立即返回缓存数据
- **AND** 在后台重新获取最新数据（如果超过 staleTime）

#### Scenario: 查询失败重试
- **WHEN** API 请求失败
- **THEN** 自动重试最多 3 次
- **AND** 重试间隔指数递增

#### Scenario: 乐观更新 Agent 状态
- **WHEN** 用户点击切换 Agent 状态按钮
- **THEN** UI 立即反映新状态
- **AND** 发送 API 请求
- **IF** 请求失败 **THEN** 回滚到原状态

---

### Requirement: Auth State Store

系统 SHALL 使用 Zustand 管理认证状态，支持持久化。

#### Scenario: 登录状态持久化
- **WHEN** 用户成功登录
- **THEN** accessToken 和 refreshToken 保存到 localStorage
- **AND** 刷新页面后自动恢复登录状态

#### Scenario: 登出清理
- **WHEN** 用户登出或 Token 失效
- **THEN** 清除 localStorage 中的 tokens
- **AND** 清除内存中的用户信息

