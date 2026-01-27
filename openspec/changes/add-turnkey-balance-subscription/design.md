## Context

用户在 EVA 平台创建 Agent 后会获得一个 Turnkey 钱包地址用于充值和交易。当前实现中：
1. turnkeyAddress 来自 agent 数据
2. 余额数据来自 agent panel API 轮询
3. 多个组件各自获取余额数据

需要改进为：
1. turnkeyAddress 从用户认证信息获取（`/auth/me` 返回）
2. 通过 Solana RPC WebSocket 实时订阅余额变化
3. 使用全局状态统一管理余额

## Goals / Non-Goals

### Goals
- 充值地址统一从用户认证信息获取
- 使用 Solana RPC WebSocket 实现实时余额订阅
- 所有余额显示使用全局状态，确保一致性
- 余额更新时自动刷新所有相关 UI

### Non-Goals
- 不改变 agent panel API 的其他数据获取方式
- 不修改提现/充值的业务逻辑
- 暂不实现余额历史记录功能

## Decisions

### 1. 全局状态方案：使用 Zustand

**选择理由**：
- 项目已使用 Zustand 管理 auth 状态
- 轻量级，无需额外学习成本
- 支持持久化和订阅

**Store 结构**：
```typescript
interface TurnkeyBalanceState {
  balance: number;          // SOL 余额（lamports 转换后）
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  subscriptionId: number | null;
  
  setBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSubscriptionId: (id: number | null) => void;
  reset: () => void;
}
```

### 2. WebSocket 订阅方案：Solana RPC accountSubscribe

**实现方式**：
- 使用已有的 `getSolanaConnection()` 获取 Connection 实例
- 使用 `connection.onAccountChange()` 订阅账户变化
- 账户变化时自动接收新的 lamports 余额
- 转换 lamports 为 SOL（除以 1e9）后更新 store

**Solana Web3.js API**：
```typescript
import { PublicKey } from "@solana/web3.js";
import { getSolanaConnection } from "@/services/solana";

function subscribeBalance(
  address: string, 
  onBalanceChange: (balance: number) => void
): () => void {
  const connection = getSolanaConnection();
  const publicKey = new PublicKey(address);
  
  // 订阅账户变化
  const subscriptionId = connection.onAccountChange(
    publicKey,
    (accountInfo) => {
      const balanceInSol = accountInfo.lamports / 1e9;
      onBalanceChange(balanceInSol);
    },
    "confirmed"
  );
  
  // 返回取消订阅函数
  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
}
```

**初始余额获取**：
```typescript
async function getBalance(address: string): Promise<number> {
  const connection = getSolanaConnection();
  const publicKey = new PublicKey(address);
  const lamports = await connection.getBalance(publicKey);
  return lamports / 1e9;
}
```

### 3. Hook 设计

```typescript
function useTurnkeyBalance() {
  // 从 auth store 获取 turnkeyAddress
  const { user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress;
  
  // 从 balance store 获取余额状态
  const { balance, isLoading, error, setBalance, setLoading, setError } = 
    useTurnkeyBalanceStore();
  
  // 订阅效果
  useEffect(() => {
    if (!turnkeyAddress) return;
    
    setLoading(true);
    
    // 1. 获取初始余额
    getBalance(turnkeyAddress)
      .then((bal) => {
        setBalance(bal);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    
    // 2. 订阅余额变化
    const unsubscribe = subscribeBalance(turnkeyAddress, (newBalance) => {
      setBalance(newBalance);
    });
    
    return () => unsubscribe();
  }, [turnkeyAddress]);
  
  return { balance, isLoading, error, turnkeyAddress };
}
```

### 4. 连接配置

项目已有 Solana connection 配置 (`src/services/solana/connection.ts`)：
- 使用 `VITE_SOLANA_RPC_URL` 环境变量
- 默认 mainnet-beta
- Connection 实例单例模式

Solana RPC 的 WebSocket URL 会自动从 HTTP URL 推导（替换 https 为 wss）。

## Risks / Trade-offs

### Risk: RPC WebSocket 连接不稳定
**缓解措施**：
- Solana web3.js 内置重连机制
- 可添加心跳检测和手动重连逻辑
- 断连时保持显示上次余额

### Risk: RPC 订阅限制
**说明**：部分 RPC 节点可能有订阅数量限制
**缓解措施**：
- 使用付费 RPC 服务（如 Helius、QuickNode）
- 单用户单订阅，控制订阅数量

### Risk: 余额数据源冲突
**说明**：agent panel API 仍返回 currentBalance，可能与 RPC 余额不一致
**缓解措施**：
- Turnkey 钱包余额优先使用 RPC 实时数据
- agent panel 的 currentBalance 可能有延迟，作为备份

## Migration Plan

1. 更新 API 类型定义（向后兼容）
2. 创建余额 store 和订阅服务
3. 创建 hook 封装订阅逻辑
4. 逐步迁移组件使用新的余额数据源
5. 移除旧的 panel 余额获取依赖（可选）

## Open Questions

1. 是否需要处理多个 Turnkey 钱包地址的场景？（目前假设用户只有一个）
2. 当 RPC 订阅失败时是否降级为轮询？
3. 是否需要缓存余额到 localStorage？
