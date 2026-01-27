## 1. API 层与类型定义

- [x] 1.1 在 `src/types/api.ts` 添加 ThinkReason 相关类型定义
  - `ThinkReasonDto`：单条思考记录
  - `ThinkReasonListResponseDto`：列表响应
  - `ThinkReasonQueryDto`：查询参数

- [x] 1.2 在 `src/services/api/agents.ts` 添加 `getThinkReasons` API 方法
  - 调用 `GET /agents/think-reasons`
  - 支持 trenchId 过滤和分页参数

## 2. Hook 层

- [x] 2.1 创建 `src/hooks/use-think-reasons.ts`
  - 封装 `useQuery` 调用 `getThinkReasons`
  - 支持轮询（可选）
  - 支持无限滚动分页

- [x] 2.2 在 `src/hooks/index.ts` 导出新 Hook

## 3. AgentDashboardCard 思考状态行

- [x] 3.1 修改 `src/components/arena/agent-dashboard-card.tsx`
  - 在 EXECUTION LOGS 标题下方添加"最新思考"状态行
  - 调用 `useLatestThinkReason` 获取最新一条记录
  - 显示状态指示器（ACTION 绿色、INACTION 灰色）
  - 显示简要内容摘要（截断到一行）
  - 添加灯泡图标按钮，点击打开 ReasoningModal

- [x] 3.2 集成 ReasoningModal
  - 复用现有 `ReasoningModal` 组件
  - 将 ThinkReasonDto 转换为 ActivityItem 格式

## 4. 浮动思考按钮组件

- [x] 4.1 创建 `src/components/arena/floating-think-button.tsx`
  - 固定定位浮动按钮，初始位置在右侧边缘中间
  - 使用灯泡图标
  - 仅在大屏幕（`lg` 及以上）显示
  - 实现拖拽功能
  - 实现左右吸附逻辑
  - 保存位置到 localStorage
  - 点击时触发 `onToggle` 回调

- [x] 4.2 添加按钮样式
  - EVA 风格：深色背景、霓虹边框
  - 悬停效果：发光增强
  - 拖拽状态：视觉反馈

## 5. 思考列表面板组件

- [x] 5.1 创建 `src/components/arena/think-list-panel.tsx`
  - 浮动面板，根据按钮吸附位置显示在按钮左侧或右侧
  - 列表展示思考历史
  - 每条记录显示时间、Eva-{trenchId}、状态徽章、内容摘要
  - 点击记录打开 ReasoningModal 查看完整内容
  - 支持无限滚动加载更多
  - 点击面板外部关闭面板

- [x] 5.2 添加面板样式
  - EVA 风格卡片
  - 最大高度 60vh，内部滚动
  - 宽度 360px

## 6. 页面集成

- [x] 6.1 在 `src/pages/arena.tsx` 集成浮动按钮
  - 在认证且有 Agent 的情况下渲染 `FloatingThinkButton`
  - 管理面板打开/关闭状态
  - 传递必要的 props

- [x] 6.2 在 `src/components/arena/index.ts` 导出新组件

## 7. 测试与优化

- [ ] 7.1 测试拖拽交互在不同屏幕尺寸下的表现
- [ ] 7.2 测试面板位置计算逻辑
- [ ] 7.3 测试 API 分页加载
- [ ] 7.4 确保响应式设计正确（小屏幕隐藏浮动按钮）
