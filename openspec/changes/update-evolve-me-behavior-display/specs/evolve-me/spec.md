## ADDED Requirements

### Requirement: Behavior Change Visualization
The system SHALL display a structured behavior change summary when the strategy optimization API returns `behaviorChangeSummary`. The summary MUST include a list of parameter changes (parameter name, before value, after value, impact description), an overall impact statement, and an optional risk note.

#### Scenario: Optimization returns behaviorChangeSummary
- **WHEN** the user submits strategy feedback and the backend returns a valid optimization with `behaviorChangeSummary`
- **THEN** the drawer SHALL render a `BehaviorChangeCard` above the `PromptDiff` showing each change item in a before/after format, the overall impact, and any risk note

#### Scenario: Optimization returns without behaviorChangeSummary
- **WHEN** the backend returns a valid optimization without `behaviorChangeSummary`
- **THEN** the drawer SHALL render only the `PromptDiff` as before, without a `BehaviorChangeCard`

### Requirement: Pending Strategy Update Badge
The system SHALL display a visual badge on the Agent Dashboard Card when a strategy update has been applied but not yet active. The badge MUST communicate that the strategy update is pending and will take effect in the next round.

#### Scenario: User applies strategy update
- **WHEN** the user clicks "Apply for next round" and the update succeeds
- **THEN** the `AgentDashboardCard` SHALL show a pending badge with text "Strategy update pending - active next round" in the Teach Me CTA area

#### Scenario: No pending strategy update
- **WHEN** `hasPendingStrategyUpdate` is false or not provided
- **THEN** no pending badge SHALL be displayed

## MODIFIED Requirements

### Requirement: Evolve Me Drawer Data Flow
The Evolve Me drawer SHALL pass `behaviorChangeSummary` from the optimize API response through to the message bubble rendering pipeline. The `UIMessage.optimizeResult` type SHALL include an optional `behaviorChangeSummary` field. The `handleApply` function SHALL invoke an `onApplySuccess` callback upon successful strategy application.

#### Scenario: Data flows from API to UI
- **WHEN** the optimize API responds with `behaviorChangeSummary`
- **THEN** the field SHALL be stored in the corresponding `UIMessage.optimizeResult` and made available to `MessageBubble` for rendering
