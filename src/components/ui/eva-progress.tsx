import clsx from "clsx";

interface EvaProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  variant?: "primary" | "secondary" | "gradient";
  size?: "sm" | "md" | "lg";
}

export function EvaProgress({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  variant = "primary",
  size = "md",
}: EvaProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantStyles = {
    primary: "bg-eva-primary",
    secondary: "bg-eva-secondary",
    gradient: "bg-gradient-to-r from-eva-primary to-eva-accent",
  };

  const sizeStyles = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={clsx("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-eva-text-dim">{label}</span>
          {showLabel && (
            <span className="text-xs font-mono text-eva-text-dim">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          "w-full bg-eva-darker rounded-full overflow-hidden",
          sizeStyles[size],
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Phase progress bar for Arena
interface PhaseSegment {
  label: string;
  start: number;
  end: number;
  active?: boolean;
}

interface EvaPhaseProgressProps {
  currentBlock: number;
  totalBlocks: number;
  segments: PhaseSegment[];
  className?: string;
}

export function EvaPhaseProgress({
  currentBlock,
  totalBlocks,
  segments,
  className,
}: EvaPhaseProgressProps) {
  const percentage = (currentBlock / totalBlocks) * 100;

  return (
    <div className={clsx("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-eva-text-dim">⏱</span>
          <span className="text-xs font-mono text-eva-text">
            BLOCK {currentBlock.toLocaleString()} /{" "}
            {totalBlocks.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Segment labels */}
      <div className="flex justify-between mb-1">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className={clsx(
              "text-[10px] uppercase tracking-wider",
              segment.active ? "text-eva-primary" : "text-eva-text-dim",
            )}
          >
            {segment.label}
          </span>
        ))}
      </div>

      {/* Progress bar with segments */}
      <div className="relative w-full h-2 bg-eva-darker rounded-full overflow-hidden">
        {/* Segment dividers */}
        {segments.slice(0, -1).map((segment) => (
          <div
            key={segment.label}
            className="absolute top-0 bottom-0 w-px bg-eva-border"
            style={{ left: `${(segment.end / totalBlocks) * 100}%` }}
          />
        ))}

        {/* Progress fill */}
        <div
          className="h-full bg-gradient-to-r from-eva-primary to-eva-accent rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
