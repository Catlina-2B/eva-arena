# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 开发命令

### 构建和开发
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本 (包含 TypeScript 编译)
- `pnpm preview` - 预览构建结果
- `pnpm lint` - 运行 ESLint 检查

### 依赖管理
- 使用 `pnpm` 作为包管理器
- 使用 `yarn.lock` 和 `pnpm-lock.yaml` (项目历史原因)

## 项目架构

### 技术栈
- **前端框架**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4 + shadcn/ui 组件
- **图表库**: TradingView Charting Library
- **状态管理**: React hooks (useGameEngine)

### 核心架构概念

#### 1. 游戏引擎 (useGameEngine)
- **路径**: `src/hooks/useGameEngine.ts`
- **职责**: 管理多个 "trenches" (游戏场次) 的状态和生命周期
- **关键功能**:
  - 创建和管理多个游戏实例
  - 阶段转换: BIDDING → TRADING → LIQUIDATION → ENDED
  - AMM (自动做市商) 逻辑实现
  - 机器人行为模拟
  - 每3分钟自动创建新的 trench

#### 2. 游戏状态模型
- **Phase**: BIDDING (投标) | TRADING (交易) | LIQUIDATION (清算) | ENDED (结束)
- **Agent Types**: USER | BOT_HOLDER | BOT_ARBITRAGE | BOT_SNIPER
- **时间周期**:
  - BIDDING: 3分钟 (180s)
  - TRADING: 11分钟 (660s) 
  - LIQUIDATION: 1分钟 (60s)

#### 3. AMM 实现
- **算法**: Constant Product AMM (x * y = k)
- **手续费**: 0.25%
- **初始化逻辑**:
  - 20% 的投标金额作为 SOL 储备
  - 50% 的代币作为初始储备
  - 80% 的投标金额作为奖池

#### 4. 组件架构
- **布局**: 响应式设计，桌面端3列布局，移动端单列
- **核心组件**:
  - `TrenchList`: 侧边栏 trench 选择器
  - `AMMVisual`: 包含 TradingView 图表的 AMM 池可视化
  - `ActionPanel`: 用户交互面板 (存款/交易)
  - `Leaderboard`: 排行榜显示
  - `GameStatus`: 游戏状态显示

#### 5. TradingView 集成
- **路径**: `public/charting_library/`
- **集成**: 自定义 datafeed 实现模拟 K 线数据
- **主题**: 深色主题，与应用 UI 一致
- **数据**: 实时生成模拟交易数据

### UI 系统
- **组件库**: shadcn/ui (基于 Radix UI)
- **样式系统**: Tailwind CSS 定制类
- **主题**: 暗色赛博朋克风格，使用 "glass" 效果
- **自定义类**: 
  - `.glass-card`, `.glass-border-subtle` - 玻璃效果
  - `.neon-text`, `.neon-border` - 霓虹效果

### 关键开发模式

#### 1. 状态更新模式
```typescript
// 使用 updateTrench 函数更新特定 trench
updateTrench(trenchId, (trench) => {
    // 返回更新后的 trench 状态
    return { ...trench, /* updates */ };
});
```

#### 2. 组件 Props 模式
- 使用 TypeScript 接口定义 props
- 从 `types.ts` 导入共享类型
- 组件解构 props 参数

#### 3. Hook 使用模式
- `useGameEngine` 提供游戏状态和操作
- 自定义 hooks 如 `useLocalStorage` 用于持久化

### 构建配置
- **Vite**: 使用路径别名 `@` 指向 `src`
- **TypeScript**: 复合项目配置 (app + node)
- **ESLint**: React hooks 和 TypeScript 规则

### 添加新功能指导

#### 添加新的游戏机制
1. 在 `types.ts` 中定义类型
2. 在 `useGameEngine.ts` 中实现逻辑
3. 创建对应的 UI 组件
4. 集成到主 App 布局中

#### 添加新的 UI 组件
1. 使用 shadcn/ui CLI 添加基础组件: `npx shadcn-ui add [component]`
2. 遵循现有的命名和文件结构
3. 使用 Tailwind CSS 和现有的设计 tokens

#### 扩展 TradingView 功能
- 修改 `TradingViewChart.tsx` 中的配置
- 更新模拟数据生成逻辑
- 注意 TradingView 库的异步加载