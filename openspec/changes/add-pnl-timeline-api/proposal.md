# Change: 集成 PNL 时间线 API

## Why

My-Agent 页面的 PNL 模块目前使用硬编码的 mock 数据显示曲线图，需要接入后端真实的 `getUserPnlTimeline` API 来展示用户实际的 PNL 时间线数据。

## What Changes

- 新增 `PnlTimelineItemDto` 和 `UserPnlTimelineResponseDto` 类型定义
- 在 `trenchApi` 服务中添加 `getUserPnlTimeline` 方法
- 新增 `useUserPnlTimeline` React Query hook
- 修改 `PnlChart` 组件使用真实 API 数据替代 mock 数据

## Impact

- Affected specs: `my-agent`
- Affected code:
  - `src/types/api.ts` - 添加类型定义
  - `src/services/api/trenches.ts` - 添加 API 方法
  - `src/hooks/use-trenches.ts` - 添加 hook
  - `src/pages/my-agent.tsx` - 修改 PnlChart 组件

