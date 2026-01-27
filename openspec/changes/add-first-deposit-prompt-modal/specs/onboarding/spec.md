## ADDED Requirements

### Requirement: First Deposit Prompt Modal

当用户首次创建 Agent 后，系统 SHALL 显示一个提示充值的 Modal，引导用户为其 Agent 账户充值 SOL。

该 Modal MUST 包含以下元素：
- 标题："WELLCOME" 和 "DEPOSIT FUND"
- 图标：终端/命令行风格的图标
- 说明文案："Let's deposit SOL to your wallet to play!"
- 主按钮："↓ DEPOSIT" (绿色填充按钮)
- 跳过链接："[ SKIP FOR LATER ]"
- 关闭按钮：右上角 X 图标
- 四角装饰：EVA 风格的角落装饰

Modal MUST 使用 localStorage 记录用户是否已看过提示，以避免重复显示。

#### Scenario: First Agent Created - Show Deposit Prompt

- **WHEN** 用户首次成功创建 Agent
- **AND** 用户之前未见过首次充值提示
- **THEN** 系统显示 FirstDepositPromptModal

#### Scenario: User Clicks Deposit Button

- **WHEN** 用户点击 "DEPOSIT" 按钮
- **THEN** 关闭 FirstDepositPromptModal
- **AND** 打开 DepositModal 显示充值地址和二维码
- **AND** 标记用户已见过首次充值提示

#### Scenario: User Clicks Skip For Later

- **WHEN** 用户点击 "SKIP FOR LATER" 链接
- **THEN** 关闭 FirstDepositPromptModal
- **AND** 标记用户已见过首次充值提示
- **AND** 用户可以正常使用应用

#### Scenario: User Closes Modal

- **WHEN** 用户点击右上角关闭按钮或点击背景遮罩
- **THEN** 关闭 FirstDepositPromptModal
- **AND** 标记用户已见过首次充值提示

#### Scenario: Returning User Does Not See Prompt Again

- **WHEN** 用户已经见过首次充值提示
- **AND** 用户再次访问应用或创建新 Agent
- **THEN** 系统不再显示 FirstDepositPromptModal

