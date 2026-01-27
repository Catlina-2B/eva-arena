## ADDED Requirements

### Requirement: Agent Thinking Status Row
AgentDashboardCard 组件 SHALL 在执行日志（EXECUTION LOGS）区域顶部展示最新一条 Agent 思考记录。

该状态行 SHALL 包含以下元素：
- 状态指示器：ACTION（执行交易）显示绿色，INACTION（未执行）显示灰色
- 内容摘要：显示思考内容的第一行，超出部分省略
- 查看详情按钮：灯泡图标，点击打开 ReasoningModal 展示完整思考链

#### Scenario: 显示最新思考记录
- **WHEN** AgentDashboardCard 加载完成且有 Agent
- **THEN** 调用 `/agents/think-reasons` API 获取最新一条记录
- **AND** 在 EXECUTION LOGS 标题下方显示思考状态行

#### Scenario: 查看完整思考内容
- **WHEN** 用户点击思考状态行的灯泡图标
- **THEN** 打开 ReasoningModal 弹窗
- **AND** 显示完整的思考链（Chain of Thought）和执行动作

#### Scenario: 无思考记录
- **WHEN** Agent 没有任何思考记录
- **THEN** 思考状态行显示占位文本 "No thinking records yet"

---

### Requirement: Floating Think Button
系统 SHALL 在大屏幕尺寸（lg 及以上，>=1024px）下显示一个浮动思考按钮，允许用户快速访问 Agent 思考历史。

#### Scenario: 大屏幕显示浮动按钮
- **WHEN** 视口宽度 >= 1024px
- **AND** 用户已登录且拥有 Agent
- **THEN** 在页面边缘显示浮动按钮
- **AND** 默认位置为右侧边缘，垂直居中

#### Scenario: 小屏幕隐藏浮动按钮
- **WHEN** 视口宽度 < 1024px
- **THEN** 不显示浮动按钮

#### Scenario: 拖拽浮动按钮
- **WHEN** 用户按住浮动按钮并拖动
- **THEN** 按钮跟随鼠标/触摸位置移动
- **AND** 拖拽过程中显示视觉反馈（如透明度变化）

#### Scenario: 按钮吸附到边缘
- **WHEN** 用户释放拖拽
- **AND** 按钮 x 坐标位于屏幕左半部分
- **THEN** 按钮平滑动画吸附到左侧边缘

- **WHEN** 用户释放拖拽
- **AND** 按钮 x 坐标位于屏幕右半部分
- **THEN** 按钮平滑动画吸附到右侧边缘

---

### Requirement: Think List Panel
点击浮动按钮后 SHALL 打开一个思考列表面板，展示 Agent 的思考历史记录。

面板 SHALL 根据按钮吸附位置显示：
- 按钮吸附在右侧时，面板显示在按钮左侧
- 按钮吸附在左侧时，面板显示在按钮右侧

#### Scenario: 打开思考列表
- **WHEN** 用户点击浮动按钮
- **THEN** 在按钮旁边展开思考列表面板
- **AND** 调用 `/agents/think-reasons` API 获取思考历史
- **AND** 按时间倒序显示记录列表

#### Scenario: 列表项展示
- **WHEN** 思考列表加载完成
- **THEN** 每条记录显示：
  - 时间戳（相对时间，如 "2 min ago"）
  - Trench 标识（如 "Eva-916"）
  - 状态徽章（ACTION 绿色 / INACTION 灰色）
  - 内容摘要（一行，超出省略）

#### Scenario: 查看记录详情
- **WHEN** 用户点击列表中的某条记录
- **THEN** 打开 ReasoningModal 显示完整思考内容

#### Scenario: 加载更多记录
- **WHEN** 用户滚动到列表底部
- **AND** 还有更多记录未加载
- **THEN** 自动加载下一页记录

#### Scenario: 关闭面板
- **WHEN** 用户点击面板外部区域
- **OR** 用户再次点击浮动按钮
- **THEN** 关闭思考列表面板

---

### Requirement: Think Reasons API Integration
系统 SHALL 提供 `useThinkReasons` Hook 封装 `/agents/think-reasons` API 调用。

#### Scenario: 获取思考历史
- **WHEN** 调用 `useThinkReasons` Hook
- **THEN** 发送 GET 请求到 `/agents/think-reasons`
- **AND** 返回分页的思考记录列表

#### Scenario: 按 Trench 过滤
- **WHEN** 调用 `useThinkReasons` 并传入 `trenchId` 参数
- **THEN** 返回指定 Trench 的思考记录

#### Scenario: 分页加载
- **WHEN** 调用 `useThinkReasons` 并传入分页参数
- **THEN** 返回对应页码的记录
- **AND** 响应包含总数用于判断是否有更多数据
