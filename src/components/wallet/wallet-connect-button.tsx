import { startTransition, useState } from "react";
import { useAccount, useModal } from "@particle-network/connectkit";

import { WalletInterfaceModal } from "./wallet-interface-modal";

import { EvaButton } from "@/components/ui";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

// 自定义钱包连接按钮，融合 EVA 设计风格
export function WalletConnectButton() {
  const { isConnected, address } = useAccount();
  const { setOpen } = useModal();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // 使用钱包认证 Hook - 自动处理签名登录
  const { isLoggingIn, loginError, isAuthenticated } = useWalletAuth({
    autoLogin: true,
  });

  // 截断地址显示
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 打开连接弹窗 - 使用 startTransition 避免 Suspense 错误
  const openConnectModal = () => {
    startTransition(() => {
      setOpen(true);
    });
  };

  if (isConnected && address) {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* 登录状态指示 */}
          {isLoggingIn && (
            <span className="text-xs font-mono text-eva-primary animate-pulse">
              Signing...
            </span>
          )}
          {loginError && (
            <span className="text-xs font-mono text-red-400" title={loginError}>
              Sign failed
            </span>
          )}
          {isAuthenticated && !isLoggingIn && (
            <span
              className="w-2 h-2 rounded-full bg-green-500"
              title="Authenticated"
            />
          )}
          <EvaButton
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
            size="sm"
            variant="outline"
            onClick={() => setIsWalletModalOpen(true)}
          >
            {truncateAddress(address)}
          </EvaButton>
        </div>

        {/* Wallet Interface Modal */}
        <WalletInterfaceModal
          address={address}
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      </>
    );
  }

  // 未连接时显示连接按钮
  return (
    <EvaButton
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
      size="sm"
      variant="primary"
      onClick={openConnectModal}
    >
      Connect Wallet
    </EvaButton>
  );
}

export default WalletConnectButton;
