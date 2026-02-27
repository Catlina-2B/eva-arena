# Change: Add Guided Agent Creation Flow (Beginner / Experienced Modes)

## Why
新用户在创建 Agent 时对竞价阶段和交易阶段的规则缺乏理解，当前的单页表单直接展示策略配置字段，用户不清楚每个策略的作用场景和游戏机制，导致策略配置无从下手。需要在创建流程中融入规则教育，降低理解门槛。

## What Changes
- 在 `/create-agent` 页面入口新增模式选择界面，分为 Beginner（新手）和 Experienced Player（老手）两种路径
- **老手模式**：保持现有单页表单不变
- **新手模式**：将创建流程拆分为 3 步引导式页面
  - Step 1：名称 & 头像选择
  - Step 2：竞价阶段（Betting Phase）策略配置 + 规则说明
  - Step 3：交易阶段（Trading Phase）策略配置 + 规则说明
- 每步支持 Back/Next 导航，最终在 Step 3 提交创建
- 新增游戏规则文案常量文件，前端硬编码规则内容
- 策略预设增加简短描述字段，用于 tooltip 展示

## Impact
- Affected specs: agent-creation
- Affected code:
  - `src/pages/create-agent.tsx` - 增加模式选择和分步状态管理
  - `src/components/agent/create-agent-mode-select.tsx` - 新增模式选择组件
  - `src/components/agent/create-agent-stepper.tsx` - 新增分步引导容器
  - `src/components/agent/steps/step-name-avatar.tsx` - 新增 Step 1
  - `src/components/agent/steps/step-betting-strategy.tsx` - 新增 Step 2
  - `src/components/agent/steps/step-trading-strategy.tsx` - 新增 Step 3
  - `src/constants/game-rules.ts` - 新增游戏规则文案
  - `src/constants/strategy-presets.ts` - 增加预设描述字段
