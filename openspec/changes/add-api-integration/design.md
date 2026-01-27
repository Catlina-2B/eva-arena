## Context

EVA Arena 前端需要对接后端 REST API 和 WebSocket 服务。后端基于 NestJS 开发，提供：
- REST API：认证、Agent 管理、Trench 竞技场、策略等
- WebSocket：基于 Socket.IO，通过 Redis Pub/Sub 实现实时数据推送

### 后端 API 概览

| 模块 | 端点前缀 | 说明 |
|------|----------|------|
| Auth | `/api/auth` | 钱包签名登录、Token 刷新 |
| Agents | `/api/agents` | Agent CRUD、充值提现、历史 |
| Trenches | `/api/trenches` | 竞技场轮次、排行榜、交易 |
| Strategies | `/api/strategies` | 策略管理 |
| Price | `/api/price` | SOL 价格 |
| IPFS | `/api/ipfs` | 文件上传 |

### WebSocket 概览

- 端点: `ws://[host]/trench`
- 事件类型:
  - `subscribeTrench` / `unsubscribeTrench` - 订阅/取消订阅
  - `trenchUpdate` - Trench 状态更新
  - `priceUpdate` - 价格更新
  - `transaction` - 新交易通知
  - `leaderboardUpdate` - 排行榜更新

## Goals / Non-Goals

### Goals
- 建立类型安全的 API 客户端层
- 使用 React Query 管理服务端状态（缓存、重新获取、乐观更新）
- 封装 WebSocket 连接为可复用的 Hooks
- 统一错误处理和 Loading 状态
- 保持与 mock 数据的接口兼容，便于渐进式替换

### Non-Goals
- 不修改后端 API
- 不实现离线支持
- 不实现复杂的状态持久化

## Decisions

### 1. HTTP 客户端选择: Axios + React Query

**决策**: 使用 Axios 作为 HTTP 客户端，React Query 作为服务端状态管理

**理由**:
- Axios：interceptors 支持好，易于处理 Token 刷新
- React Query：自动缓存、后台刷新、乐观更新、DevTools

**目录结构**:
```
src/services/
├── api/
│   ├── client.ts          # Axios 实例配置
│   ├── auth.ts            # 认证 API
│   ├── agents.ts          # Agent API
│   ├── trenches.ts        # Trench API
│   ├── strategies.ts      # Strategy API
│   ├── price.ts           # Price API
│   └── index.ts           # 统一导出
├── websocket/
│   ├── client.ts          # Socket.IO 客户端
│   ├── trench.ts          # Trench 订阅逻辑
│   └── index.ts
└── index.ts
```

### 2. WebSocket 客户端: Socket.IO Client

**决策**: 使用 `socket.io-client` 库

**理由**:
- 后端使用 Socket.IO，保持一致性
- 自动重连、房间订阅支持
- 事件驱动模型易于集成

### 3. 认证状态管理: Zustand

**决策**: 使用 Zustand 管理认证状态（tokens、用户信息）

**理由**:
- 轻量级，API 简洁
- 支持持久化到 localStorage
- 与 React Query 配合良好

**Store 结构**:
```typescript
interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (tokens: LoginResponse) => void;
  logout: () => void;
  refreshTokens: (tokens: RefreshResponse) => void;
}
```

### 4. API 响应格式

后端统一响应格式：
```typescript
interface ApiResponse<T> {
  code: number;     // 0 = success
  message: string | null;
  data: T;
}
```

封装响应拦截器自动解包 `data` 字段。

### 5. React Query Hooks 封装

每个 API 模块提供对应的 Hooks：

```typescript
// hooks/use-trenches.ts
export function useCurrentTrench() {
  return useQuery({
    queryKey: ['trench', 'current'],
    queryFn: () => trenchApi.getCurrent(),
  });
}

export function useTrenchDetail(trenchId: number) {
  return useQuery({
    queryKey: ['trench', trenchId],
    queryFn: () => trenchApi.getDetail(trenchId),
    enabled: !!trenchId,
  });
}

export function useLeaderboard(trenchId: number) {
  return useQuery({
    queryKey: ['trench', trenchId, 'leaderboard'],
    queryFn: () => trenchApi.getLeaderboard(trenchId),
  });
}
```

### 6. WebSocket Hooks 封装

```typescript
// hooks/use-trench-socket.ts
export function useTrenchSocket(trenchId: number | null) {
  const [isConnected, setIsConnected] = useState(false);
  
  // 订阅事件回调
  const onPriceUpdate = useCallback((handler: (data: PriceUpdateEvent) => void) => {
    // ...
  }, []);
  
  const onTransaction = useCallback((handler: (data: TransactionEvent) => void) => {
    // ...
  }, []);
  
  // 自动连接/断开
  useEffect(() => {
    if (!trenchId) return;
    // connect and subscribe
    return () => { /* disconnect */ };
  }, [trenchId]);
  
  return { isConnected, onPriceUpdate, onTransaction, ... };
}
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Token 过期导致请求失败 | Axios interceptor 自动刷新 Token |
| WebSocket 断线 | Socket.IO 自动重连 + UI 断线提示 |
| 类型与后端不一致 | 从 Swagger 生成类型定义 |
| 大量请求影响性能 | React Query 缓存 + 合理的 staleTime |

## Migration Plan

1. **Phase 1**: 基础设施
   - 安装依赖 (axios, react-query, socket.io-client, zustand)
   - 配置 API 客户端和 Query Provider
   - 实现认证服务和 Store

2. **Phase 2**: API 服务层
   - 实现各 API 模块
   - 创建对应的 React Query Hooks
   - 更新类型定义

3. **Phase 3**: WebSocket 集成
   - 实现 Socket.IO 客户端
   - 封装 Trench 订阅 Hooks
   - 集成到 Arena 页面

4. **Phase 4**: 页面接入
   - Arena 页面对接真实数据
   - My Agent 页面对接真实数据
   - Create Agent 页面对接真实数据

## Open Questions

1. 是否需要从 Swagger 自动生成 TypeScript 类型？（推荐后续实现）
2. 离线时的降级策略是什么？（当前先显示错误提示）

