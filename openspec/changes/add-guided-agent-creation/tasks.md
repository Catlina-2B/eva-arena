## 1. Foundation

- [x] 1.1 Create `src/constants/game-rules.ts` with hardcoded rule descriptions for betting phase, trading phase, liquidation phase, and reward distribution
- [x] 1.2 Add `description` field to each preset in `src/constants/strategy-presets.ts` (BETTING_STRATEGY_PRESETS and TRADING_STRATEGY_PRESETS)

## 2. Mode Selection

- [x] 2.1 Create `src/components/agent/create-agent-mode-select.tsx` with two-card layout (Beginner / Experienced Player)
- [x] 2.2 Add creation mode state management to `src/pages/create-agent.tsx` (mode: 'select' | 'beginner' | 'expert', step: 1 | 2 | 3)

## 3. Beginner Flow Components

- [x] 3.1 Create `src/components/agent/create-agent-stepper.tsx` — step container with progress indicator and Back/Next navigation
- [x] 3.2 Create `src/components/agent/steps/step-name-avatar.tsx` — extract avatar grid and name input from current page, add field validation for Next button
- [x] 3.3 Create `src/components/agent/steps/step-betting-strategy.tsx` — two-column layout: left rules panel + right strategy config (presets, AI-Generated, textarea)
- [x] 3.4 Create `src/components/agent/steps/step-trading-strategy.tsx` — two-column layout: left rules panel + right strategy config + creation fee bar + Create Agent button

## 4. Integration

- [x] 4.1 Refactor `src/pages/create-agent.tsx` to render mode selection by default, then switch to beginner stepper or existing expert form based on user choice
- [x] 4.2 Lift form state (name, avatar, betting strategy, trading strategy) to parent page so data persists across steps and modes
- [x] 4.3 Wire up Create Agent submission from Step 3 using existing `useCreateAgent` hook

## 5. Polish

- [x] 5.1 Add tooltip component for strategy preset descriptions (hover to show brief summary)
- [x] 5.2 Ensure step transitions are smooth (CSS transitions on stepper indicators)
- [x] 5.3 Verify TypeScript compilation passes with zero errors
