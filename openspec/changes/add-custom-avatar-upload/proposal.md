# Change: Add Custom Avatar Upload for Agent Creation

## Why

目前 create-agent 页面只支持从预设头像列表中选择头像，用户无法上传自定义头像。后端已经实现了 `POST /agents/avatar` 接口支持头像上传到 S3，需要在前端实现对应的上传功能，让用户可以上传自定义图片作为 Agent 头像。

## What Changes

- 在 create-agent 页面的 Avatar 选择区域添加自定义上传功能
- 实现图片上传组件，支持点击"+"按钮触发文件选择
- 添加上传 API 调用，将图片上传到后端获取 URL
- 上传成功后将自定义头像添加到可选列表并自动选中
- 支持图片预览和上传状态反馈（loading、error）
- 添加文件类型和大小限制的客户端验证

## Impact

- Affected specs: agent-creation
- Affected code:
  - `src/pages/create-agent.tsx` - 修改 AddAvatarButton 组件实现上传功能
  - `src/components/agent/edit-agent-modal.tsx` - 添加上传功能到编辑弹窗
  - `src/services/api/agents.ts` - 添加 uploadAvatar API 方法
  - `src/hooks/use-agents.ts` - 添加 useUploadAvatar hook
  - `src/types/api.ts` - 添加上传响应类型

