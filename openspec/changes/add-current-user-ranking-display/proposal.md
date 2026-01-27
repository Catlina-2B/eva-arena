# Change: 添加当前用户排名展示（不在前三名时）

## Why
当前 LiveRankings 组件只显示前三名，如果当前用户不在前三名，无法看到自己的排名和与前三名的差距。需要根据 Figma 设计实现当前用户排名展示功能。

## What Changes
- 修改 `LiveRankings` 组件，当 currentUser 不在前三名时，显示额外的区块：
  - "Gap to Podium" 分隔线，显示与第三名的 Token 差距
  - 当前用户排名行（显示排名、头像、名称、Token 数量、奖励金额、Supply 比例）
  - 底部提示信息 "Top 3 take 95% Prize | Rest share 5%"
- 更新 `LeaderboardResponseDto` 类型定义

## Impact
- Affected specs: arena-rankings
- Affected code: 
  - `src/components/arena/live-rankings.tsx`
  - `src/lib/trench-utils.ts`
  - `src/types/index.ts`

