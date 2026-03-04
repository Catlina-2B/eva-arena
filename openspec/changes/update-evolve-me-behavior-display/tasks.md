## 1. Part 1: BehaviorChangeCard (Behavior Change Visualization)

- [ ] 1.1 `types/api.ts`: Add `BehaviorChangeItem` and `BehaviorChangeSummary` interfaces; add optional `behaviorChangeSummary` field to `OptimizeStrategyResponse`
- [ ] 1.2 New file `components/agent/behavior-change-card.tsx`: Render changes list (parameter / before->after / impact), `overallImpact` summary, and `riskNote` warning
- [ ] 1.3 `components/agent/index.ts`: Export `BehaviorChangeCard`
- [ ] 1.4 `components/agent/evolve-me-drawer.tsx`:
  - Extend `UIMessage.optimizeResult` to include `behaviorChangeSummary`
  - Store `behaviorChangeSummary` from backend response in `handleSend`
  - Render `BehaviorChangeCard` above `PromptDiff` in `MessageBubble`

## 2. Part 2: Pending Changes Badge

- [ ] 2.1 `components/agent/evolve-me-drawer.tsx`: Add `onApplySuccess` callback prop; invoke it after successful apply in `handleApply`
- [ ] 2.2 `components/arena/agent-dashboard-card.tsx`: Add `hasPendingStrategyUpdate` prop; render pending badge in Teach Me CTA area when true
