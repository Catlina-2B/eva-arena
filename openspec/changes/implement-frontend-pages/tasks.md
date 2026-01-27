# Implementation Tasks

## 1. 基础设施

- [ ] 1.1 更新全局样式为赛博朋克深色主题（`globals.css`）
- [ ] 1.2 配置设计系统颜色变量和字体
- [ ] 1.3 创建通用 UI 组件（Card、Badge、ProgressBar、Modal）

## 2. 全局布局

- [ ] 2.1 重构 Navbar 组件（EVA Logo、导航链接、CONNECT WALLET 按钮）
- [ ] 2.2 更新 DefaultLayout 布局结构
- [ ] 2.3 实现响应式导航菜单

## 3. Arena 页面

- [ ] 3.1 创建 Arena 页面路由 (`/arena` 或 `/`)
- [ ] 3.2 实现 TargetInfoCard 组件（Token 名称、状态、奖金池）
- [ ] 3.3 实现 PhaseProgressBar 组件（区块进度、阶段指示）
- [ ] 3.4 实现 PreMarketBetting 面板组件
  - [ ] 3.4.1 AT FIELD STATUS 状态区域
  - [ ] 3.4.2 分配比例显示（TOKEN ALLOC、LP ALLOC、PRIZE FUND）
  - [ ] 3.4.3 CURRENT POOL 统计卡片
- [ ] 3.5 实现 LiveActivity 组件（实时交易流）
- [ ] 3.6 实现 LiveRankings 组件（Agent 排行榜）
- [ ] 3.7 实现 WelcomeCard 组件（未登录状态引导）
- [ ] 3.8 整合 Arena 页面布局（左右两栏）

## 4. My Agent 页面

- [ ] 4.1 创建 My Agent 页面路由 (`/my-agent`)
- [ ] 4.2 实现 AgentCard 组件（Agent 头像、名称、创建时间）
- [ ] 4.3 实现 CreateAgentEntry 组件（创建入口按钮）
- [ ] 4.4 实现 AgentFunds 面板
  - [ ] 4.4.1 余额显示
  - [ ] 4.4.2 存款/提款按钮
- [ ] 4.5 实现 AgentHistory 组件（历史轮次列表）
- [ ] 4.6 实现 TradeHistory 组件（交易记录表格）
- [ ] 4.7 整合 My Agent 页面布局

## 5. 钱包集成

- [ ] 5.1 集成 Particle Auth SDK
- [ ] 5.2 实现 ConnectWalletButton 组件
- [ ] 5.3 实现 WalletModal 组件（余额、地址、断开连接）
- [ ] 5.4 实现 DepositModal 组件
- [ ] 5.5 实现 WithdrawModal 组件
- [ ] 5.6 创建钱包状态管理（Context/Store）

## 6. Create Agent 功能

- [ ] 6.1 实现 CreateAgentModal 组件
  - [ ] 6.1.1 Agent 名称输入
  - [ ] 6.1.2 Logo 上传/选择
  - [ ] 6.1.3 策略 Prompt 编辑器
  - [ ] 6.1.4 执行频率设置
- [ ] 6.2 表单验证逻辑
- [ ] 6.3 创建 Agent API 集成（Mock 数据先行）

## 7. 状态管理与数据

- [ ] 7.1 创建 Arena 状态管理（当前轮次、阶段、排名）
- [ ] 7.2 创建 Agent 状态管理（用户 Agent 列表）
- [ ] 7.3 实现 Mock 数据服务（开发阶段使用）
- [ ] 7.4 WebSocket 连接预留（实时数据更新）

## Dependencies

- Task 3.x 依赖 Task 1.x 和 2.x 完成
- Task 4.x 依赖 Task 1.x 和 2.x 完成
- Task 5.x 可并行进行
- Task 6.x 依赖 Task 5.x（需要钱包连接）
- Task 7.x 可贯穿各阶段逐步完成

