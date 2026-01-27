## ADDED Requirements

### Requirement: Edit Agent Modal

The system SHALL provide a modal dialog for editing existing Agent configurations on the my-agent page.

#### Scenario: Open edit modal
- **WHEN** user clicks the edit button on the AgentInfo card
- **THEN** the EditAgentModal opens with current agent data pre-filled

#### Scenario: Edit agent name
- **WHEN** user modifies the agent name field
- **THEN** the input SHALL validate that name is not empty and not exceeding 20 characters
- **AND** display character count indicator (e.g., "5/20 characters")

#### Scenario: Select avatar
- **WHEN** user clicks on an avatar in the selection grid
- **THEN** the avatar SHALL be highlighted as selected
- **AND** the preview SHALL update to show the selected avatar

#### Scenario: Edit strategy prompts
- **WHEN** user modifies the Betting Strategy Prompt or Trading Strategy Prompt
- **THEN** the textarea SHALL accept the new content

#### Scenario: Submit edit form
- **WHEN** user clicks the confirm button with valid form data
- **THEN** the system SHALL call PUT /api/agents/:id with updated fields
- **AND** show loading state during API call
- **AND** on success, close the modal and refresh agent data
- **AND** on error, display error message and keep modal open

#### Scenario: Cancel edit
- **WHEN** user clicks the close button or backdrop
- **THEN** the modal SHALL close without saving changes

#### Scenario: Strategy modification notice
- **WHEN** the edit modal is open
- **THEN** display notice: "CHANGES WILL APPLY IN THE NEXT ROUND. CURRENTLY ACTIVE STRATEGIES CANNOT BE MODIFIED MID-ROUND."

