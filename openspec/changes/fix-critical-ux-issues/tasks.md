## 1. AI Thinking Position
- [x] 1.1 Move AGENT REASONING block above the action button in AgentDashboardCard
- [x] 1.2 Ensure reasoning is visible without scrolling when agent is running

## 2. Chart Interaction Hints
- [x] 2.1 Add zoom/pan help text overlay to TradingPhaseChart
- [x] 2.2 Show hint on first view, dismiss on interaction or after timeout
- [x] 2.3 Store dismissal state in localStorage

## 3. Prompt Preset Readability
- [x] 3.1 Add strategy metadata to BETTING_PRESET_BUTTONS and TRADING_PRESET_BUTTONS
- [x] 3.2 Create StrategySummaryCard component showing structured summary
- [x] 3.3 Collapse textarea by default with "View Full Strategy" toggle in beginner mode steps
- [ ] 3.4 Update expert mode create-agent page with same pattern

## 4. Performance: Tab Visibility
- [x] 4.1 Create usePageVisibility hook
- [x] 4.2 Integrate visibility pause/resume in useTrenchSocket
- [x] 4.3 Integrate visibility pause/resume in useSlotSubscription
- [x] 4.4 Integrate visibility pause/resume in useTurnkeyBalance
- [x] 4.5 Refetch stale data on tab reactivation
- [x] 4.6 Add throttle to price update handler in TradingPhaseChart
