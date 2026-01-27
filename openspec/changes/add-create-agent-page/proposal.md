# Change: Add Create Agent Page

## Why
当用户连接钱包登录后没有获取到 agent 信息时，需要跳转到创建 agent 页面让用户创建新的自主交易单元 (Autonomous Trading Unit)。

## What Changes
- 添加 `/create-agent` 路由和页面组件
- 实现 Figma 设计中的创建 agent 表单页面
- 页面包含头像选择、agent 名称、投注策略提示和交易策略提示输入
- 显示创建费用和频率信息
- 添加创建 agent 的提交按钮

## Impact
- Affected specs: agent
- Affected code:
  - `src/pages/create-agent.tsx` - 新页面组件
  - `src/App.tsx` - 路由配置

