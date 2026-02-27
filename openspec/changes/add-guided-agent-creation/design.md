## Context

当前 Agent 创建页面 (`src/pages/create-agent.tsx`) 是一个 ~710 行的单页面组件，包含所有表单逻辑、头像选择、策略配置等。需要在不破坏现有老手模式功能的前提下，增加新手引导式创建流程。

## Goals / Non-Goals

- Goals:
  - 新手模式分步引导，每步融入对应阶段的规则教育
  - 老手模式保持现有体验完全不变
  - 组件合理拆分，避免单文件过大
  - 数据在步骤间和模式间保持一致

- Non-Goals:
  - 不涉及后端 API 变更（CreateAgentDto 结构不变）
  - 不引入新的路由（保持 `/create-agent` 单路由）
  - 不持久化模式选择偏好
  - 不实现 MBTI 测试功能

## Decisions

### 路由策略：单路由 + 前端状态切换
- **Decision**: 保持 `/create-agent` 单路由，通过组件内状态 (`mode` + `step`) 控制展示内容
- **Alternatives considered**:
  - 多路由方案 (`/create-agent/beginner/step-1`) — 增加路由复杂度，且用户刷新页面时需要额外处理状态恢复，收益不大
- **Rationale**: 创建流程是一次性的（创建后不再访问），单路由 + 状态切换最简洁

### 状态管理：父组件提升
- **Decision**: 将所有表单状态（name, avatar, bettingStrategy, tradingStrategy）保留在 `CreateAgentPage` 父组件中，通过 props 传递给子步骤组件
- **Alternatives considered**:
  - React Context — 对于 4 个字段过度设计
  - Zustand store — 无跨页面需求，不需要全局状态
- **Rationale**: 状态量小且生命周期仅限当前页面，props drilling 在 1-2 层时完全可接受

### 组件拆分策略
- **Decision**: 从现有 `create-agent.tsx` 中提取可复用的子组件（AvatarGrid, NameInput, StrategySection），新手模式和老手模式共享这些子组件
- **Rationale**: 避免代码重复，保持两种模式的 UI 一致性

### 规则内容管理
- **Decision**: 规则文案硬编码在 `src/constants/game-rules.ts`，结构化为对象便于组件消费
- **Rationale**: 当前阶段规则内容稳定，无需后端接口；如果后续区块参数变化，只需修改常量文件

## Risks / Trade-offs

- **Risk**: 现有 `create-agent.tsx` 重构范围较大 → 通过保持老手模式渲染逻辑不变来降低风险，仅在外层增加模式切换
- **Risk**: 新手流程步骤过多导致用户流失 → 3 步是合理的分组（身份、竞价、交易），每步都有明确的目的和进度提示

## Open Questions

- 规则说明区域的视觉设计（是否需要 Figma 出图还是开发自行设计）
