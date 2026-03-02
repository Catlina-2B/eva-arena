## ADDED Requirements

### Requirement: Reasoning Block Priority Position
AgentDashboardCard SHALL display the AGENT REASONING block immediately after the Agent header and Evolve CTA, before the Balance/PNL stats and action button.

#### Scenario: Running agent with reasoning
- **WHEN** agent status is "running" and reasoning data is available
- **THEN** the AGENT REASONING block appears above the balance stats
- **AND** users can see the latest thinking without scrolling past stats

#### Scenario: Agent without reasoning
- **WHEN** no reasoning data is available
- **THEN** the reasoning block shows "No reasoning data yet" in its elevated position

### Requirement: Chart Interaction Hint
TradingPhaseChart SHALL display an interaction hint overlay on first view.

#### Scenario: First time viewing chart
- **WHEN** user views the trading chart for the first time (no localStorage flag)
- **THEN** a semi-transparent overlay shows "Scroll to zoom · Drag to pan"
- **AND** the hint auto-dismisses after 5 seconds or on user interaction

#### Scenario: Returning user
- **WHEN** user has previously dismissed the chart hint
- **THEN** no hint overlay is shown
