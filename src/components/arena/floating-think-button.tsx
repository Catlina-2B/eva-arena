import { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";

interface FloatingThinkButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  /** 是否有新的思考记录 */
  hasNew?: boolean;
}

// 从 localStorage 读取位置
function getSavedPosition(): { y: number; side: "left" | "right" } {
  try {
    const saved = localStorage.getItem("eva-think-button-position");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return { y: 50, side: "right" }; // 默认右侧 50%
}

// 保存位置到 localStorage
function savePosition(y: number, side: "left" | "right") {
  try {
    localStorage.setItem("eva-think-button-position", JSON.stringify({ y, side }));
  } catch {
    // ignore
  }
}

export function FloatingThinkButton({
  isOpen,
  onToggle,
  hasNew = false,
}: FloatingThinkButtonProps) {
  const [position, setPosition] = useState(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<{ startY: number; startPosY: number } | null>(null);

  // 处理拖拽开始
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!buttonRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    buttonRef.current.setPointerCapture(e.pointerId);
    
    dragStartRef.current = {
      startY: e.clientY,
      startPosY: position.y,
    };
  }, [position.y]);

  // 处理拖拽移动
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const deltaY = e.clientY - dragStartRef.current.startY;
    const windowHeight = window.innerHeight;
    const newY = dragStartRef.current.startPosY + (deltaY / windowHeight) * 100;
    
    // 限制在 10% - 90% 之间
    const clampedY = Math.max(10, Math.min(90, newY));
    
    // 判断左右吸附
    const windowWidth = window.innerWidth;
    const newSide = e.clientX < windowWidth / 2 ? "left" : "right";
    
    setPosition({ y: clampedY, side: newSide });
  }, [isDragging]);

  // 处理拖拽结束
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    buttonRef.current?.releasePointerCapture(e.pointerId);
    dragStartRef.current = null;
    
    // 保存位置
    savePosition(position.y, position.side);
  }, [isDragging, position]);

  // 处理点击（只在非拖拽时触发）
  const handleClick = useCallback(() => {
    if (!isDragging) {
      onToggle();
    }
  }, [isDragging, onToggle]);

  // 处理 ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <button
      ref={buttonRef}
      className={clsx(
        "fixed z-50 hidden lg:flex items-center justify-center",
        "w-12 h-12 rounded-full",
        "bg-eva-darker border-2 border-eva-primary/60",
        "shadow-lg shadow-eva-primary/20",
        "hover:border-eva-primary hover:shadow-eva-primary/40",
        "transition-all duration-300 ease-out",
        isDragging && "opacity-80 scale-110 cursor-grabbing",
        !isDragging && "cursor-grab",
        isOpen && "border-eva-primary shadow-eva-primary/50"
      )}
      style={{
        top: `${position.y}%`,
        left: position.side === "left" ? "8px" : "auto",
        right: position.side === "right" ? "8px" : "auto",
        transform: "translateY(-50%)",
      }}
      title="Agent 思考历史"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 脑部/灯泡图标 */}
      <svg
        className={clsx(
          "w-6 h-6 transition-colors",
          isOpen ? "text-eva-primary" : "text-eva-text-dim"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
      
      {/* 新消息指示器 */}
      {hasNew && !isOpen && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-eva-primary rounded-full animate-pulse" />
      )}
    </button>
  );
}

// 导出 position 类型供 ThinkListPanel 使用
export type ThinkButtonPosition = { y: number; side: "left" | "right" };
export { getSavedPosition };
