import { startTransition, useState } from "react";
import { useAccount, useModal } from "@particle-network/connectkit";

import { WalletInterfaceModal } from "./wallet-interface-modal";

import { EvaButton } from "@/components/ui";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useTurnkeyBalance } from "@/hooks/use-turnkey-balance";
import { useAuthStore } from "@/stores/auth";

// 规则/玩法 Icon (Book icon)
function RulesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.16669 1.75H4.66669C5.95449 1.75 7.00002 2.79553 7.00002 4.08333V12.25C7.00002 11.2841 6.21587 10.5 5.25002 10.5H1.16669V1.75" stroke="#6B7280" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.8333 1.75H9.33333C8.04553 1.75 7 2.79553 7 4.08333V12.25C7 11.2841 7.78415 10.5 8.75 10.5H12.8333V1.75" stroke="#6B7280" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface WalletConnectButtonProps {
  onOpenRules?: () => void;
}

// 自定义钱包连接按钮，融合 EVA 设计风格
export function WalletConnectButton({ onOpenRules }: WalletConnectButtonProps) {
  const { isConnected, address } = useAccount();
  const { setOpen } = useModal();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // 使用钱包认证 Hook - 自动处理签名登录
  const { isLoggingIn, loginError, isAuthenticated } = useWalletAuth({
    autoLogin: true,
  });

  // 从 auth store 获取 turnkey 地址
  const { user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress;

  // 订阅 Turnkey 钱包余额更新（会自动更新全局 store）
  useTurnkeyBalance(turnkeyAddress);

  // 截断地址显示
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // 打开连接弹窗 - 使用 startTransition 避免 Suspense 错误
  const openConnectModal = () => {
    startTransition(() => {
      setOpen(true);
    });
  };

  if (isConnected && address) {
    // 优先显示 turnkey 地址，如果没有则显示 EOA 地址
    const displayAddress = turnkeyAddress || address;

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
          {/* 钱包地址按钮 - 只在未认证时显示 */}
          {!isAuthenticated && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors hover:opacity-80"
              style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
              onClick={() => setIsWalletModalOpen(true)}
            >
              {/* 地址文本 */}
              <span className="text-sm font-mono text-eva-text tracking-wide">
                {truncateAddress(displayAddress)}
              </span>
            </button>
          )}

          {/* 分割线 + 玩法按钮 */}
          {onOpenRules && (
            <>
              <div className="w-px h-6 bg-eva-border" />
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 transition-colors hover:opacity-80 cursor-pointer"
                onClick={onOpenRules}
                title="Game Rules"
              >
                <RulesIcon />
                <span className="text-sm font-medium tracking-wider text-eva-text-dim">RULES</span>
              </button>
            </>
          )}
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
