import { ReactNode } from "react";
import clsx from "clsx";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "default";

interface EvaBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-eva-primary/20 text-eva-primary border-eva-primary/30",
  secondary: "bg-eva-secondary/20 text-eva-secondary border-eva-secondary/30",
  danger: "bg-eva-danger/20 text-eva-danger border-eva-danger/30",
  success: "bg-eva-success/20 text-eva-success border-eva-success/30",
  warning: "bg-eva-warning/20 text-eva-warning border-eva-warning/30",
  default: "bg-eva-card text-eva-text-dim border-eva-border",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
};

export function EvaBadge({
  children,
  variant = "default",
  className,
  size = "md",
}: EvaBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border font-medium uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Specialized badges for activity types
export function DepositBadge() {
  return <EvaBadge variant="success">Deposit</EvaBadge>;
}

export function WithdrawBadge() {
  return <EvaBadge variant="danger">Withdraw</EvaBadge>;
}

export function BuyBadge() {
  return <EvaBadge variant="primary">Buy</EvaBadge>;
}

export function SellBadge() {
  return <EvaBadge variant="warning">Sell</EvaBadge>;
}

// Rank badge component
interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return "bg-eva-primary/20 text-eva-primary border border-eva-primary/40";
      case 2:
        return "bg-eva-secondary/20 text-eva-secondary border border-eva-secondary/40";
      case 3:
        return "bg-eva-secondary/20 text-eva-secondary border border-eva-secondary/40";
      default:
        return "bg-eva-card border border-eva-border text-eva-text-dim";
    }
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center w-7 h-7 text-[11px] font-bold font-mono",
        getRankStyle(),
        className,
      )}
    >
      #{rank}
    </span>
  );
}
