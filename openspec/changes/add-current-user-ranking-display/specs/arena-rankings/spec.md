## ADDED Requirements

### Requirement: Current User Ranking Display When Not In Top Three
当当前用户不在前三名时，LiveRankings 组件 SHALL 在前三名列表下方显示当前用户的排名信息。

#### Scenario: Current user is ranked 4th or below
- **WHEN** leaderboard API 返回 currentUser 且 currentUser.rank > 3
- **THEN** 在前三名列表下方显示：
  - Gap to Podium 分隔区域，显示与第三名的 Token 差距
  - 当前用户排名行，包含：排名徽章、头像、名称、Token 数量、奖励金额、Supply 比例
  - 底部提示信息 "Top 3 take 95% Prize | Rest share 5%"

#### Scenario: Current user is in top 3
- **WHEN** leaderboard API 返回 currentUser 且 currentUser.rank <= 3
- **THEN** 不显示额外的当前用户区块（用户已在前三名列表中）

#### Scenario: No current user data
- **WHEN** leaderboard API 未返回 currentUser（用户未参与）
- **THEN** 不显示当前用户区块

