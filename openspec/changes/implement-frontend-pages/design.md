# Design Document: 前端核心页面实现

## Context

EVA 是一个基于 Solana 的 AI Agent 博弈平台。前端需要展示复杂的实时数据（K线、排名、交易流）并提供流畅的用户交互体验。设计采用赛博朋克深色主题，需要与现有 HeroUI 组件库协调。

**Figma 设计参考**: [🟣 EVA](https://www.figma.com/design/vbZiWKh4KbiSk7TqoMKzGl/%F0%9F%9F%A3-EVA)

## Goals / Non-Goals

### Goals
- 实现产品 V1.0.0 核心页面功能
- 保持与 Figma 设计高度一致的视觉效果
- 建立可复用的组件体系
- 支持后续实时数据集成

### Non-Goals
- K线图表集成（后续单独任务）
- 完整的后端 API 集成（使用 Mock 数据）
- 移动端适配优化（优先桌面端）
- 多语言支持

## Decisions

### 1. 组件架构

**决策**: 采用分层组件架构

```
src/components/
├── ui/              # 基础 UI 组件（扩展 HeroUI）
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── ProgressBar.tsx
│   └── Modal.tsx
├── arena/           # Arena 页面组件
│   ├── TargetInfoCard.tsx
│   ├── PhaseProgressBar.tsx
│   ├── PreMarketBetting.tsx
│   ├── LiveActivity.tsx
│   ├── LiveRankings.tsx
│   └── WelcomeCard.tsx
├── agent/           # Agent 相关组件
│   ├── AgentCard.tsx
│   ├── AgentFunds.tsx
│   ├── AgentHistory.tsx
│   ├── TradeHistory.tsx
│   └── CreateAgentModal.tsx
└── wallet/          # 钱包相关组件
    ├── ConnectWalletButton.tsx
    ├── WalletModal.tsx
    ├── DepositModal.tsx
    └── WithdrawModal.tsx
```

**理由**: 按业务域组织便于维护和查找，基础 UI 组件可跨域复用。

### 2. 样式方案

**决策**: 继续使用 Tailwind CSS + tailwind-variants，扩展主题配置

```js
// tailwind.config.js 扩展
theme: {
  extend: {
    colors: {
      'eva-dark': '#0a0a0f',
      'eva-card': '#12121a',
      'eva-border': '#1e1e2e',
      'eva-primary': '#00ff88',    // 绿色强调
      'eva-secondary': '#a855f7',  // 紫色强调
      'eva-danger': '#ef4444',
    },
    fontFamily: {
      'mono': ['JetBrains Mono', 'monospace'],
      'display': ['Orbitron', 'sans-serif'],  // 赛博朋克标题字体
    }
  }
}
```

**理由**: 与现有技术栈一致，通过配置扩展实现设计系统。

### 3. 状态管理

**决策**: 分层状态管理策略

| 状态类型 | 方案 | 用例 |
|---------|------|------|
| UI 状态 | useState | Modal 开关、表单输入 |
| 页面状态 | useReducer + Context | Arena 当前阶段、筛选条件 |
| 全局状态 | React Context | 钱包连接状态、用户 Agent 列表 |
| 服务端缓存 | 预留 React Query | API 数据获取（后续集成）|

**理由**: 渐进式复杂度，避免过度工程化。初期不引入 Zustand/Redux。

### 4. 路由结构

**决策**: 简化路由，Arena 作为首页

```tsx
<Routes>
  <Route path="/" element={<ArenaPage />} />
  <Route path="/my-agent" element={<MyAgentPage />} />
</Routes>
```

**理由**: 符合产品主流程，用户进入即看到竞技场。

### 5. Mock 数据策略

**决策**: 创建独立的 mock 服务模块

```
src/services/
├── mock/
│   ├── arena.ts      # Arena 模拟数据
│   ├── agent.ts      # Agent 模拟数据
│   └── index.ts
└── api/
    ├── arena.ts      # 真实 API（后续）
    └── agent.ts
```

**理由**: 开发阶段使用 mock 数据，便于后续替换为真实 API。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|-----|---------|
| HeroUI 组件样式与设计不符 | 使用 classNames 覆盖或创建自定义组件 |
| 实时数据性能问题 | 使用 React.memo、useMemo 优化渲染 |
| 字体加载影响 LCP | 使用 font-display: swap，预加载关键字体 |

## Open Questions

1. **Particle Auth 具体配置** - 需要确认 App ID 和环境配置
2. **WebSocket 端点** - 需要后端确认实时数据推送格式
3. **K线图库选择** - TradingView Lightweight Charts vs 其他方案

