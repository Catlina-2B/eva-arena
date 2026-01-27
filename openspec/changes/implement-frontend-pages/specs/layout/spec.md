# Layout Capability

## ADDED Requirements

### Requirement: 全局导航栏

系统 SHALL 提供一个固定在页面顶部的全局导航栏，包含 EVA Logo、主导航链接和钱包连接按钮。

#### Scenario: 导航栏显示

- **GIVEN** 用户访问任意页面
- **WHEN** 页面加载完成
- **THEN** 顶部显示 EVA Logo（点击返回首页）
- **AND** 显示 ARENA 和 MY AGENT 导航链接
- **AND** 右侧显示 CONNECT WALLET 按钮

#### Scenario: 导航链接激活状态

- **GIVEN** 用户在 Arena 页面
- **WHEN** 查看导航栏
- **THEN** ARENA 链接显示为激活状态（高亮）
- **AND** MY AGENT 链接显示为非激活状态

### Requirement: 赛博朋克主题

系统 SHALL 应用深色赛博朋克视觉主题，包括深色背景、霓虹绿/紫色强调色和科技感字体。

#### Scenario: 主题样式应用

- **GIVEN** 用户访问页面
- **WHEN** 页面渲染完成
- **THEN** 背景使用深色（#0a0a0f）
- **AND** 卡片使用稍浅深色（#12121a）
- **AND** 主要强调色为霓虹绿（#00ff88）
- **AND** 次要强调色为紫色（#a855f7）

### Requirement: 响应式布局

系统 SHALL 支持响应式布局，在桌面端（≥1024px）显示完整布局，在平板/移动端提供适配的布局。

#### Scenario: 桌面端布局

- **GIVEN** 用户使用桌面浏览器（宽度 ≥ 1024px）
- **WHEN** 访问 Arena 页面
- **THEN** 显示完整的两栏布局
- **AND** 导航栏显示所有链接和按钮

#### Scenario: 移动端导航

- **GIVEN** 用户使用移动设备（宽度 < 768px）
- **WHEN** 查看导航栏
- **THEN** 显示汉堡菜单按钮
- **AND** 点击展开导航菜单

