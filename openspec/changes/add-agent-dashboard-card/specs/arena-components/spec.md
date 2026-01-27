## ADDED Requirements

### Requirement: Agent Dashboard Card
The system SHALL display an AgentDashboardCard component when the user's wallet is connected and they have an existing agent.

#### Scenario: Display agent dashboard when connected with agent
- **WHEN** user has connected their wallet
- **AND** user has an existing agent
- **THEN** the AgentDashboardCard SHALL be displayed in the right column of the arena page
- **AND** it SHALL replace the WelcomeCard or CreateAgentCard

#### Scenario: Show agent header information
- **WHEN** AgentDashboardCard is displayed
- **THEN** it SHALL show the agent's avatar (or default geometric avatar)
- **AND** it SHALL show the agent's name with an edit button
- **AND** it SHALL show the agent's status badge (RUNNING, PAUSED, or STOPPED)

#### Scenario: Display balance statistics
- **WHEN** AgentDashboardCard is displayed
- **THEN** it SHALL show TOKEN BAL with the token balance and percentage change
- **AND** it SHALL show SOL BAL with the SOL balance
- **AND** positive changes SHALL be displayed in green (eva-primary)
- **AND** negative changes SHALL be displayed in red (eva-danger)

#### Scenario: Display PNL statistics
- **WHEN** AgentDashboardCard is displayed
- **THEN** it SHALL show TOTAL PNL with value and SOL suffix
- **AND** it SHALL show ROUND PNL with value and SOL suffix
- **AND** positive PNL SHALL be displayed in green
- **AND** negative PNL SHALL be displayed in red

#### Scenario: System control button
- **WHEN** agent status is PAUSED
- **THEN** the button SHALL display "START SYSTEM" with play icon
- **AND** the button SHALL use secondary (purple) variant
- **WHEN** agent status is RUNNING
- **THEN** the button SHALL display "PAUSE SYSTEM" with pause icon
- **AND** the button SHALL use outline variant

#### Scenario: Display execution logs
- **WHEN** AgentDashboardCard is displayed
- **THEN** it SHALL show an EXECUTION LOGS section
- **AND** each log entry SHALL display agent ID, phase badge, action, and amount
- **AND** phase badges SHALL be color-coded:
  - Betting Phase: purple (secondary)
  - Trading Phase: green (primary)
  - Liquidation: red (danger)

### Requirement: Execution Log Entry Type
The system SHALL define an ExecutionLogEntry type for execution log data.

#### Scenario: ExecutionLogEntry structure
- **WHEN** execution log data is used
- **THEN** each entry SHALL have:
  - id: unique identifier
  - agentId: the agent's identifier
  - phase: one of "Betting Phase", "Trading Phase", or "Liquidation"
  - action: the action performed (e.g., "Deposit", "Withdraw", "Buy", "Sell", "Reward")
  - amount: the SOL amount involved

