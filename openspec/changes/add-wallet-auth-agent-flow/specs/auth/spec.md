## ADDED Requirements

### Requirement: 钱包签名登录
系统 SHALL 在用户连接钱包后自动触发签名登录流程，使用标准 SIWS 消息格式。

#### Scenario: 用户首次连接钱包
- **WHEN** 用户通过 Particle Connect 连接钱包
- **AND** 用户当前未登录（无有效 token）
- **THEN** 系统生成标准 SIWS 消息（包含 domain、address、nonce、issuedAt 等字段）
- **AND** 系统请求钱包签名该 SIWS 消息
- **AND** 用户批准签名后调用后端登录 API
- **AND** 登录成功后存储 accessToken 和 refreshToken

#### Scenario: 用户拒绝签名
- **WHEN** 用户拒绝钱包签名请求
- **THEN** 系统显示错误提示 "Signature required to login"
- **AND** 提供重新签名的选项

#### Scenario: 用户已有有效登录
- **WHEN** 用户连接钱包
- **AND** Auth Store 中存在有效 token
- **AND** token 对应的 publicKey 与当前钱包地址一致
- **THEN** 系统跳过签名登录流程

### Requirement: 登录后 Agent 检查
系统 SHALL 在用户登录成功后自动检查是否拥有 Agent。

#### Scenario: 用户有 Agent
- **WHEN** 用户登录成功
- **AND** 调用 GET /api/agents 返回非空 agents 数组
- **THEN** 用户保持在当前页面

#### Scenario: 用户无 Agent
- **WHEN** 用户登录成功
- **AND** 调用 GET /api/agents 返回空 agents 数组
- **THEN** 系统自动跳转到 `/create-agent` 页面

### Requirement: 钱包断开登出
系统 SHALL 在钱包断开连接时清理登录状态。

#### Scenario: 用户断开钱包
- **WHEN** 用户断开钱包连接
- **THEN** 系统清除 Auth Store 中的所有认证信息
- **AND** 清除 React Query 缓存中的用户数据

### Requirement: Token 自动刷新
系统 SHALL 在 accessToken 过期时自动刷新。

#### Scenario: AccessToken 过期
- **WHEN** API 请求返回 401 Unauthorized
- **AND** Auth Store 中存在有效 refreshToken
- **THEN** 系统调用 POST /api/auth/refresh 刷新 token
- **AND** 使用新 token 重试原请求

#### Scenario: RefreshToken 过期
- **WHEN** 刷新 token 请求返回 401 Unauthorized
- **THEN** 系统清除登录状态
- **AND** 提示用户重新连接钱包登录

## ADDED Requirements

### Requirement: Agent Logo 选择
创建 Agent 页面 SHALL 使用后端提供的 Logo 列表。

#### Scenario: 加载 Logo 列表
- **WHEN** 用户访问 `/create-agent` 页面
- **THEN** 系统调用 GET /api/agents/logos 获取 Logo 列表
- **AND** 按 mecha 和 pilot 分类显示 Logo 图片

#### Scenario: 选择 Logo
- **WHEN** 用户点击某个 Logo 图片
- **THEN** 该 Logo 被选中并高亮显示
- **AND** 左侧预览区域显示选中的 Logo 大图

### Requirement: 创建 Agent 表单提交
系统 SHALL 调用后端 API 创建 Agent。

#### Scenario: 提交创建 Agent 表单
- **WHEN** 用户填写完 Agent 信息并点击 "Create Agent" 按钮
- **THEN** 系统调用 POST /api/agents 创建 Agent
- **AND** 创建成功后跳转到 `/my-agent` 页面

#### Scenario: 创建失败
- **WHEN** 创建 Agent API 返回错误
- **THEN** 系统显示错误信息
- **AND** 用户可以修改信息后重新提交

