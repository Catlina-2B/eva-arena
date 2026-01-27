# Change: Add Agent Dashboard Card Component

## Why
When a user connects their wallet and has an existing agent, the arena page needs to display an agent dashboard card instead of the welcome/create-agent cards. This provides users with real-time visibility into their agent's status, balances, PNL, and execution logs.

## What Changes
- Add new `AgentDashboardCard` component to display connected user's agent information
- Add mock execution logs data for development/testing
- Update arena page to conditionally render the dashboard when wallet is connected and agent exists
- Component includes: agent header with avatar/name/status, balance stats, PNL display, start/pause controls, and execution logs

## Impact
- Affected specs: `arena-components`
- Affected code:
  - `src/components/arena/agent-dashboard-card.tsx` (new)
  - `src/components/arena/index.ts` (export added)
  - `src/services/mock/agent.ts` (mock data added)
  - `src/pages/arena.tsx` (conditional rendering)

