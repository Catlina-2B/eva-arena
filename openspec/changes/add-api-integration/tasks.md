## 1. 基础设施搭建

- [x] 1.1 安装依赖包 (axios, @tanstack/react-query, socket.io-client, zustand)
- [x] 1.2 配置 React Query Provider
- [x] 1.3 创建 Axios 客户端实例 (`src/services/api/client.ts`)
- [x] 1.4 实现请求/响应拦截器（错误处理、Token 注入）
- [x] 1.5 创建认证状态 Store (`src/stores/auth.ts`)

## 2. 类型定义

- [x] 2.1 定义 API 通用响应类型 (`ApiResponse<T>`)
- [x] 2.2 定义认证相关类型 (`LoginDto`, `LoginResponse`, `User`)
- [x] 2.3 定义 Agent 相关类型 (`Agent`, `AgentPanel`, `CreateAgentDto`, `UpdateAgentDto`)
- [x] 2.4 定义 Trench 相关类型 (`Trench`, `TrenchDetail`, `Leaderboard`, `Transaction`)
- [x] 2.5 定义 Strategy 相关类型 (`Strategy`, `CreateStrategyDto`)
- [x] 2.6 定义 WebSocket 事件类型 (`WsMessage`, `PriceUpdateEvent`, `TransactionEvent`, etc.)

## 3. REST API 服务层

- [x] 3.1 实现认证 API (`src/services/api/auth.ts`)
  - `login()`
  - `refresh()`
  - `getProfile()`
- [x] 3.2 实现 Agent API (`src/services/api/agents.ts`)
  - `getMyAgents()`
  - `getAgentById()`
  - `createAgent()`
  - `updateAgent()`
  - `deleteAgent()`
  - `getAgentPanel()`
  - `toggleStatus()`
  - `deposit()`
  - `withdraw()`
  - `getAgentTrenches()`
  - `getAgentTransactions()`
  - `getAgentLogos()`
- [x] 3.3 实现 Trench API (`src/services/api/trenches.ts`)
  - `getTrenchList()`
  - `getCurrentTrench()`
  - `getTrenchDetail()`
  - `getPriceCurve()`
  - `getTransactions()`
  - `getSummary()`
  - `getLeaderboard()`
- [x] 3.4 实现 Strategy API (`src/services/api/strategies.ts`)
  - `getStrategies()`
  - `getPublicStrategies()`
  - `getStrategyById()`
  - `createStrategy()`
  - `updateStrategy()`
  - `deleteStrategy()`
- [x] 3.5 实现 Price API (`src/services/api/price.ts`)
  - `getSolPrice()`
- [ ] 3.6 实现 IPFS API (`src/services/api/ipfs.ts`)
  - `uploadFile()`
  - `uploadMetadata()`

## 4. React Query Hooks

- [x] 4.1 创建认证 Hooks (`src/hooks/use-auth.ts`)
  - `useLogin()`
  - `useLogout()`
  - `useProfile()`
- [x] 4.2 创建 Agent Hooks (`src/hooks/use-agents.ts`)
  - `useMyAgents()`
  - `useAgent(id)`
  - `useAgentPanel(id)`
  - `useCreateAgent()`
  - `useUpdateAgent()`
  - `useDeleteAgent()`
  - `useToggleAgentStatus()`
  - `useAgentDeposit()`
  - `useAgentWithdraw()`
  - `useAgentTrenches(id)`
  - `useAgentTransactions(id)`
  - `useAgentLogos()`
- [x] 4.3 创建 Trench Hooks (`src/hooks/use-trenches.ts`)
  - `useTrenchList()`
  - `useCurrentTrench()`
  - `useTrenchDetail(id)`
  - `usePriceCurve(id)`
  - `useTrenchTransactions(id)`
  - `useLeaderboard(id)`
- [x] 4.4 创建 Strategy Hooks (`src/hooks/use-strategies.ts`)
  - `useStrategies()`
  - `usePublicStrategies()`
  - `useStrategy(id)`
  - `useCreateStrategy()`
- [x] 4.5 创建 Price Hooks (`src/hooks/use-price.ts`)
  - `useSolPrice()`

## 5. WebSocket 服务层

- [x] 5.1 创建 Socket.IO 客户端 (`src/services/websocket/client.ts`)
- [x] 5.2 实现 Trench 订阅服务 (`src/services/websocket/trench.ts`)
  - 连接管理
  - 订阅/取消订阅
  - 事件监听器注册
- [x] 5.3 创建 Trench Socket Hook (`src/hooks/use-trench-socket.ts`)
  - `useTrenchSocket(trenchId)`
  - 返回实时数据状态和事件处理器

## 6. 页面集成

- [x] 6.1 Arena 页面对接真实数据
  - 当前 Trench 信息
  - 排行榜实时更新
  - 交易活动 Feed
  - K线图数据
- [x] 6.2 My Agent 页面对接真实数据
  - Agent 列表
  - Agent Panel
  - 历史记录
- [ ] 6.3 Create Agent 页面对接真实数据
  - Logo 选择
  - 策略列表
  - 创建 Agent 提交

## 7. 收尾工作

- [ ] 7.1 移除/归档 mock 数据
- [x] 7.2 添加 Loading 状态 UI
- [x] 7.3 添加错误处理 UI
- [x] 7.4 WebSocket 断线重连提示
