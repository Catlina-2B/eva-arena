/**
 * Analytics Service - PostHog Integration
 * 数据埋点服务
 */
import posthog from "posthog-js";

// PostHog 配置
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * 初始化 PostHog
 */
export function initAnalytics(): void {
  if (!POSTHOG_KEY) {
    console.warn("[Analytics] PostHog key not configured, analytics disabled");
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // 手动控制页面浏览事件
    capture_pageleave: true,
    autocapture: false, // 关闭自动捕获，使用手动埋点
  });

  console.log("[Analytics] PostHog initialized");
}

/**
 * 识别用户
 */
export function identifyUser(
  userId: string,
  properties?: {
    wallet_address?: string;
    login_method?: string;
  },
): void {
  if (!POSTHOG_KEY) return;

  posthog.identify(userId, properties);
}

/**
 * 重置用户（登出时调用）
 */
export function resetUser(): void {
  if (!POSTHOG_KEY) return;

  posthog.reset();
}

// ============================================================
// 埋点事件定义 - 根据 Notion 数据埋点需求文档
// ============================================================

/**
 * 用户登录事件 (P0)
 * 触发时机：登录成功（拿到会话/签名校验通过）
 */
export function trackUserLogin(properties: {
  login_method: "wallet" | "google" | "apple" | "email";
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("user_login", {
    login_method: properties.login_method,
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

/**
 * 用户登出事件 (P1)
 * 触发时机：用户点击登出并清理会话成功
 */
export function trackUserLogout(properties: {
  logout_reason: "manual" | "token_expired" | "wallet_disconnect";
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("user_logout", {
    logout_reason: properties.logout_reason,
  });
}

/**
 * 页面浏览事件 (P0)
 * 触发时机：页面加载完成（首屏 ready）
 */
export function trackPageView(properties: {
  page_name: "home" | "arena" | "agent_panel" | "my_agent" | "token_detail" | "create_agent";
  referrer?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("page_view", {
    page_name: properties.page_name,
    referrer: properties.referrer || document.referrer,
  });
}

/**
 * 战况面板查看事件 (P0)
 * 触发时机：arena 视图曝光（tab 进入或默认展示）
 */
export function trackArenaView(properties: {
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("arena_view", {
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

/**
 * Agent 面板查看事件 (P0)
 * 触发时机：Agent panel 展示（右侧面板展开/进入）
 */
export function trackAgentPanelView(properties: {
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("agent_panel_view", {
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

/**
 * Agent 策略编辑事件 (P1)
 * 触发时机：保存策略成功
 */
export function trackAgentStrategyEdit(properties: {
  strategy_phase: "bidding" | "trading";
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("agent_strategy_edit", {
    strategy_phase: properties.strategy_phase,
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

/**
 * Agent 创建事件 (P0)
 * 触发时机：创建成功（含创建费用扣款成功）
 */
export function trackAgentCreate(properties: {
  agent_id: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("agent_create", {
    agent_id: properties.agent_id,
  });
}

/**
 * Agent 启动事件 (P0)
 * 触发时机：Agent 启动成功
 */
export function trackAgentStart(properties: {
  agent_id: string;
  round_id?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("agent_start", {
    agent_id: properties.agent_id,
    round_id: properties.round_id,
  });
}

/**
 * Agent 暂停事件 (P0)
 * 触发时机：Agent 调度暂停成功
 */
export function trackAgentPause(properties: {
  agent_id: string;
  pause_reason: "manual" | "error" | "risk_control" | "insufficient_gas";
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("agent_pause", {
    agent_id: properties.agent_id,
    pause_reason: properties.pause_reason,
  });
}

/**
 * 用户充值事件 (P0)
 * 触发时机：链上入金交易确认后
 */
export function trackUserDeposit(properties: {
  amount_sol: number;
  tx_hash?: string;
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("user_deposit", {
    amount_sol: properties.amount_sol,
    tx_hash: properties.tx_hash,
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

/**
 * 用户提款事件 (P0)
 * 触发时机：链上提款交易确认后
 */
export function trackUserWithdraw(properties: {
  amount_sol: number;
  tx_hash?: string;
  wallet_address?: string;
}): void {
  if (!POSTHOG_KEY) return;

  posthog.capture("user_withdraw", {
    amount_sol: properties.amount_sol,
    tx_hash: properties.tx_hash,
    wallet_address: properties.wallet_address
      ? maskWalletAddress(properties.wallet_address)
      : undefined,
  });
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 脱敏钱包地址（首尾各 4 位）
 */
function maskWalletAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * 导出 PostHog 实例（用于高级用法）
 */
export { posthog };
