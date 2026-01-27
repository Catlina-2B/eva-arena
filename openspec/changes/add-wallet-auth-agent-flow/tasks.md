## 1. 钱包签名登录流程

- [x] 1.1 创建 `src/hooks/use-wallet-auth.ts` 封装钱包签名登录逻辑
- [x] 1.2 实现 SIWS (Sign-In with Solana) 标准消息生成
- [x] 1.3 生成随机 nonce 防止重放攻击
- [x] 1.4 调用 Particle 钱包的 signMessage 方法获取签名
- [x] 1.5 调用后端 login API 完成登录
- [x] 1.6 更新 `wallet-connect-button.tsx` 在连接成功后自动触发登录

## 2. 登录后 Agent 检查与路由守卫

- [x] 2.1 创建 `src/hooks/use-agent-check.ts` 检查用户是否有 Agent
- [x] 2.2 创建 `src/components/auth/auth-guard.tsx` 登录状态守卫组件
- [x] 2.3 登录成功后自动获取用户 Agent 列表
- [x] 2.4 无 Agent 时自动跳转到 `/create-agent` 页面
- [x] 2.5 更新路由配置，添加需要认证的页面守卫

## 3. Create Agent 页面完善

- [x] 3.1 使用 `useAgentLogos` Hook 获取后端 Logo 列表
- [x] 3.2 替换本地占位头像为后端返回的 IPFS Logo URL
- [x] 3.3 实现 Logo 图片加载和选择逻辑
- [x] 3.4 完善 handleCreateAgent 函数，调用后端 API 创建 Agent
- [x] 3.5 添加创建成功后跳转到 `/my-agent` 页面
- [x] 3.6 添加加载状态和错误处理

## 4. 登出与状态清理

- [x] 4.1 钱包断开连接时清理登录状态
- [x] 4.2 Token 过期时自动刷新或重新登录（已在 api/client.ts 中实现）
