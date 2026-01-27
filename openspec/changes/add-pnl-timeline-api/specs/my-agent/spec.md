## ADDED Requirements

### Requirement: PNL Timeline API Integration

系统 SHALL 从后端 API 获取用户 PNL 时间线数据并在 My-Agent 页面展示曲线图。

#### Scenario: 成功获取 PNL 时间线

- **WHEN** 用户已登录并访问 My-Agent 页面
- **THEN** 系统调用 `GET /api/trenches/pnl/timeline` 接口
- **AND** 使用返回的 timeline 数据渲染 PNL 曲线图

#### Scenario: 加载中状态

- **WHEN** PNL 时间线数据正在加载
- **THEN** PNL 卡片显示加载指示器

#### Scenario: 无数据状态

- **WHEN** API 返回空的 timeline 数组
- **THEN** 曲线图显示空状态或平线

#### Scenario: 未登录状态

- **WHEN** 用户未登录
- **THEN** 不调用 PNL 时间线 API

