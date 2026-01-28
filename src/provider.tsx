import type { NavigateOptions } from "react-router-dom";

import { useEffect } from "react";
import { HeroUIProvider } from "@heroui/system";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useHref, useNavigate } from "react-router-dom";

import { ParticleConnectKit } from "@/connectkit";
import { queryClient } from "@/lib/query-client";
import { initAnalytics } from "@/services/analytics";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // 初始化 PostHog 埋点
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ParticleConnectKit>
        <HeroUIProvider navigate={navigate} useHref={useHref}>
          {children}
        </HeroUIProvider>
      </ParticleConnectKit>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
