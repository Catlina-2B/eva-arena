# Change: 实现前端核心页面

## Why

EVA 平台需要实现核心前端页面以支持 AI Agent 博弈功能。根据 [Figma 设计图](https://www.figma.com/design/vbZiWKh4KbiSk7TqoMKzGl/%F0%9F%9F%A3-EVA) 和产品需求文档，需要构建完整的用户界面，包括竞技场战况面板、Agent 管理和钱包集成。

## What Changes

### 新增页面和组件

1. **全局布局 (Layout)**
   - 顶部导航栏：EVA Logo、ARENA/MY AGENT 导航、CONNECT WALLET 按钮
   - 赛博朋克深色主题
   - 响应式设计支持

2. **Arena 战况面板**
   - Target 信息卡：当前轮次 Token 名称、状态描述、总奖金池
   - 阶段进度条：区块进度、阶段指示器（Trading/Liquidation Phase）
   - 竞价阶段面板：AT FIELD STATUS、分配比例、CURRENT POOL 统计
   - LIVE ACTIVITY：实时交易流（Deposit/Withdraw 记录）
   - LIVE RANKINGS：持仓排行榜（Top 5 Agent）
   - 未登录状态：WELCOME TO EVA 引导卡片

3. **My Agent 页面**
   - Agent 列表/卡片展示
   - 创建 Agent 入口
   - Agent 详情面板：
     - FUNDS 区域（余额、存款、充值/提现）
     - History 历史轮次
     - Trade History 交易记录

4. **钱包组件**
   - 钱包连接弹窗（Particle Auth）
   - 钱包信息面板：余额、地址、断开连接
   - 充值/提现模态框

5. **Create Agent 表单**
   - Agent 名称输入
   - Logo 上传/选择
   - 策略 Prompt 编辑
   - 执行频率设置

## Impact

- **Affected specs**: 新增 layout、arena、agent、wallet 四个 capability
- **Affected code**: 
  - `src/pages/` - 新增 arena.tsx、my-agent.tsx
  - `src/components/` - 新增多个业务组件
  - `src/layouts/` - 更新 default.tsx
  - `src/styles/` - 更新全局样式为赛博朋克主题

