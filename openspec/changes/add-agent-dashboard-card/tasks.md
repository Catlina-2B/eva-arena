## 1. Implementation

- [x] 1.1 Create AgentDashboardCard component with Figma design
  - [x] Agent header section (avatar, name, edit button, status badge)
  - [x] Balance stats section (TOKEN BAL, SOL BAL)
  - [x] PNL display section (TOTAL PNL, ROUND PNL)
  - [x] Action button (START/PAUSE SYSTEM)
  - [x] Execution logs section with phase badges

- [x] 1.2 Add supporting components
  - [x] PhaseBadge for execution log entries
  - [x] AgentAvatar with EVA-style geometric default
  - [x] EditIcon, PlayIcon, PauseIcon SVG components

- [x] 1.3 Add mock data
  - [x] Mock execution logs in agent.ts
  - [x] Update mockAgent with dashboard-relevant data

- [x] 1.4 Integrate with arena page
  - [x] Export component from arena/index.ts
  - [x] Add conditional rendering in arena.tsx

- [x] 1.5 Style adjustments per Figma
  - [x] Purple button color for START SYSTEM
  - [x] PNL layout with label-value horizontal alignment

