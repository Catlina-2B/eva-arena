## ADDED Requirements

### Requirement: AI Prompt Generation Drawer
系统 SHALL 提供一个聊天式的 AI Prompt 生成抽屉组件，帮助用户通过引导式问答生成策略 Prompt。

#### Scenario: 打开 AI Prompt 抽屉
- **WHEN** 用户在 Create Agent 页面点击 "AI-GENERATED" 按钮
- **THEN** 系统在页面右侧打开一个抽屉
- **AND** 抽屉标题显示 "/// AI PROMPT"
- **AND** 显示第一个问题（根据是 Betting 还是 Trading 策略）

#### Scenario: 显示问题与选项
- **WHEN** 抽屉打开并加载配置
- **THEN** AI 消息以聊天气泡形式显示在左侧
- **AND** 问题下方显示可选项按钮
- **AND** 用户点击选项后，选项显示为已选状态（绿色高亮）
- **AND** 用户的选择以消息形式显示在右侧

#### Scenario: 生成策略 Prompt
- **WHEN** 用户完成所有必填问题的选择
- **THEN** 显示 "Generate Strategy" 按钮
- **WHEN** 用户点击 "Generate Strategy"
- **THEN** 系统调用后端 API 生成策略
- **AND** 显示加载状态
- **THEN** 生成完成后显示参数摘要卡片
- **AND** 摘要卡片包含各参数的值

#### Scenario: 确认或重试生成结果
- **WHEN** 策略生成完成
- **THEN** 显示 "Retry" 和 "Confirm" 按钮
- **WHEN** 用户点击 "Retry"
- **THEN** 重置问答流程，用户可重新选择
- **WHEN** 用户点击 "Confirm"
- **THEN** 将生成的 Prompt 填充到对应的策略输入框
- **AND** 关闭抽屉

#### Scenario: 自定义输入
- **WHEN** 某个问题选项包含 "Custom" 或需要自由输入
- **AND** 用户选择该选项
- **THEN** 底部输入框变为可用
- **AND** 用户可输入自定义值
- **AND** 按回车或发送按钮提交

