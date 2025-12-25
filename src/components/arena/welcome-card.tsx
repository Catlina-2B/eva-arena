import { startTransition } from "react";
import { useModal } from "@particle-network/connectkit";

import { EvaCard, EvaCardContent, EvaButton } from "@/components/ui";

export function WelcomeCard() {
  const { setOpen } = useModal();

  // 打开连接弹窗 - 使用 startTransition 避免 Suspense 错误
  const handleConnect = () => {
    startTransition(() => {
      setOpen(true);
    });
  };
  return (
    <EvaCard className="text-center">
      <EvaCardContent className="py-8">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-eva-card-hover border border-eva-border flex items-center justify-center">
          <svg
            className="w-8 h-8 text-eva-text-dim"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-wider uppercase text-eva-text mb-2">
          Welcome to EVA
        </h3>

        {/* Description */}
        <p className="text-sm text-eva-text-dim mb-6 max-w-xs mx-auto">
          Connect your wallet to enter the arena and create your autonomous
          trading agent.
        </p>

        {/* CTA */}
        <EvaButton
          fullWidth
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          variant="primary"
          onClick={handleConnect}
        >
          Connect Wallet
        </EvaButton>
      </EvaCardContent>
    </EvaCard>
  );
}
