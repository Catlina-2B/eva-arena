# Project Context

## Purpose

EVA 是一个基于 Solana 的 AI Agent 博弈平台。每轮游戏持续 3000 个区块（约 20 分钟），参与者可以创建自定义策略的 Agent 进入竞技场。每轮发行新 Token（Eva-[开盘区块号]），Agent 通过竞价、交易等策略争夺 Token 持有量，最终 Top 3 持有者获得 SOL 奖励。

### 核心目标

- 建立自平衡的 Agent 博弈生态系统
- 验证 AI Agent 在加密货币交易中的策略多样性
- 实现 7×24 小时无人值守的自动化竞技

### 目标用户

- **Agent 开发者**：创建和配置自定义策略的 Agent，通过优化策略在竞技场中获得收益
- **策略观察者**：观察不同策略的表现，学习博弈论和交易技巧

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (构建工具)
- HeroUI (组件库)
- Tailwind CSS 4 (样式)
- Framer Motion (动画)
- React Router DOM (路由)
- TradingView Lightweight Charts (K线图)

### Blockchain
- Solana Web3.js
- Anchor Framework
- Particle (钱包连接)

### AI/Backend
- OpenAI API / Claude API (Agent 推理)
- WebSocket (实时通信)

## Project Conventions

### Code Style

- 使用 ESLint + Prettier 进行代码格式化
- TypeScript 严格模式 (`strict: true`)
- 使用 `@/*` 路径别名指向 `./src/*`
- 导入顺序：types → builtin → external → internal → parent → sibling → index
- 组件 props 按字母顺序排列，callbacks 在最后
- 函数组件使用箭头函数或 function 声明

### Naming Conventions

- **文件名**：kebab-case（如 `agent-panel.tsx`）
- **组件**：PascalCase（如 `AgentPanel`）
- **函数/变量**：camelCase（如 `handleSubmit`）
- **常量**：SCREAMING_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- **类型/接口**：PascalCase，接口不加 `I` 前缀

### Component Patterns

- Pages 使用 default export，位于 `/src/pages/`
- 可复用组件使用 named export，位于 `/src/components/`
- Layouts 使用 default export，位于 `/src/layouts/`
- 优先使用 HeroUI 组件，保持 UI 一致性
- 使用 `tailwind-variants` 处理组件样式变体

### File Structure

```
src/
├── components/     # 可复用组件
├── config/         # 配置文件
├── hooks/          # 自定义 Hooks
├── layouts/        # 页面布局
├── lib/            # 工具库和第三方集成
├── pages/          # 页面组件
├── services/       # API 服务层
├── stores/         # 状态管理
├── styles/         # 全局样式
└── types/          # TypeScript 类型定义
```

### State Management

- 简单状态：React useState/useReducer
- 跨组件状态：React Context 或 Zustand（待引入）
- 服务端状态：React Query/SWR（待引入）

### Testing Strategy

- 单元测试：Vitest（待引入）
- E2E 测试：Playwright（待引入）
- 重要业务逻辑必须有测试覆盖

### Git Workflow

- 主分支：`main`
- 功能分支：`feat/功能名称`
- 修复分支：`fix/问题描述`
- Commit 消息：使用 Conventional Commits 规范

## Domain Context

### 核心概念

| 术语 | 说明 |
|------|------|
| **Arena（竞技场）** | 每轮游戏的博弈环境，持续 3000 个区块（约 20 分钟） |
| **Agent** | 用户创建的 AI 交易机器人，根据策略自动执行交易 |
| **竞价阶段** | 前 300 区块，Agent 投入/撤出 SOL，结束后按比例分配 50% Token |
| **自由交易阶段** | 第 300-2700 区块，Agent 在 Bonding Curve 池中自由买卖 |
| **清算阶段** | 第 2700-3000 区块，停止交易，按持仓分配奖励 |
| **Bonding Curve** | 代币价格曲线，定义代币价格与供应量的关系 |
| **Token** | 每轮发行的代币，命名为 Eva-[开盘区块号]，总量 10 亿 |

### 游戏规则

1. **代币分配**：竞价阶段 50% Token 按投入比例分配
2. **池子创建**：20% SOL + 50% Token 创建 Bonding Curve 池
3. **奖金池**：80% SOL 作为获胜奖金
4. **奖励分配**：Top 1 (50%) / Top 2 (30%) / Top 3 (15%) / 其余 (5%)

### 角色权限

- **平台**：管理游戏轮次、执行清算、收取协议费
- **Agent 创建者**：创建配置 Agent、充值提现、监控表现
- **Agent**：自动执行策略、响应市场变化

## Important Constraints

### 技术约束

- 区块链：仅支持 Solana 主网/测试网
- 钱包：支持 Phantom/OKX/Solflare（通过 Particle）
- 浏览器：现代浏览器（Chrome/Firefox/Safari/Edge 最新版本）

### 业务约束

- Agent 执行频率固定 10 秒/次
- 单次执行超时 8 秒自动终止
- 交易手续费 1%
- 创建 Agent 费用 0.1 SOL

### 性能要求

- 页面首屏加载 < 3s
- 实时数据延迟 < 1s
- K线图流畅更新（60fps）

## External Dependencies

### APIs

- Solana RPC 节点
- OpenAI/Claude API (Agent 推理)
- Particle Auth (钱包连接)

### 实时数据

- WebSocket 连接获取：
  - K线数据
  - Holders 排名
  - 交易 Feed
  - 池子信息

### 智能合约

- Token 发行合约
- Bonding Curve 池合约
- 清算合约
- Turnkey 账户合约
