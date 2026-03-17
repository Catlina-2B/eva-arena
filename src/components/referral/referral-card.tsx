import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { referralApi } from "@/services/api";
import { TierBadge } from "./tier-badge";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ReferralCard() {
  const [copied, setCopied] = useState<"code" | "link" | "community_code" | "community_link" | null>(null);

  const { data: info, isLoading } = useQuery({
    queryKey: ["referral", "me"],
    queryFn: referralApi.getMyReferral,
    staleTime: 30_000,
  });

  const handleCopy = async (text: string, type: "code" | "link" | "community_code" | "community_link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback: prompt user to copy manually
    }
  };

  const handleShareTwitter = () => {
    if (!info) return;
    const text = `EVA Arena — AI Trading Arena For Real Money 💰\n\nDesign your trading strategy in one prompt. Your AI agent executes it autonomously 24/7 in live rounds with real SOL.\n\nShort rounds. Smarter strategies win.\n\nJoin via my link for bonus points 👇\n\n${info.referralLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 animate-pulse">
        <div className="h-5 bg-gray-700/50 rounded w-32 mb-4" />
        <div className="h-10 bg-gray-700/50 rounded mb-3" />
        <div className="h-10 bg-gray-700/50 rounded" />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-eva-text-dim">
          My Referral
        </h3>
        <TierBadge tier={info.tier} size="sm" />
      </div>

      {/* Referral Code */}
      <div className="space-y-1.5">
        <label className="text-xs text-eva-text-dim">Invite Code</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 font-mono text-sm text-eva-primary border border-eva-border/10">
            {info.referralCode}
          </div>
          <button
            onClick={() => handleCopy(info.referralCode, "code")}
            className="p-2 rounded-lg bg-black/30 border border-eva-border/10 text-eva-text-dim hover:text-white transition-colors"
          >
            {copied === "code" ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="space-y-1.5">
        <label className="text-xs text-eva-text-dim">Invite Link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-eva-text-dim border border-eva-border/10 truncate">
            {info.referralLink}
          </div>
          <button
            onClick={() => handleCopy(info.referralLink, "link")}
            className="p-2 rounded-lg bg-black/30 border border-eva-border/10 text-eva-text-dim hover:text-white transition-colors"
          >
            {copied === "link" ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Community Referral Code */}
      {info.communityReferralCode && (
        <>
          <div className="space-y-1.5">
            <label className="text-xs text-eva-text-dim">Community Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 font-mono text-sm text-amber-400 border border-eva-border/10">
                {info.communityReferralCode}
              </div>
              <button
                onClick={() => handleCopy(info.communityReferralCode!, "community_code")}
                className="p-2 rounded-lg bg-black/30 border border-eva-border/10 text-eva-text-dim hover:text-white transition-colors"
              >
                {copied === "community_code" ? (
                  <CheckIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-eva-text-dim">Community Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-eva-text-dim border border-eva-border/10 truncate">
                {info.communityReferralLink}
              </div>
              <button
                onClick={() => handleCopy(info.communityReferralLink!, "community_link")}
                className="p-2 rounded-lg bg-black/30 border border-eva-border/10 text-eva-text-dim hover:text-white transition-colors"
              >
                {copied === "community_link" ? (
                  <CheckIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{info.totalPoints}</div>
          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider">Points</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{info.referredCount}</div>
          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider">Invited</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{info.activatedCount}</div>
          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider">Activated</div>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShareTwitter}
        className="w-full py-2.5 rounded-lg bg-eva-primary/20 border border-eva-primary/30 text-eva-primary text-sm font-mono uppercase tracking-wider hover:bg-eva-primary/30 transition-colors"
      >
        Share on Twitter / X
      </button>
    </div>
  );
}
