## MODIFIED Requirements

### Requirement: Home Page Authentication Navigation

The home page (arena) SHALL allow access to all users regardless of authentication or agent status. The system SHALL display appropriate UI cards based on user state:

1. **Unauthenticated users**: Display `WelcomeCard` prompting wallet connection
2. **Authenticated users without Agent**: Display `CreateAgentCard` prompting agent creation
3. **Authenticated users with Agent**: Display `AgentDashboardCard` showing agent status and controls

The system SHALL NOT force redirect to `/create-agent` after login. Users SHALL remain on their current page after successful authentication.

#### Scenario: Unauthenticated user views home page
- **WHEN** an unauthenticated user visits the home page
- **THEN** the system displays the `WelcomeCard` with wallet connection prompt
- **AND** the user can view all arena content (charts, rankings, activity)

#### Scenario: User logs in from home page
- **WHEN** a user successfully connects wallet and authenticates
- **THEN** the user remains on the home page
- **AND** the system updates the card display based on agent status
- **AND** the system does NOT redirect to `/create-agent`

#### Scenario: Authenticated user without agent views home page
- **WHEN** an authenticated user without an agent visits the home page
- **THEN** the system displays the `CreateAgentCard` prompting agent creation
- **AND** the user can view all arena content

#### Scenario: Authenticated user with agent views home page
- **WHEN** an authenticated user with an agent visits the home page
- **THEN** the system displays the `AgentDashboardCard`
- **AND** the card shows the agent's current status (ACTIVE or PAUSED)
- **AND** the card provides a toggle button to switch agent status

## ADDED Requirements

### Requirement: Agent Status Toggle from Dashboard Card

The `AgentDashboardCard` SHALL integrate with the backend `toggleAgentStatus` API to allow users to switch their agent between ACTIVE and PAUSED states directly from the home page.

#### Scenario: Toggle agent from active to paused
- **WHEN** user clicks the "PAUSE SYSTEM" button on an active agent
- **THEN** the system calls the toggle API
- **AND** the agent status changes to PAUSED
- **AND** the card updates to show "PAUSED" status badge
- **AND** the button changes to "START SYSTEM"

#### Scenario: Toggle agent from paused to active
- **WHEN** user clicks the "START SYSTEM" button on a paused agent
- **THEN** the system calls the toggle API
- **AND** the agent status changes to ACTIVE
- **AND** the card updates to show "RUNNING" status badge
- **AND** the button changes to "PAUSE SYSTEM"

#### Scenario: Toggle fails with error
- **WHEN** the toggle API call fails
- **THEN** the system displays an error message
- **AND** the agent status remains unchanged

