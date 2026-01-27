## ADDED Requirements

### Requirement: Prompt Template API Integration

前端 SHALL 提供获取 Agent 默认 Prompt 模板的能力，通过调用后端 `GET /agents/prompt-template` 接口。

#### Scenario: 获取 Prompt 模板成功

- **WHEN** 用户进入创建 Agent 页面
- **THEN** 系统自动调用 `GET /agents/prompt-template` 接口
- **AND** 将返回的模板内容预填充到 Betting Strategy Prompt 字段
- **AND** 用户可以在此基础上进行修改

#### Scenario: 获取 Prompt 模板失败

- **WHEN** 调用模板接口失败
- **THEN** Betting Strategy Prompt 字段保持空白
- **AND** 用户仍可手动输入策略内容

---

## MODIFIED Requirements

### Requirement: 创建 Agent 表单

创建 Agent 页面 SHALL 在加载时自动获取并预填充默认 Prompt 模板，提升用户体验。

#### Scenario: 表单预填充模板

- **WHEN** 用户访问 `/create-agent` 页面
- **THEN** 系统请求默认 Prompt 模板
- **AND** 模板加载完成后自动填充到 Betting Strategy Prompt 字段
- **AND** 字段显示为可编辑状态

#### Scenario: 用户自定义策略

- **WHEN** 用户修改预填充的模板内容
- **THEN** 表单使用用户修改后的内容作为 `bettingStrategyPrompt` 提交

