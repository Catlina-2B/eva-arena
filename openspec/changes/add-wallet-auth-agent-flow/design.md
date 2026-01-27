## Context

EVA 前端需要实现完整的用户认证流程：钱包连接 → 签名登录 → 检查 Agent → 创建/管理 Agent。

### 现有实现
- Particle Connect Kit 已集成，可以连接钱包
- Auth Store 已实现，可以存储登录状态
- Auth API 已封装，可以调用后端登录接口
- Agent API 已封装，包括 logos 和 create 接口

### 缺失部分
- 钱包连接后的自动签名登录流程
- 登录后的 Agent 检查逻辑
- 页面路由守卫
- Create Agent 页面与后端 API 的对接

## Goals / Non-Goals

### Goals
- 实现无缝的钱包连接 → 签名登录流程
- 用户无需额外操作，连接钱包后自动完成登录
- 新用户自动引导至创建 Agent 页面
- 使用后端统一管理的 Agent Logo 列表

### Non-Goals
- 多钱包同时登录（当前仅支持单一钱包）
- 离线签名（需要钱包在线签名）
- 自定义 Logo 上传（使用预设列表）

## Decisions

### 1. 签名消息格式
使用标准 SIWS (Sign-In with Solana) 消息格式：
```
eva.arena wants you to sign in with your Solana account:
<wallet-address>

Welcome to EVA Arena!

URI: https://eva.arena
Version: 1
Chain ID: mainnet
Nonce: <random-nonce>
Issued At: <ISO-8601-timestamp>
```

消息经 Base64 编码后发送到后端，后端需要：
1. 解析 SIWS 消息格式
2. 验证 `Issued At` 时间在 5 分钟内
3. 验证签名与 publicKey 匹配

**注意**: 后端当前使用自定义 JSON 格式，需要同步更新以支持 SIWS 格式。

SIWS 消息结构：
- `domain`: 应用域名 (eva.arena)
- `address`: 用户钱包地址
- `statement`: 签名说明
- `uri`: 应用 URI
- `version`: 协议版本
- `chainId`: 链 ID (mainnet/devnet)
- `nonce`: 随机数防重放攻击
- `issuedAt`: 签名时间 (ISO 8601)

### 2. 登录触发时机
在 `WalletConnectButton` 组件中监听钱包连接状态变化：
- 当 `isConnected` 从 `false` 变为 `true` 时自动触发登录
- 如果 Auth Store 已有有效 token 则跳过登录

### 3. Agent 检查策略
登录成功后立即获取用户 Agent 列表：
- 有 Agent：继续当前页面
- 无 Agent：自动跳转到 `/create-agent`

### 4. Logo 分类展示
后端返回两类 Logo：
- `mecha`: 机甲类头像
- `pilot`: 飞行员类头像

前端按分类展示，用户选择后存储完整 IPFS URL。

## Risks / Trade-offs

### 签名请求可能被拒绝
- Risk: 用户拒绝签名会导致登录失败
- Mitigation: 显示友好提示，允许重新尝试

### Token 过期处理
- Risk: AccessToken 过期后需要刷新
- Mitigation: 使用 axios interceptor 自动刷新 token

## API Reference

### 登录 API
```
POST /api/auth/login
{
  "publicKey": "钱包公钥",
  "message": "base64 编码的 SIWS 消息",
  "signature": "base64 编码的签名",
  "chainType": "solana"
}

SIWS 消息示例 (编码前):
eva.arena wants you to sign in with your Solana account:
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

Welcome to EVA Arena!

URI: https://eva.arena
Version: 1
Chain ID: mainnet
Nonce: a1b2c3d4e5f6
Issued At: 2024-12-23T12:00:00.000Z

Response:
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 259200,
  "tokenType": "Bearer",
  "user": { "id": "...", "publicKey": "..." }
}
```

### Logo API
```
GET /api/agents/logos

Response:
{
  "pilot": ["ipfs://...", ...],
  "mecha": ["ipfs://...", ...]
}
```

### 创建 Agent API
```
POST /api/agents
{
  "name": "Agent Name",
  "logo": "ipfs://...",
  "pdaAddress": "...",
  "bettingStrategyPrompt": "...",
  "filterConfig": { ... }
}
```

## Open Questions

1. 是否需要显示登录进度（签名中、验证中等状态）？
2. 创建 Agent 时 pdaAddress 如何生成？需要调用合约还是后端生成？
3. filterConfig 必填字段的默认值是什么？

