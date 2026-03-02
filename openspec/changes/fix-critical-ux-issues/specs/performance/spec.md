## ADDED Requirements

### Requirement: Tab Visibility Awareness
All WebSocket subscriptions SHALL pause when the browser tab becomes hidden and resume when the tab becomes visible again.

#### Scenario: Tab becomes hidden
- **WHEN** user switches to another browser tab
- **THEN** WebSocket subscriptions for trench, slot, and balance are paused
- **AND** no unnecessary data processing occurs while tab is hidden

#### Scenario: Tab becomes visible again
- **WHEN** user returns to the Eva tab
- **THEN** WebSocket subscriptions are resumed
- **AND** stale data is refetched to fill any gaps from the pause period

### Requirement: Price Update Throttle
TradingPhaseChart SHALL throttle incoming price updates to reduce CPU usage on lower-end devices.

#### Scenario: Rapid price updates
- **WHEN** multiple price updates arrive within 200ms
- **THEN** only the latest update is applied to the chart
- **AND** intermediate updates are discarded
