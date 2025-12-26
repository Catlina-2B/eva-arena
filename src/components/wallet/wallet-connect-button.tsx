import { startTransition, useState } from "react";
import { useAccount, useModal } from "@particle-network/connectkit";

import { WalletInterfaceModal } from "./wallet-interface-modal";

import { EvaButton } from "@/components/ui";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useMyAgents } from "@/hooks/use-agents";
import { useTurnkeyBalance } from "@/hooks/use-turnkey-balance";

// 规则/玩法 Icon
function RulesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 3.33317H4.16667V16.6665H15.8333V6.6665H12.5V3.33317ZM2.5 2.493C2.5 2.03655 2.87291 1.6665 3.33208 1.6665H13.3333L17.4998 5.83317L17.5 17.4936C17.5 17.9573 17.1292 18.3332 16.6722 18.3332H3.32783C2.87063 18.3332 2.5 17.9538 2.5 17.5067V2.493ZM9.16667 9.1665H10.8333V14.1665H9.16667V9.1665ZM9.16667 5.83317H10.8333V7.49984H9.16667V5.83317Z" fill="#6B7280"/>
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

  // 获取用户的 Agent 数据（包含 turnkey 地址）
  const { data: agentsData } = useMyAgents();
  const primaryAgent = agentsData?.agents?.[0];
  const turnkeyAddress = primaryAgent?.turnkeyAddress;

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
          {/* 钱包地址按钮 */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors hover:opacity-80"
            style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
            onClick={() => setIsWalletModalOpen(true)}
          >
            {/* 地址文本 */}
            <span className="text-sm font-mono text-eva-text tracking-wide">
              {truncateAddress(displayAddress)}
            </span>
            {/* 认证状态指示点 */}
            {isAuthenticated && !isLoggingIn && (
              <span
                className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                title="Authenticated"
              />
            )}
          </button>

          {/* 玩法按钮 */}
          {onOpenRules && (
            <button
              className="flex items-center justify-center w-9 h-9 rounded transition-colors hover:opacity-80"
              style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
              onClick={onOpenRules}
              title="Game Rules"
            >
              <RulesIcon />
            </button>
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
