## ADDED Requirements

### Requirement: User Transaction History Hook

前端系统 SHALL 提供 `useUserTransactions` hook，用于获取指定 trench 中当前登录用户的交易记录。

该 hook 必须:
- 调用 `/api/trenches/:trenchId/transactions` 接口
- 支持传入 `userAddress` 参数过滤用户交易
- 支持分页参数 (`page`, `limit`)
- 支持交易类型过滤 (`txType`)

#### Scenario: 获取用户在指定 trench 的交易记录

- **WHEN** 用户已登录并展开某个 round 的 history
- **THEN** 系统调用 trench transactions 接口，传入用户的 wallet address
- **AND** 返回该用户在该 trench 的交易记录列表

## MODIFIED Requirements

### Requirement: My Agent History Display

My Agent 页面的 History 部分 SHALL 展示当前登录用户的交易记录而非 agent 的交易记录。

交易记录必须:
- 通过 trench transactions 接口获取
- 使用当前登录用户的 wallet address 进行过滤
- 按 trench/round 分组显示

#### Scenario: 用户查看自己的交易历史

- **WHEN** 用户在 My Agent 页面展开某个 round
- **THEN** 系统使用 `useUserTransactions` hook 获取用户的交易记录
- **AND** 传入当前 trenchId 和用户的 wallet address
- **AND** 在 Trade History 表格中展示交易列表

