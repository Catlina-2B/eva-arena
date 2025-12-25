"use client";

import React, { Suspense } from "react";
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import { solanaWalletConnectors } from "@particle-network/connectkit/solana";
import { EntryPosition, wallet } from "@particle-network/connectkit/wallet";
// 从 @particle-network/connectkit/chains 导入 Solana 链
import { solana, solanaDevnet } from "@particle-network/connectkit/chains";

const config = createConfig({
  projectId: import.meta.env.VITE_PARTICLE_PROJECT_ID!,
  clientKey: import.meta.env.VITE_PARTICLE_CLIENT_KEY!,
  appId: import.meta.env.VITE_PARTICLE_APP_ID!,

  appearance: {
    recommendedWallets: [
      { walletId: "phantom", label: "Recommended" },
      { walletId: "solflare", label: "Popular" },
    ],
    language: "en-US",
    mode: "dark", // EVA 主题使用暗色模式
    logo: "/images/logo.png",
  },

  walletConnectors: [
    solanaWalletConnectors(), // Solana 钱包连接器
  ],

  plugins: [
    wallet({
      visible: true,
      entryPosition: EntryPosition.BR, // 右下角显示钱包入口
    }),
  ],

  // 支持的链：Solana 主网和开发网
  chains: [solana, solanaDevnet],
});

// 加载中的 fallback 组件
const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-eva-dark/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-eva-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-eva-text-dim text-sm">Loading wallet...</span>
    </div>
  </div>
);

// 导出 ParticleConnectKit 组件用于包装应用
export const ParticleConnectKit = ({ children }: React.PropsWithChildren) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConnectKitProvider config={config}>{children}</ConnectKitProvider>
    </Suspense>
  );
};
