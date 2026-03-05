## ADDED Requirements

### Requirement: Strategy Summary Card
Agent creation flow SHALL display a structured strategy summary card when a preset is selected, replacing the raw prompt as the primary strategy representation.

#### Scenario: Preset selected in beginner mode
- **WHEN** user selects a betting or trading strategy preset
- **THEN** a strategy summary card appears showing: risk profile, trading frequency, best conditions, weak conditions
- **AND** the full prompt textarea is collapsed by default with a "View Full Strategy" toggle

#### Scenario: AI-generated strategy
- **WHEN** user generates a strategy via AI drawer
- **THEN** the strategy summary card is hidden (no metadata available)
- **AND** the full prompt textarea is expanded

#### Scenario: Manual edit
- **WHEN** user expands and edits the prompt textarea
- **THEN** the strategy summary card remains visible but shows the originally selected preset's metadata
