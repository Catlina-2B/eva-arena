# Tasks: Add Custom Avatar Upload

## 1. API Layer

- [x] 1.1 在 `src/types/api.ts` 添加 `AvatarUploadResponseDto` 类型定义
- [x] 1.2 在 `src/services/api/agents.ts` 添加 `uploadAvatar` 方法，使用 `multipart/form-data` 上传文件

## 2. Hooks Layer

- [x] 2.1 在 `src/hooks/use-agents.ts` 添加 `useUploadAvatar` mutation hook

## 3. UI Components

- [x] 3.1 在 `src/pages/create-agent.tsx` 重构 `AddAvatarButton` 组件：
  - 添加隐藏的 file input 元素
  - 点击按钮触发文件选择
  - 添加文件类型验证（jpg, png, gif, webp）
  - 添加文件大小限制（如 5MB）
- [x] 3.2 添加上传状态处理：
  - Loading 状态显示加载动画
  - 成功后将 URL 添加到本地头像列表并选中
  - 失败时显示错误提示
- [x] 3.3 支持自定义头像的背景色处理

## 4. Edit Agent Modal

- [x] 4.1 在 `src/components/agent/edit-agent-modal.tsx` 添加上传功能
  - 添加 useUploadAvatar hook
  - 添加文件验证和上传逻辑
  - 显示自定义头像（包括 agent 原有的自定义头像）
  - 实现上传按钮的 loading 和 error 状态

## 5. Testing

- [ ] 5.1 测试文件选择和上传流程
- [ ] 5.2 测试文件类型和大小限制
- [ ] 5.3 测试错误处理和状态反馈

