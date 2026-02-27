## ADDED Requirements

### Requirement: Creation Mode Selection
The system SHALL present a mode selection screen when a user navigates to the agent creation page. The screen SHALL offer two options: "Beginner" and "Experienced Player". Selecting a mode SHALL transition the user to the corresponding creation flow without changing the URL route.

#### Scenario: User selects Beginner mode
- **WHEN** user clicks the "Beginner" card
- **THEN** the system displays the Step 1 (Name & Avatar) screen of the guided creation flow
- **AND** a step progress indicator shows "Step 1 of 3"

#### Scenario: User selects Experienced Player mode
- **WHEN** user clicks the "Experienced Player" card
- **THEN** the system displays the existing single-page creation form with all fields visible

### Requirement: Beginner Mode Step Navigation
The system SHALL provide a multi-step guided creation flow for beginner users consisting of 3 steps. Each step SHALL display Back and Next navigation buttons. The Back button on Step 1 SHALL return to mode selection. The Next button SHALL validate required fields before advancing.

#### Scenario: User navigates forward through steps
- **WHEN** user completes Step 1 (name and avatar selected) and clicks "Next"
- **THEN** the system advances to Step 2 (Betting Strategy)
- **AND** the step progress indicator updates to "Step 2 of 3"

#### Scenario: User navigates backward
- **WHEN** user is on Step 2 and clicks "Back"
- **THEN** the system returns to Step 1 with previously entered data preserved

#### Scenario: User returns to mode selection
- **WHEN** user is on Step 1 and clicks "Back"
- **THEN** the system returns to the mode selection screen

### Requirement: Beginner Step 1 - Name and Avatar
The system SHALL present a dedicated step for selecting an avatar and entering an agent name. This step SHALL reuse the existing avatar grid (with custom upload support) and name input field. The "Next" button SHALL be disabled until both a name and an avatar are provided.

#### Scenario: User configures name and avatar
- **WHEN** user selects an avatar and enters an agent name
- **THEN** the "Next" button becomes enabled
- **AND** user can proceed to Step 2

### Requirement: Beginner Step 2 - Betting Strategy with Rules
The system SHALL present a two-column layout for betting strategy configuration. The left column SHALL display betting phase rules and mechanics (phase duration, allowed/forbidden actions, token distribution rules, prize pool formation). The right column SHALL provide strategy preset buttons, AI-Generated button, and strategy text area. Each preset button SHALL show a tooltip with a brief strategy description.

#### Scenario: User views betting phase rules
- **WHEN** Step 2 is displayed
- **THEN** the left column shows betting phase rules including: phase duration (Block 0–150, ~1 min), allowed actions (deposit/withdraw SOL), forbidden actions (no token trading), and distribution rule (50% tokens allocated proportionally after betting ends)

#### Scenario: User selects a betting preset with tooltip
- **WHEN** user hovers over a betting preset button (Newbie / Balanced Trader / Whale)
- **THEN** a tooltip displays a brief description of the strategy (e.g., "Conservative — invest 20–30% SOL, prioritize capital preservation")

### Requirement: Beginner Step 3 - Trading Strategy with Rules
The system SHALL present a two-column layout for trading strategy configuration. The left column SHALL display trading phase rules and mechanics (phase duration, pool composition, objective, liquidation rules, reward distribution). The right column SHALL provide strategy preset buttons, AI-Generated button, and strategy text area. The bottom of this step SHALL display the creation fee (0.1 SOL) and a "Create Agent" submit button.

#### Scenario: User views trading phase rules
- **WHEN** Step 3 is displayed
- **THEN** the left column shows trading phase rules including: phase duration (Block 150–1350, ~8 min), pool composition (20% SOL + 50% Token = Bonding Curve pool), objective (compete for top banker position by holding most tokens), and reward distribution (Top 1: 50%, Top 2: 30%, Top 3: 15%, Others: 5%)

#### Scenario: User creates agent from Step 3
- **WHEN** user has completed all 3 steps with valid data and clicks "Create Agent"
- **THEN** the system submits the agent with all collected data (name, avatar, betting strategy, trading strategy)
- **AND** navigates to `/my-agent` on success

### Requirement: Game Rules Content
The system SHALL maintain game rule descriptions as frontend constants in a dedicated file. The content SHALL cover betting phase rules, trading phase rules, liquidation phase rules, and reward distribution details. The content SHALL be written in English.

#### Scenario: Rules content is available
- **WHEN** a beginner step component renders a rules section
- **THEN** it imports rule descriptions from `src/constants/game-rules.ts`
- **AND** the content matches the current game mechanics

### Requirement: Strategy Preset Descriptions
Each strategy preset (betting and trading) SHALL include a short description field suitable for tooltip display. The description SHALL summarize the strategy's risk level and capital allocation in one sentence.

#### Scenario: Preset descriptions are defined
- **WHEN** the strategy presets are loaded
- **THEN** each preset has a `description` field (e.g., Newbie: "Conservative — invest 20–30% SOL, prioritize capital preservation")
