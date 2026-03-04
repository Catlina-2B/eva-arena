# Change: Update Evolve Me Drawer with Behavior Visualization & Pending Badge

## Why
The Evolve Me drawer currently only shows a raw prompt text diff (`PromptDiff`), making it hard for users to understand how strategy optimization actually affects their agent's behavior. The backend `/strategy-wizard/optimize` API already returns a structured `behaviorChangeSummary` field (containing `changes[]`, `overallImpact`, `riskNote`), but the frontend does not consume it. Additionally, after applying a strategy update, users have no visible indicator on the Dashboard that the strategy is pending for the next round.

## What Changes
- Add `BehaviorChangeItem` and `BehaviorChangeSummary` TypeScript interfaces to `types/api.ts`; extend `OptimizeStrategyResponse` with optional `behaviorChangeSummary`
- Create `BehaviorChangeCard` component that renders the structured behavior change summary (parameter / before->after / impact table, overall impact, risk note)
- Integrate `BehaviorChangeCard` into the Evolve Me drawer, rendering above `PromptDiff` when `behaviorChangeSummary` is present
- After a successful "Apply", notify the parent component via a new `onApplySuccess` callback
- Add a `hasPendingStrategyUpdate` prop to `AgentDashboardCard` to show a pending badge ("Strategy update pending - active next round") in the Teach Me CTA area

## Impact
- Affected specs: `evolve-me`
- Affected code:
  - `src/types/api.ts` (type additions)
  - `src/components/agent/behavior-change-card.tsx` (new)
  - `src/components/agent/index.ts` (export)
  - `src/components/agent/evolve-me-drawer.tsx` (data flow + render)
  - `src/components/arena/agent-dashboard-card.tsx` (pending badge)
