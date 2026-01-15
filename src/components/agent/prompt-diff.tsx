import { useState, useMemo } from "react";

// Arrow icons for expand/collapse
const ArrowDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M3.5 5.25L7 8.75L10.5 5.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M3.5 8.75L7 5.25L10.5 8.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface DiffLine {
  type: "add" | "remove" | "unchanged";
  content: string;
}

interface PromptDiffProps {
  /** 标题，如 "Trading Phase Strategy" */
  title: string;
  /** Diff 行列表 */
  lines: DiffLine[];
  /** 默认显示的行数 */
  collapsedLines?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * Prompt Diff 显示组件
 * 用于显示策略 Prompt 的前后对比
 */
export function PromptDiff({
  title,
  lines,
  collapsedLines = 3,
  className = "",
}: PromptDiffProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 过滤出有变化的行（add 或 remove）
  const changedLines = useMemo(
    () => lines.filter((line) => line.type !== "unchanged"),
    [lines]
  );

  // 决定显示哪些行
  const displayLines = useMemo(() => {
    if (isExpanded) {
      return changedLines;
    }
    return changedLines.slice(0, collapsedLines);
  }, [changedLines, isExpanded, collapsedLines]);

  const hasMoreLines = changedLines.length > collapsedLines;

  if (changedLines.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-[#1a1a1a] border border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-[rgba(255,255,255,0.1)]">
        <span className="text-sm font-mono text-gray-300">{title}</span>
      </div>

      {/* Diff Content */}
      <div className="p-3 space-y-1">
        {displayLines.map((line, index) => (
          <DiffLineItem key={index} line={line} />
        ))}

        {/* Gradient overlay when collapsed */}
        {!isExpanded && hasMoreLines && (
          <div className="relative h-8 -mt-8 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]" />
          </div>
        )}
      </div>

      {/* Expand/Collapse Toggle */}
      {hasMoreLines && (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1 py-2 text-sm font-mono text-white hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <ArrowUpIcon />
            </>
          ) : (
            <>
              <span>Show more</span>
              <ArrowDownIcon />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * 单行 Diff 显示
 */
function DiffLineItem({ line }: { line: DiffLine }) {
  const isAdd = line.type === "add";
  const isRemove = line.type === "remove";

  if (!isAdd && !isRemove) {
    return null;
  }

  return (
    <div
      className={`px-2 py-1 text-sm font-mono text-white leading-relaxed border-l-2 ${
        isAdd
          ? "bg-[rgba(108,225,130,0.1)] border-[#6ce182]"
          : "bg-[rgba(248,113,113,0.1)] border-[#f87171]"
      }`}
    >
      <span className="whitespace-pre-wrap">
        {isAdd ? "+ " : "- "}
        {line.content}
      </span>
    </div>
  );
}

/**
 * 解析 Prompt 差异
 * 简单实现：基于行对比
 */
export function parsePromptDiff(
  oldPrompt: string,
  newPrompt: string
): DiffLine[] {
  const oldLines = oldPrompt.split("\n").filter((l) => l.trim());
  const newLines = newPrompt.split("\n").filter((l) => l.trim());

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  const result: DiffLine[] = [];

  // 找出删除的行
  for (const line of oldLines) {
    if (!newSet.has(line)) {
      result.push({ type: "remove", content: line });
    }
  }

  // 找出新增的行
  for (const line of newLines) {
    if (!oldSet.has(line)) {
      result.push({ type: "add", content: line });
    }
  }

  return result;
}

export default PromptDiff;
