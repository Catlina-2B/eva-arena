# Change: 对接后端 REST API 与 WebSocket 实时数据

## Why

前端目前使用 mock 数据进行开发，需要对接后端真实的 REST API 和 WebSocket 服务，实现完整的数据交互功能。后端已提供完善的 API 接口（包括认证、Agent 管理、Trench 竞技场、策略等）和 WebSocket 实时推送（价格更新、交易通知、排行榜等）。

## What Changes

### REST API 层

- 新增 API 客户端配置（base URL、interceptors、错误处理）
- 新增认证服务（钱包登录、Token 刷新、用户信息）
- 新增 Agent API 服务（CRUD、充值/提现、历史记录）
- 新增 Arena/Trench API 服务（当前轮次、排行榜、交易记录、价格曲线）
- 新增 Strategy API 服务（策略列表、创建/更新）
- 新增 Price API 服务（SOL 价格）
- 使用 React Query 进行服务端状态管理

### WebSocket 层

- 新增 Socket.IO 客户端集成
- 实现 Trench 实时订阅服务
- 支持事件类型：`trenchUpdate`, `priceUpdate`, `transaction`, `leaderboardUpdate`
- 封装为 React Hooks 供组件使用

### 类型系统

- 根据后端 DTO 定义完善前端类型
- 统一 API 响应格式处理

## Impact

- Affected specs: 新增 `api-layer` 和 `websocket` capability
- Affected code:
  - `src/services/` - 新增 API 服务模块
  - `src/hooks/` - 新增数据获取 hooks
  - `src/types/` - 扩展类型定义
  - `src/stores/` - 可能新增 Zustand store 管理认证状态
  - 页面组件 - 接入真实数据替换 mock

