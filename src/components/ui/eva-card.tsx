import { ReactNode } from "react";
import clsx from "clsx";

interface EvaCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  title?: string;
  action?: ReactNode;
}

export function EvaCard({
  children,
  className,
  hover = false,
  glow = false,
  title,
  action,
}: EvaCardProps) {
  return (
    <div
      className={clsx(
        "bg-eva-card border border-eva-border",
        hover &&
          "transition-all duration-200 hover:bg-eva-card-hover hover:border-eva-primary/30",
        glow && "shadow-eva-glow",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-eva-border">
          {title && (
            <h3 className="text-sm font-semibold tracking-wider uppercase text-eva-text-dim">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface EvaCardContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function EvaCardContent({
  children,
  className,
  noPadding,
}: EvaCardContentProps) {
  return <div className={clsx(!noPadding && "p-4", className)}>{children}</div>;
}
