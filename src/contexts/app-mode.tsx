import { createContext, useContext, useMemo, type ReactNode } from "react";

export type AppMode = "agent" | "manual";

interface AppModeContextValue {
  mode: AppMode;
  isManual: boolean;
  isAgent: boolean;
}

const AppModeContext = createContext<AppModeContextValue>({
  mode: "agent",
  isManual: false,
  isAgent: true,
});

function detectAppMode(): AppMode {
  const envMode = import.meta.env.VITE_APP_MODE;
  if (envMode === "manual" || envMode === "agent") {
    return envMode;
  }

  if (typeof window !== "undefined") {
    // Support ?mode=manual query param for local development
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get("mode");
    if (queryMode === "manual" || queryMode === "agent") {
      return queryMode;
    }

    const hostname = window.location.hostname;
    if (hostname.startsWith("manual")) {
      return "manual";
    }
  }

  return "agent";
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AppModeContextValue>(() => {
    const mode = detectAppMode();
    return {
      mode,
      isManual: mode === "manual",
      isAgent: mode === "agent",
    };
  }, []);

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
