import clsx from "clsx";

interface EvaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EvaLogo({ className, size = "md" }: EvaLogoProps) {
  const sizeStyles = {
    sm: { width: 60, height: 25 },
    md: { width: 90, height: 38 },
    lg: { width: 120, height: 50 },
  };

  const dimensions = sizeStyles[size];

  return (
    <img
      alt="EVA"
      className={clsx("block", className)}
      height={dimensions.height}
      src="/images/logo.svg"
      width={dimensions.width}
    />
  );
}
