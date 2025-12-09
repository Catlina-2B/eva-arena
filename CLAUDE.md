# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 1. 目录结构约束 (Directory Constraints)

### 核心目录 (`src/`)
- **`components/`**: UI 组件
  - **`ui/`**: 基础原子组件 (shadcn/ui)，严禁包含业务逻辑。
  - **`features/`**: 业务功能组件，按功能模块分组 (建议将现有散落组件迁移至此)。
    - 例如: `game/`, `agent/`, `trading/`, `wallet/`
  - **`layout/`**: 布局组件 (如 `Navigation`, `Sidebar`)。
- **`hooks/`**: 自定义 React Hooks
  - 文件名必须以 `use` 开头。
  - 区分全局状态 (`useGameEngine`) 和功能性 Hook (`useLocalStorage`)。
- **`pages/`**: 路由页面组件
  - 仅包含页面级组合逻辑，不应包含复杂 UI 实现。
- **`lib/`**: 工具函数和库配置
  - **`utils.ts`**: 通用工具函数 (shadcn 依赖)。
  - **`constants.ts`**: 全局常量。
- **`types/`** (或 `types.ts`): 类型定义
  - 通用类型放根目录，特定模块类型可放模块内。

### 规则
1. **就近原则**: 如果组件仅在某个页面或父组件中使用，且不通用，考虑放在同一目录下或子目录中。
2. **禁止循环依赖**: 避免组件间的循环引用。
3. **文件命名**: 
   - 组件/页面: `PascalCase.tsx`
   - Hooks/工具: `camelCase.ts`

## 2. 代码规范 (Code Standards)

### React & TypeScript
- **组件定义**: 使用函数式组件 (`function` 或 `const` 均可，保持一致)。
- **Props 类型**: 必须定义 Props 接口，推荐命名 `[ComponentName]Props` 或直接解构。
- **导出**: 
  - 组件: `export function` 或 `export const` (Named Export)。
  - 页面: `export default` (便于 Lazy Load)。
- **Hooks**: 必须遵循 Hooks 规则，顶层调用。

### 样式 (Styling)
- **Tailwind CSS**: 首选样式方案。
- **Shadcn UI**: 使用 `components/ui` 中的组件作为构建块。
- **CSS Modules**: 仅在 Tailwind 无法满足复杂动画或特定样式时使用。
- **Glass Effect**: 使用 `.glass-card`, `.glass-border-subtle` 等预定义类。

### 状态管理
- **本地状态**: UI 交互状态 (`useState`, `useReducer`)。
- **全局状态**: 游戏核心逻辑使用 `useGameEngine`。
- **避免 Prop Drilling**: 超过 3 层传递考虑 Context 或组合模式。

### 错误处理
- 关键操作需有错误捕获 (try-catch)。
- UI 层需有错误反馈 (Toast 或 Error Boundary)。

## 3. 项目架构参考

### 技术栈
- **核心**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4 + shadcn/ui
- **图表**: TradingView Charting Library
- **状态**: React Hooks (Custom Game Engine)

### 核心模块
1.  **Game Engine (`useGameEngine.ts`)**
    - 管理游戏生命周期: BIDDING -> TRADING -> LIQUIDATION -> ENDED
    - 维护 AMM 状态和机器人逻辑
2.  **TradingView集成**
    - 位于 `public/charting_library/`
    - 自定义 Datafeed 模拟数据

## 4. 开发工作流
1.  **添加组件**: 先检查 `ui` 目录是否有可用基础组件，再在 `features` 或 `components` 根目录创建业务组件。
2.  **修改逻辑**: 涉及游戏规则修改 `useGameEngine.ts` 和 `types.ts`。
3.  **运行测试**: 修改后运行 `pnpm dev` 验证。

## 常用命令
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建
- `pnpm lint` - 检查代码
