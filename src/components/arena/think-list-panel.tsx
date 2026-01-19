import type { ThinkReasonDto, ThinkReasonListResponseDto } from "@/types/api";
import type { ActivityItem } from "@/types";
import type { AgentThinkReasonEventDto } from "@/types/websocket";

import { Fragment, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

import { useThinkReasonsInfinite, thinkReasonKeys } from "@/hooks";
import { useAuthStore } from "@/stores/auth";
import { subscribeUser } from "@/services/websocket";
import { EvaBadge } from "@/components/ui";
import { ReasoningModal } from "./reasoning-modal";
import { getSavedPosition } from "./floating-think-button";
import { useState } from "react";

interface ThinkListPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 格式化相对时间
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// 截断内容
function truncateContent(content: string, maxLength: number = 60): string {
  const firstLine = content.split("\n")[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + "...";
}

// 将 ThinkReasonDto 转换为 ActivityItem 供 ReasoningModal 使用
function thinkReasonToActivity(reason: ThinkReasonDto): ActivityItem {
  return {
    id: String(reason.id),
    type: reason.status === "ACTION" ? "buy" : "buy", // 类型不太匹配，但用于显示
    agentId: "",
    agentName: "",
    userAddress: reason.userAddress,
    tokenAmount: 0,
    solAmount: 0,
    timestamp: new Date(reason.createdAt),
    signature: "",
    reason: {
      id: reason.id,
      content: reason.content,
      action: reason.action || (reason.status === "ACTION" ? "Execute Trade" : "Hold Position"),
      createdAt: reason.createdAt,
    },
  };
}

export function ThinkListPanel({ isOpen, onClose }: ThinkListPanelProps) {
  const [selectedReason, setSelectedReason] = useState<ThinkReasonDto | null>(null);
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress;

  // 获取按钮位置
  const buttonPosition = getSavedPosition();

  // 获取思考记录
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useThinkReasonsInfinite({ limit: 20 }, { enabled: isOpen });

  // 扁平化所有页面的数据
  const reasons = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.thinkReasons);
  }, [data]);

  // 订阅 WebSocket，实时更新思考记录
  useEffect(() => {
    if (!turnkeyAddress) return;

    const unsubscribe = subscribeUser(turnkeyAddress, {
      onAgentThinkReason: (event: AgentThinkReasonEventDto) => {
        // 只处理有完整数据的 action/inaction 事件
        if (
          (event.status === "action" || event.status === "inaction") &&
          event.id &&
          event.content
        ) {
          // 将 WebSocket 事件转换为 ThinkReasonDto
          // 注意：phase 只有 bidding/trading，liquidation 映射为 trading
          const phase = event.phase === "bidding" ? "bidding" : "trading";
          const newReason: ThinkReasonDto = {
            id: event.id,
            userAddress: event.turnkeyAddress || event.userAddress || turnkeyAddress,
            trenchId: event.trenchId,
            phase,
            status: event.status === "action" ? "ACTION" : "INACTION",
            content: event.content,
            action: event.action,
            createdAt: event.createdAt || new Date().toISOString(),
          };

          // 更新 react-query 缓存，将新数据插入到第一页的最前面
          queryClient.setQueryData<{
            pages: ThinkReasonListResponseDto[];
            pageParams: number[];
          }>(thinkReasonKeys.infinite({ limit: 20 }), (oldData) => {
            if (!oldData) return oldData;

            // 检查是否已存在（避免重复）
            const exists = oldData.pages.some((page) =>
              page.thinkReasons.some((r) => r.id === newReason.id)
            );
            if (exists) return oldData;

            // 将新数据插入到第一页的最前面
            const newPages = [...oldData.pages];
            if (newPages.length > 0) {
              newPages[0] = {
                ...newPages[0],
                thinkReasons: [newReason, ...newPages[0].thinkReasons],
                total: newPages[0].total + 1,
              };
            }

            return {
              ...oldData,
              pages: newPages,
            };
          });
        }
      },
    });

    return unsubscribe;
  }, [turnkeyAddress, queryClient]);

  // 无限滚动检测
  useEffect(() => {
    if (!isOpen || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // 如果 ReasoningModal 打开中，不处理外部点击
      if (isReasoningModalOpen) return;

      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // 检查是否点击了浮动按钮
        const target = e.target as HTMLElement;
        if (target.closest("[data-think-button]")) return;
        onClose();
      }
    };

    // 延迟添加事件，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isReasoningModalOpen, onClose]);

  if (!isOpen) return null;

  // 计算面板位置
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: `${buttonPosition.y}%`,
    transform: "translateY(-50%)",
    ...(buttonPosition.side === "right"
      ? { right: "68px" } // 按钮宽度 48px + 间距 20px
      : { left: "68px" }),
  };

  return createPortal(
    <Fragment>
      {/* 面板 */}
      <div
        ref={panelRef}
        className={clsx(
          "z-50 hidden lg:block",
          "w-[360px] max-h-[60vh]",
          "bg-eva-darker border border-eva-border rounded-lg",
          "shadow-2xl shadow-black/50",
          "overflow-hidden",
          "animate-fade-in"
        )}
        style={panelStyle}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-eva-border">
          <h3 className="text-sm font-mono font-semibold text-eva-text uppercase tracking-wider">
            <span className="text-eva-primary">///</span> Think History
          </h3>
          <button
            className="p-1 text-eva-text-dim hover:text-eva-text transition-colors"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* 列表 */}
        <div className="overflow-y-auto max-h-[calc(60vh-48px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reasons.length === 0 ? (
            <div className="text-center py-8 text-eva-text-dim text-sm">
              No thinking records yet
            </div>
          ) : (
            <div className="divide-y divide-eva-border/50">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  className="w-full px-4 py-3 text-left hover:bg-eva-card-hover transition-colors"
                  onClick={() => {
                    setSelectedReason(reason);
                    setIsReasoningModalOpen(true);
                  }}
                >
                  {/* 第一行：时间 + 状态 */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-eva-text-dim">
                      Eva-{reason.trenchId} · {formatRelativeTime(reason.createdAt)}
                    </span>
                    <EvaBadge
                      variant={reason.status === "ACTION" ? "success" : "default"}
                    >
                      {reason.status}
                    </EvaBadge>
                  </div>
                  
                  {/* 第二行：内容摘要 */}
                  <p className="text-xs text-eva-text font-mono line-clamp-2">
                    {truncateContent(reason.content, 80)}
                  </p>

                  {/* 第三行：执行动作（如果是 ACTION） */}
                  {reason.status === "ACTION" && reason.action && (
                    <p className="text-[10px] text-eva-primary font-mono mt-1 truncate">
                      → {reason.action}
                    </p>
                  )}
                </button>
              ))}

              {/* 加载更多触发器 */}
              {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-3">
                  {isFetchingNextPage ? (
                    <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-xs text-eva-text-dim">Scroll for more</span>
                  )}
                </div>
              )}

              {/* 列表结束 */}
              {!hasNextPage && reasons.length > 0 && (
                <div className="text-center py-3 text-[10px] text-eva-text-dim font-mono">
                  — END —
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ReasoningModal */}
      <ReasoningModal
        isOpen={isReasoningModalOpen}
        onClose={() => {
          setIsReasoningModalOpen(false);
        }}
        activity={selectedReason ? thinkReasonToActivity(selectedReason) : null}
      />
    </Fragment>,
    document.body
  );
}
