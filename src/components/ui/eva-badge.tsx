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
        "inline-flex items-center border font-medium uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Specialized badges for activity types - styled according to Figma design
export function DepositBadge() {
  return (
    <span className="inline-flex items-center px-2 py-1.5 text-xs font-medium uppercase tracking-wider bg-[#064E3B] text-[#6CE182] border-none rounded">
      Deposit
    </span>
  );
}

export function WithdrawBadge() {
  return (
    <span className="inline-flex items-center px-2 py-1.5 text-xs font-medium uppercase tracking-wider bg-[#4C1D30] text-[#F472B6] border-none rounded">
      Withdraw
    </span>
  );
}

export function BuyBadge() {
  return (
    <span className="inline-flex items-center justify-center w-12 py-1.5 text-xs font-medium uppercase tracking-wider bg-[#064E3B] text-[#6CE182] border-none rounded">
      Buy
    </span>
  );
}

export function SellBadge() {
  return (
    <span className="inline-flex items-center justify-center w-12 py-1.5 text-xs font-medium uppercase tracking-wider bg-[#7F1D1D] text-[#F87171] border-none rounded">
      Sell
    </span>
  );
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
        return "bg-[#6CE182] text-black";
      case 2:
        return "bg-[#60A5FA] text-white";
      case 3:
        return "bg-[#78350F80] text-[#F59E0B]";
      default:
        return "bg-[#374151] text-white";
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
