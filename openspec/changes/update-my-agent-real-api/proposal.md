# Change: My Agent 页面接入真实 API 数据

## Why
My Agent 页面当前使用 `USE_REAL_DATA` feature flag 来切换 mock 数据和真实 API。需要移除 mock 数据逻辑，完全使用后端真实 API，并确保所有功能正常工作。

## What Changes
- 移除 `USE_REAL_DATA` feature flag 和相关条件判断
- 移除 mock 数据导入和使用
- 完善 Agent 信息展示（使用真实 API 返回的数据）
- 完善 Agent Panel 数据展示（余额、充值、提现、PnL）
- 完善 Agent Trenches 历史记录展示
- 完善 Trade History 表格，使用真实交易数据
- 实现 Agent 状态切换功能（启动/暂停）
- 实现充值/提现功能入口

## Impact
- Affected specs: my-agent
- Affected code:
  - `src/pages/my-agent.tsx` - 主页面重构
  - `src/hooks/use-agents.ts` - 可能需要新增 hooks
  - `src/types/api.ts` - 可能需要补充类型

## Backend APIs Used
| API | 说明 |
|-----|------|
| `GET /api/agents` | 获取用户 Agent 列表 |
| `GET /api/agents/:id/panel` | 获取 Agent 面板数据（余额、PnL 等） |
| `GET /api/agents/:id/trenches` | 获取 Agent 参与的 Trench 历史 |
| `GET /api/agents/:id/trenches/:trenchId` | 获取单个 Trench 详情（含交易记录） |
| `GET /api/agents/:id/transactions` | 获取 Agent 交易记录 |
| `PATCH /api/agents/:id/toggle` | 切换 Agent 状态 |
| `POST /api/agents/:id/deposit` | 记录充值 |
| `POST /api/agents/:id/withdraw` | 请求提现 |

