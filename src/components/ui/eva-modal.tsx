import { Fragment, ReactNode } from "react";
import clsx from "clsx";

interface EvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function EvaModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}: EvaModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className={clsx(
            "bg-eva-card border border-eva-border rounded-xl shadow-2xl pointer-events-auto animate-slide-up w-full",
            sizeStyles[size],
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-eva-border">
              <h2 className="text-lg font-semibold tracking-wider uppercase text-eva-text">
                {title}
              </h2>
              <button
                className="p-1 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors"
                onClick={onClose}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

interface EvaModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function EvaModalFooter({ children, className }: EvaModalFooterProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-end gap-3 pt-4 border-t border-eva-border -mx-6 -mb-6 px-6 py-4 mt-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
