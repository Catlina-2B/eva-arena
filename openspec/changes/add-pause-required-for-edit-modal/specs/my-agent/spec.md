## ADDED Requirements

### Requirement: Pause Required Modal for Agent Editing

The system SHALL prevent editing an Agent while it is in ACTIVE status and prompt the user to pause first.

#### Scenario: Click edit on active agent
- **WHEN** user clicks the edit button on an Agent that has status "ACTIVE"
- **THEN** the system SHALL display a PauseRequiredModal instead of opening the EditAgentModal
- **AND** the modal SHALL show title "NOTICE"
- **AND** the modal SHALL display message "Please pause the agent first"
- **AND** the modal SHALL provide "CANCEL" and "PAUSE" buttons

#### Scenario: User cancels pause required modal
- **WHEN** user clicks "CANCEL" button or closes the PauseRequiredModal
- **THEN** the modal SHALL close
- **AND** no changes SHALL be made to the Agent status

#### Scenario: User pauses agent from modal
- **WHEN** user clicks "PAUSE" button in the PauseRequiredModal
- **THEN** the system SHALL toggle the Agent status to PAUSED
- **AND** close the PauseRequiredModal
- **AND** open the EditAgentModal for editing

#### Scenario: Click edit on paused agent
- **WHEN** user clicks the edit button on an Agent that has status "PAUSED"
- **THEN** the system SHALL directly open the EditAgentModal
- **AND** no PauseRequiredModal SHALL be shown

### Requirement: PauseRequiredModal Component

The system SHALL provide a PauseRequiredModal component with consistent styling matching other modals in the application.

#### Scenario: Modal visual design
- **WHEN** PauseRequiredModal is displayed
- **THEN** it SHALL have the same visual style as StartTimingModal
- **AND** include corner decorations
- **AND** include robot/agent icon
- **AND** include "// SECURE CHANNEL //" label
- **AND** have a message box with left green border

#### Scenario: Modal loading state
- **WHEN** the pause action is in progress
- **THEN** the PAUSE button SHALL show loading state
- **AND** both buttons SHALL be disabled

