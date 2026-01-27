## 1. 类型定义

- [x] 1.1 在 `src/types/api.ts` 中添加 `PnlTimelineItemDto` 接口
- [x] 1.2 在 `src/types/api.ts` 中添加 `UserPnlTimelineResponseDto` 接口

## 2. API 服务层

- [x] 2.1 在 `src/services/api/trenches.ts` 中添加 `getUserPnlTimeline` 方法

## 3. React Query Hook

- [x] 3.1 在 `src/hooks/use-trenches.ts` 中添加 `pnlTimeline` query key
- [x] 3.2 在 `src/hooks/use-trenches.ts` 中添加 `useUserPnlTimeline` hook
- [x] 3.3 在 `src/hooks/index.ts` 中导出新 hook

## 4. 组件集成

- [x] 4.1 修改 `PnlChart` 组件接受 `timeline` 数据作为 props
- [x] 4.2 在 `MyAgentPage` 中调用 `useUserPnlTimeline` 获取数据
- [x] 4.3 将 API 数据传递给 `PnlChart` 组件
- [x] 4.4 处理加载和空数据状态

