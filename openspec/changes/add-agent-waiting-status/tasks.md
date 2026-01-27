## 1. 类型定义更新

- [x] 1.1 更新 `frontend-new/src/types/api.ts`
  - [x] 将 `AgentStatus` 类型从 `"ACTIVE" | "PAUSED"` 扩展为 `"ACTIVE" | "PAUSED" | "WAITING"`

- [x] 1.2 更新 `frontend-new/src/types/index.ts`
  - [x] 将 `Agent.status` 类型从 `"running" | "paused" | "stopped"` 扩展为 `"running" | "paused" | "stopped" | "waiting"`

## 2. AgentDashboardCard 组件更新

- [x] 2.1 添加沙漏图标组件 `HourglassIcon`

- [x] 2.2 更新状态逻辑
  - [x] 添加 `isWaiting` 状态判断
  - [x] 右上角 Badge：WAITING 状态显示 "PAUSED"，样式使用 warning 变体
  - [x] 按钮：WAITING 状态显示灰色背景，沙漏图标 + "WAITING NEXT ROUND"
  - [x] WAITING 状态下按钮禁用点击

## 3. arena.tsx 页面更新

- [x] 3.1 更新 AgentDashboardCard 的 status 映射
  - [x] 将 `WAITING` 状态映射为 `"waiting"`

## 4. my-agent.tsx 页面更新

- [x] 4.1 添加沙漏图标组件

- [x] 4.2 更新 AgentInfo 组件
  - [x] 添加 `isWaiting` 状态判断
  - [x] 右上角 Badge：WAITING 状态显示 "PAUSED"，使用 default 变体
  - [x] 按钮：WAITING 状态显示灰色背景，沙漏图标 + "WAITING NEXT ROUND"
  - [x] WAITING 状态下按钮禁用点击
