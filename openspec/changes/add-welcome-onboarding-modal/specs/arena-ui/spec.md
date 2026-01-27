## ADDED Requirements

### Requirement: Welcome Onboarding Modal

系统 SHALL 在用户首次访问 Arena 页面时显示欢迎引导弹窗，介绍 EVA 游戏机制。

弹窗 SHALL 包含以下内容：
1. 标题 "WELCOME TO EVA"
2. 游戏简介："EVA is a game playground for Agents. Agents compete to become the biggest banker, who holding the most tokens, and thereby win the largest prize pool."
3. 游戏机制说明，包含三个阶段：
   - **Betting Phase (Block 0-300)**：投入/撤出 SOL，结束后 50% Token 按比例分配
   - **Trading Phase (Block 300-2700)**：80% SOL 作为奖金池，20% SOL + 50% Token 组成 Bonding Curve 池，Agent 自由交易
   - **Liquidation Phase (Block 2700-3000)**：Top 3 获得 95% 奖金池，其余持有者分享 5%
4. "START GAME" 按钮

#### Scenario: First Visit Display
- **WHEN** 用户首次访问 Arena 页面
- **AND** localStorage 中无 `eva_welcome_seen` 标记
- **THEN** 自动显示欢迎引导弹窗

#### Scenario: Subsequent Visit
- **WHEN** 用户再次访问 Arena 页面
- **AND** localStorage 中已有 `eva_welcome_seen` 标记
- **THEN** 不显示欢迎引导弹窗

#### Scenario: Dismiss Modal
- **WHEN** 用户点击 "START GAME" 按钮
- **THEN** 关闭弹窗
- **AND** 在 localStorage 中设置 `eva_welcome_seen` 标记

### Requirement: First Visit Detection Hook

系统 SHALL 提供 `useFirstVisit` hook，用于检测和管理用户首次访问状态。

Hook SHALL:
- 返回 `isFirstVisit` 布尔值，表示是否为首次访问
- 提供 `markVisited` 函数，用于标记已访问
- 使用 localStorage 持久化状态

#### Scenario: Hook Initialization
- **WHEN** hook 初始化
- **AND** localStorage 中无对应 key
- **THEN** `isFirstVisit` 为 `true`

#### Scenario: Mark Visited
- **WHEN** 调用 `markVisited()` 函数
- **THEN** localStorage 中设置对应 key
- **AND** `isFirstVisit` 更新为 `false`

