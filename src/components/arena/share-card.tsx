import { Fragment, useRef, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";

import type { ArenaRound } from "@/types";
import { referralApi } from "@/services/api";

const S3_HOST = "https://eva-agent.s3.ap-southeast-1.amazonaws.com";

function proxyUrl(src: string): string {
  if (src.startsWith(S3_HOST)) {
    return "/_img" + src.slice(S3_HOST.length);
  }
  return src;
}

function useBase64Image(src: string | undefined) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) { setDataUrl(null); return; }

    let cancelled = false;

    fetch(proxyUrl(src))
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) setDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });

    return () => { cancelled = true; };
  }, [src]);

  return dataUrl;
}

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: ArenaRound;
  currentUser: {
    rank: number;
    agentName: string;
    agentAvatar?: string;
    prizeAmount: number;
    pnlSol?: number;
  };
}

export function ShareCardModal({
  isOpen,
  onClose,
  round,
  currentUser,
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: referralInfo } = useQuery({
    queryKey: ["referral", "me"],
    queryFn: referralApi.getMyReferral,
    staleTime: 60_000,
    enabled: isOpen,
  });

  const shareUrl = referralInfo?.referralLink || "https://arena.eva.fun";

  const avatarDataUrl = useBase64Image(currentUser.agentAvatar);

  const isTopThree = currentUser.rank <= 3;
  const isWinner = currentUser.rank === 1;

  const rankEmoji =
    currentUser.rank === 1
      ? "👑"
      : currentUser.rank === 2
        ? "🥈"
        : currentUser.rank === 3
          ? "🥉"
          : "⚔️";

  const rankLabel = isWinner
    ? "Champion"
    : currentUser.rank === 2
      ? "Runner-up"
      : currentUser.rank === 3
        ? "Third Place"
        : `Rank #${currentUser.rank}`;

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0a0a0f",
      });
    } catch {
      console.error("Failed to generate share image");
      return null;
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `eva-arena-round-${round.id.replace("eva-", "")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, generateImage, round.id]);

  const handleShareX = useCallback(() => {
    const solAmount = currentUser.prizeAmount.toFixed(2);
    const tweetText = isTopThree
      ? `${rankEmoji} ${rankLabel} in EVA Arena — won ${solAmount} SOL this round!\n\nMy AI agent just outperformed ${round.activeAgents} competitors in a live trading battle. +${solAmount} SOL 💰\n\nThink your strategy can beat mine? 👇`
      : `My AI agent just earned ${solAmount} SOL in EVA Arena! ⚔️\n\nCompeted against ${round.activeAgents} AI agents in a live trading round. Building smarter strategies every round 🧠\n\nJoin the arena 👇`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, "_blank");
  }, [currentUser.prizeAmount, isTopThree, rankEmoji, rankLabel, round.activeAgents, shareUrl]);

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              className="p-1.5 rounded-full text-[#6b7280] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          </div>

          {/* Card (captured as image) */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-lg"
            style={{
              background: "linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)",
              width: 480,
            }}
          >
            {/* Top accent bar */}
            <div
              className="h-1"
              style={{
                background: isWinner
                  ? "linear-gradient(90deg, #facc15, #f97316, #facc15)"
                  : isTopThree
                    ? "linear-gradient(90deg, #a855f7, #06b6d4, #a855f7)"
                    : "linear-gradient(90deg, #00ff88, #06b6d4, #00ff88)",
              }}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm tracking-[0.15em] uppercase text-[#00ff88]">
                    EVA Arena
                  </span>
                  <span className="text-xs font-mono text-[#6b7280]">
                    Round {round.id.replace("eva-", "#")}
                  </span>
                </div>
                <div className="text-xs font-mono text-[#6b7280]">
                  Prize Pool: {round.totalPrizePool.toFixed(2)} SOL
                </div>
              </div>

              {/* Rank Badge */}
              <div className="flex justify-center mb-4">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
                  style={{
                    borderColor: isWinner
                      ? "rgba(250, 204, 21, 0.5)"
                      : isTopThree
                        ? "rgba(168, 85, 247, 0.5)"
                        : "rgba(0, 255, 136, 0.3)",
                    background: isWinner
                      ? "rgba(250, 204, 21, 0.1)"
                      : isTopThree
                        ? "rgba(168, 85, 247, 0.1)"
                        : "rgba(0, 255, 136, 0.05)",
                  }}
                >
                  <span className="text-lg">{rankEmoji}</span>
                  <span
                    className="font-display text-sm tracking-wider uppercase"
                    style={{
                      color: isWinner ? "#facc15" : isTopThree ? "#a855f7" : "#00ff88",
                    }}
                  >
                    {rankLabel}
                  </span>
                </div>
              </div>

              {/* Agent Avatar + Name */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-16 h-16 rounded-full mb-3 border-2 overflow-hidden flex items-center justify-center"
                  style={{
                    borderColor: isWinner
                      ? "rgba(250, 204, 21, 0.6)"
                      : isTopThree
                        ? "rgba(168, 85, 247, 0.6)"
                        : "rgba(0, 255, 136, 0.4)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  {avatarDataUrl ? (
                    <img
                      src={avatarDataUrl}
                      alt={currentUser.agentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🤖</span>
                  )}
                </div>
                <div className="font-mono text-xs text-[#9ca3af] tracking-wider uppercase mb-1">
                  Agent
                </div>
                <div className="font-display text-lg text-white tracking-wide">
                  {currentUser.agentName}
                </div>
              </div>

              {/* Prize Amount — BIG NUMBER */}
              <div
                className="text-center py-6 mb-6 rounded-sm border"
                style={{
                  borderColor: isWinner
                    ? "rgba(250, 204, 21, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  background: isWinner
                    ? "linear-gradient(180deg, rgba(250,204,21,0.08) 0%, rgba(0,0,0,0.3) 100%)"
                    : "rgba(255, 255, 255, 0.02)",
                }}
              >
                <div className="font-mono text-xs text-[#9ca3af] tracking-[0.15em] uppercase mb-2">
                  Earnings
                </div>
                <div
                  className="font-display tracking-tight leading-none"
                  style={{
                    fontSize: isTopThree ? "48px" : "40px",
                    color: isWinner ? "#facc15" : "#4ade80",
                    textShadow: isWinner
                      ? "0 0 30px rgba(250,204,21,0.4)"
                      : "0 0 20px rgba(74,222,128,0.3)",
                  }}
                >
                  {currentUser.prizeAmount > 0 ? "+" : ""}
                  {currentUser.prizeAmount.toFixed(2)}
                  <span className="text-lg ml-1 opacity-60">SOL</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatBox label="Rank" value={`#${currentUser.rank}`} highlight={isTopThree} />
                <StatBox label="Prize Pool" value={`${round.totalPrizePool.toFixed(1)}`} suffix="SOL" />
                <StatBox label="Agents" value={`${round.activeAgents}`} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.05)]">
                <span className="font-mono text-[10px] text-[#4b5563] tracking-wider uppercase">
                  eva.fun
                </span>
                <span className="font-mono text-[10px] text-[#4b5563]">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4" style={{ width: 480 }}>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-wider transition-all border ${
                isDownloading
                  ? "border-[#1e1e2e] bg-[#12121a] text-[#6b7280] cursor-wait"
                  : "border-[rgba(255,255,255,0.1)] bg-[#12121a] text-white hover:bg-[#1a1a25] hover:border-[rgba(255,255,255,0.2)] active:scale-[0.98]"
              }`}
              disabled={isDownloading}
              onClick={handleDownload}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isDownloading ? "Saving..." : "Download"}
            </button>

            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-wider bg-[#1da1f2] text-white hover:bg-[#1a8cd8] active:scale-[0.98] transition-all"
              onClick={handleShareX}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

function StatBox({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="text-center py-2.5 px-2 rounded-sm border border-[rgba(255,255,255,0.05)]"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="font-mono text-[9px] text-[#6b7280] tracking-[0.12em] uppercase mb-1">
        {label}
      </div>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className={`font-mono font-bold text-sm ${highlight ? "text-[#a855f7]" : "text-white"}`}>
          {value}
        </span>
        {suffix && (
          <span className="font-mono text-[10px] text-[#6b7280]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
