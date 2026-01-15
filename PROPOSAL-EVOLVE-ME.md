# EVOLVE ME 功能提案

## 概述

在首页 Arena 的 Agent Dashboard Card 中，将现有的**编辑按钮**替换为 **EVOLVE ME** 按钮，点击后打开右侧抽屉，用户可以通过与 AI 对话来优化 Agent 的策略 Prompt，让 Agent 变得更强。

## 设计参考

- **EVOLVE ME 按钮**: [Figma node-id=1429-9626](https://www.figma.com/design/vbZiWKh4KbiSk7TqoMKzGl/%F0%9F%9F%A3-EVA?node-id=1429-9626&m=dev)
- **AI PROMPT 抽屉**: [Figma node-id=291-21866](https://www.figma.com/design/vbZiWKh4KbiSk7TqoMKzGl/%F0%9F%9F%A3-EVA?node-id=291-21866&m=dev)

---

## UI 变更详情

### 1. Agent Dashboard Card 修改

**位置**: `frontend-new/src/components/arena/agent-dashboard-card.tsx`

#### 当前状态
- Agent 名称旁边有一个编辑图标按钮（铅笔图标）
- 点击后触发 `onEditName` 回调，打开编辑 Agent 的 Modal

#### 变更后
- 移除编辑图标按钮
- 添加 **EVOLVE ME →** 按钮
- 按钮样式：
  - 边框：绿色 (`#6ce182`)
  - 文字：白色，大写
  - 带右箭头图标
  - Hover 效果：背景变为绿色半透明

```tsx
// EVOLVE ME 按钮样式参考
<button className="flex items-center gap-2 px-4 py-1.5 border border-[#6ce182] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#6ce182]/10 transition-colors">
  EVOLVE ME
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</button>
```

#### Props 变更

```diff
interface AgentDashboardCardProps {
  // ... 现有 props
- onEditName?: () => void;
+ onEvolveMe?: () => void;  // 点击 EVOLVE ME 按钮
}
```

---

### 2. 新增 Evolve Me Drawer 组件

**位置**: `frontend-new/src/components/agent/evolve-me-drawer.tsx`

这是一个新的右侧抽屉组件，用于与 AI 对话优化 Agent 策略。

#### 主要功能

1. **对话式交互**
   - AI 消息气泡（左侧，带 AI 头像）
   - 用户消息气泡（右侧，绿色背景）
   - 支持自然语言输入

2. **策略优化请求**
   - 用户可以输入如 "当涨幅超过50%时卖出本金"
   - 调用后端 API 获取优化后的 Prompt

3. **Prompt Diff 显示**
   - 红色背景 + 红色左边框：删除的内容（`-` 开头）
   - 绿色背景 + 绿色左边框：新增的内容（`+` 开头）
   - 支持 Show more / Show less 展开收起

4. **确认应用**
   - "Apply for next round" 按钮（紫色）
   - 确认后调用 `PUT /api/agents/:id` 更新对应策略

#### 组件接口

```tsx
interface EvolveMeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  currentBettingPrompt: string;
  currentTradingPrompt: string;
  onSuccess?: () => void;  // 成功更新后回调
}
```

#### UI 结构

```
┌─────────────────────────────────────┐
│ /// EVOLVE ME           [✓] [✕]    │  <- Header
├─────────────────────────────────────┤
│                                     │
│  🤖 I'm here to help you evolve    │  <- AI Message
│     your agent strategy.            │
│                                     │
│     What would you like to          │
│     improve?                        │
│                                     │
│     ┌─────────────────────────┐     │
│     │ Trading Phase Strategy  │     │
│     ├─────────────────────────┤     │
│     │ - Small position sizing │ RED │  <- 删除
│     │ + During the trading... │ GRN │  <- 新增
│     │                         │     │
│     │      Show more ▼        │     │
│     └─────────────────────────┘     │
│                                     │
│     [✓ Apply for next round]        │  <- 紫色按钮
│                                     │
│                     "涨幅50%卖本金" │  <- User Message
│                                     │
├─────────────────────────────────────┤
│ [Type your message...]        [↑]   │  <- Input
└─────────────────────────────────────┘
```

---

### 3. Prompt Diff 组件

**位置**: `frontend-new/src/components/agent/prompt-diff.tsx`

专门用于显示 Prompt 的前后对比。

#### 设计规范

| 类型 | 前缀 | 背景色 | 左边框色 |
|------|------|--------|----------|
| 删除 | `-` | `rgba(248, 113, 113, 0.1)` | `#f87171` |
| 新增 | `+` | `rgba(108, 225, 130, 0.1)` | `#6ce182` |

```tsx
interface PromptDiffProps {
  title: string;  // e.g. "Trading Phase Strategy"
  removedLines: string[];  // 删除的行
  addedLines: string[];    // 新增的行
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}
```

---

## 后端 API 集成

### 使用的接口

#### 1. 优化策略 Prompt

```
POST /api/agents/strategy-wizard/optimize
```

**请求体**:
```json
{
  "userInput": "当涨幅超过50%时，你应该卖出本金"
}
```

**响应体**:
```json
{
  "phase": "trading",           // betting | trading | unknown
  "isValid": true,
  "optimizedPrompt": "# Free Trading Phase Strategy...",
  "changeSummary": "已添加涨幅50%时卖出本金的规则",
  "errorMessage": null,         // 仅当 isValid=false
  "suggestions": null           // 仅当 isValid=false
}
```

#### 2. 更新 Agent

```
PUT /api/agents/:id
```

**请求体** (根据 `phase` 字段决定更新哪个):
```json
{
  "bettingStrategyPrompt": "...",  // phase=betting
  "tradingStrategyPrompt": "..."   // phase=trading
}
```

---

## 新增 API 服务方法

**位置**: `frontend-new/src/services/api/agents.ts`

```typescript
/**
 * Optimize strategy prompt using AI
 * 使用 AI 优化策略 Prompt
 */
optimizeStrategy: async (userInput: string): Promise<OptimizeStrategyResponse> => {
  const response = await apiClient.post<OptimizeStrategyResponse>(
    "/api/agents/strategy-wizard/optimize",
    { userInput }
  );
  return response.data;
}
```

---

## 新增 Types

**位置**: `frontend-new/src/types/api.ts`

```typescript
// 策略优化阶段
export type StrategyOptimizePhase = 'betting' | 'trading' | 'unknown';

// 优化策略响应
export interface OptimizeStrategyResponse {
  phase: StrategyOptimizePhase;
  isValid: boolean;
  optimizedPrompt?: string;
  changeSummary?: string;
  errorMessage?: string;
  suggestions?: string[];
}
```

---

## 新增 Hooks

**位置**: `frontend-new/src/hooks/use-agents.ts`

```typescript
/**
 * Hook for optimizing strategy prompt
 */
export function useOptimizeStrategy() {
  return useMutation({
    mutationFn: (userInput: string) => agentApi.optimizeStrategy(userInput),
  });
}
```

---

## 页面集成

**位置**: `frontend-new/src/pages/arena.tsx`

### 变更点

1. 导入新组件
2. 添加抽屉状态
3. 修改 `AgentDashboardCard` 的回调

```diff
+ import { EvolveMeDrawer } from "@/components/agent";

export default function ArenaPage() {
+ const [isEvolveMeOpen, setIsEvolveMeOpen] = useState(false);

  return (
    <>
      {/* ... */}
      <AgentDashboardCard
        // ...
-       onEditName={() => { ... }}
+       onEvolveMe={() => setIsEvolveMeOpen(true)}
      />

+     {/* Evolve Me Drawer */}
+     {primaryAgent && agentDetail && (
+       <EvolveMeDrawer
+         isOpen={isEvolveMeOpen}
+         onClose={() => setIsEvolveMeOpen(false)}
+         agentId={primaryAgent.id}
+         currentBettingPrompt={agentDetail.bettingStrategyPrompt || ""}
+         currentTradingPrompt={agentDetail.tradingStrategyPrompt || ""}
+         onSuccess={() => {
+           refetchAgents();
+           refetchAgentDetail();
+         }}
+       />
+     )}
    </>
  );
}
```

---

## 文件清单

### 需要修改的文件

| 文件路径 | 变更类型 | 说明 |
|---------|---------|------|
| `components/arena/agent-dashboard-card.tsx` | 修改 | 替换编辑按钮为 EVOLVE ME |
| `pages/arena.tsx` | 修改 | 集成 Evolve Me Drawer |
| `services/api/agents.ts` | 修改 | 添加 optimizeStrategy 方法 |
| `types/api.ts` | 修改 | 添加 OptimizeStrategyResponse 类型 |
| `hooks/use-agents.ts` | 修改 | 添加 useOptimizeStrategy hook |

### 需要新增的文件

| 文件路径 | 说明 |
|---------|------|
| `components/agent/evolve-me-drawer.tsx` | EVOLVE ME 抽屉主组件 |
| `components/agent/prompt-diff.tsx` | Prompt 对比显示组件 |

### 导出更新

| 文件路径 | 变更 |
|---------|------|
| `components/agent/index.ts` | 导出新组件 |
| `hooks/index.ts` | 导出新 hook |

---

## 交互流程

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户操作流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 用户在 Arena 首页看到 Agent Dashboard Card                   │
│                    │                                            │
│                    ▼                                            │
│  2. 点击 "EVOLVE ME →" 按钮                                     │
│                    │                                            │
│                    ▼                                            │
│  3. 右侧滑出 EVOLVE ME 抽屉                                      │
│                    │                                            │
│                    ▼                                            │
│  4. 用户输入自然语言描述，如 "涨幅50%时卖出本金"                    │
│                    │                                            │
│                    ▼                                            │
│  5. 调用 POST /api/agents/strategy-wizard/optimize              │
│                    │                                            │
│         ┌─────────┴─────────┐                                   │
│         ▼                   ▼                                   │
│    isValid=true        isValid=false                            │
│         │                   │                                   │
│         ▼                   ▼                                   │
│  6a. 显示 Prompt Diff   6b. 显示错误和建议                        │
│      (红色删除/绿色新增)                                          │
│         │                                                       │
│         ▼                                                       │
│  7. 用户点击 "Apply for next round"                              │
│         │                                                       │
│         ▼                                                       │
│  8. 调用 PUT /api/agents/:id 更新策略                            │
│         │                                                       │
│         ▼                                                       │
│  9. 成功后关闭抽屉，刷新数据                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 注意事项

1. **Agent 状态检查**：如果 Agent 正在运行中（ACTIVE），优化的策略将在下一轮生效

2. **错误处理**：
   - 如果 AI 无法识别阶段（betting/trading），显示 `errorMessage` 和 `suggestions`
   - 网络错误时显示通用错误提示

3. **现有功能保留**：
   - My Agent 页面的编辑功能保持不变
   - 现有的 `EditAgentModal` 和 `AIPromptDrawer` 继续使用

4. **样式一致性**：
   - 遵循 EVA 设计系统的颜色和字体
   - 使用 Source Code Pro 字体
   - 主色调：绿色 `#6ce182`，紫色 `#d357e0`

---

## 后续优化建议

1. **对话历史**：保存对话记录，支持多轮优化
2. **策略预览**：在确认前显示完整的优化后策略
3. **快捷建议**：提供常用优化建议的快捷按钮
4. **Undo 功能**：支持撤销最近的策略更改
