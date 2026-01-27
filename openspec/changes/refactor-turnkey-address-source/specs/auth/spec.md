## ADDED Requirements

### Requirement: User Profile with Turnkey Address

用户登录后，系统 SHALL 通过 `/api/auth/me` 接口获取用户完整信息，包括 `turnkeyAddress`。

用户信息 SHALL 包含以下字段：
- `id`: 用户唯一标识
- `publicKey`: 用户钱包公钥
- `turnkeyAddress`: Turnkey 托管钱包地址（可选，首次登录时自动创建）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

#### Scenario: 登录后获取用户信息成功

- **WHEN** 用户成功登录（获取到 accessToken）
- **THEN** 系统自动调用 `/api/auth/me` 获取用户信息
- **AND** 用户信息（包含 turnkeyAddress）存储到 auth store

#### Scenario: 刷新 token 后更新用户信息

- **WHEN** 用户 token 刷新成功
- **THEN** 返回的用户信息（包含 turnkeyAddress）更新到 auth store

#### Scenario: 获取 Turnkey 地址用于余额订阅

- **WHEN** 需要订阅 Turnkey 钱包余额
- **THEN** 系统从 auth store 获取 `turnkeyAddress`（而非从 Agent API）
- **AND** 如果 `turnkeyAddress` 存在，则启动余额订阅

### Requirement: Auth Store Turnkey Address Access

Auth store SHALL 提供 `turnkeyAddress` 的便捷访问方式。

#### Scenario: 组件访问 Turnkey 地址

- **WHEN** 组件需要获取用户的 Turnkey 地址
- **THEN** 组件可以通过 `useAuthStore` 获取 `user.turnkeyAddress`
- **AND** 不再需要依赖 Agent API 的数据

