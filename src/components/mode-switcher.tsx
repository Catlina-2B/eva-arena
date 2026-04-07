import { useAppMode } from "@/contexts/app-mode";

export function ModeSwitcher() {
  const { isManual } = useAppMode();

  const handleSwitch = () => {
    const hostname = window.location.hostname;
    const isLocalDev =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "manual.localhost";

    if (isLocalDev) {
      const url = new URL(window.location.href);
      if (isManual) {
        url.searchParams.delete("mode");
      } else {
        url.searchParams.set("mode", "manual");
      }
      window.location.href = url.toString();
    } else {
      const url = new URL(window.location.href);
      if (isManual) {
        url.hostname = url.hostname.replace(/^manual\./, "arena.");
      } else {
        url.hostname = url.hostname.replace(/^arena\./, "manual.");
      }
      window.location.href = url.toString();
    }
  };

  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition-colors border-eva-border/50 text-eva-text-dim hover:text-eva-text hover:border-eva-primary/50"
      title={isManual ? "Switch to Agent mode" : "Switch to Manual mode"}
      onClick={handleSwitch}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      {isManual ? "Agent" : "Manual"}
    </button>
  );
}
