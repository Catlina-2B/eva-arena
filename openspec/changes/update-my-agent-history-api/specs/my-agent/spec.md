## MODIFIED Requirements

### Requirement: History 模块数据获取

My Agent 页面的 History 模块 SHALL 从 `GET /api/trenches/history` 接口获取用户的 Trench 参与历史记录。

展开某一轮 Trench 时，SHALL 从 `GET /api/trenches/:trenchId/transactions` 接口获取该轮的交易记录，并通过 `userAddress` 参数过滤当前用户的交易。

#### Scenario: 获取用户 Trench 历史

- **WHEN** 用户访问 My Agent 页面
- **THEN** 系统调用 `GET /api/trenches/history` 获取该用户的 Trench 参与历史
- **AND** 历史列表按时间倒序显示每一轮的参与信息

#### Scenario: 展开 Trench 查看交易记录

- **WHEN** 用户点击展开某一轮 Trench
- **THEN** 系统调用 `GET /api/trenches/:trenchId/transactions` 并传递 `userAddress` 参数
- **AND** 显示该用户在该轮的所有交易记录（BUY, SELL, DEPOSIT, WITHDRAW, CLAIM）

## ADDED Requirements

### Requirement: TrenchHistory API 类型定义

前端 SHALL 定义 `TrenchHistoryItemDto` 类型，包含以下字段：
- `id: number` - 参与记录 ID
- `trenchId: number` - Trench 数据库 ID
- `trenchStatus: TrenchStatus` - Trench 状态
- `tokenSymbol: string | null` - Token 符号
- `userAddress: string` - 用户地址 (turnkey 地址)
- `depositedSol: string` - 存入 SOL (lamports)
- `totalWithdrawnSol: string` - 提现 SOL (lamports)
- `tokenBalance: string` - 持有代币数量
- `totalBuySol: string` - 总买入 SOL
- `totalSellSol: string` - 总卖出 SOL
- `pnlSol: string` - 盈亏 SOL
- `rank: number | null` - 排名
- `prizeAmount: string` - 奖励金额 (lamports)
- `isPrizeSettled: boolean` - 奖励是否已结算
- `trenchStartTime: string | null` - Trench 开始时间
- `trenchEndTime: string | null` - Trench 结束时间
- `createdAt: string` - 参与创建时间

前端 SHALL 定义 `TrenchHistoryResponseDto` 类型：
- `history: TrenchHistoryItemDto[]` - 历史列表
- `total: number` - 总数
- `page: number` - 当前页
- `limit: number` - 每页数量

#### Scenario: 类型与后端一致

- **WHEN** 后端返回 Trench History 响应
- **THEN** 前端类型能够正确解析并使用响应数据

### Requirement: useTrenchHistory Hook

前端 SHALL 提供 `useTrenchHistory` hook 用于获取用户 Trench 参与历史：
- 调用 `GET /api/trenches/history`
- 支持分页参数 `page` 和 `limit`
- 仅在用户已登录时启用查询
- 返回 `TrenchHistoryResponseDto`

#### Scenario: Hook 正确调用 API

- **WHEN** `useTrenchHistory` hook 被调用
- **THEN** 发起 `GET /api/trenches/history` 请求
- **AND** 返回格式化后的历史数据

