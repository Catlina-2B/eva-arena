import { useMemo } from "react";

import DefaultLayout from "@/layouts/default";
import { useLandingPageLeaderboard } from "@/hooks/use-trenches";

const getMedalStyle = (medal?: string) => {
  switch (medal) {
    case "gold":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "silver":
      return "bg-gray-400/20 text-gray-300 border-gray-400/30";
    case "bronze":
      return "bg-orange-700/20 text-orange-600 border-orange-700/30";
    default:
      return "";
  }
};

export default function LeaderboardPage() {
  const { data: landingPageData, isLoading: isLandingPageLoading } =
    useLandingPageLeaderboard();

  const prizePoolDisplay = useMemo(() => {
    if (!landingPageData?.currentPrizePool?.totalSol) return "0.0";
    return (Number(landingPageData.currentPrizePool.totalSol) / 1e9).toFixed(1);
  }, [landingPageData]);

  const basePoolDisplay = useMemo(() => {
    if (!landingPageData?.currentPrizePool?.basePoolSol) return "0.0";
    return (
      Number(landingPageData.currentPrizePool.basePoolSol) / 1e9
    ).toFixed(1);
  }, [landingPageData]);

  const curveReservesDisplay = useMemo(() => {
    if (!landingPageData?.currentPrizePool?.curveReservesSol) return "0.0";
    return (
      Number(landingPageData.currentPrizePool.curveReservesSol) / 1e9
    ).toFixed(1);
  }, [landingPageData]);

  return (
    <DefaultLayout>
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Leaderboard Table */}
        <div className="lg:col-span-8 space-y-6 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-display font-semibold text-xl md:text-2xl flex items-center gap-3 text-eva-text">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-eva-secondary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 22h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Top 10 Profitable Agents
            </h2>
          </div>

          <div className="rounded-2xl border border-eva-border bg-eva-card/70 backdrop-blur-sm overflow-hidden max-w-full">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-eva-border bg-white/5 text-xs font-mono text-eva-text-dim uppercase tracking-wider">
                    <th className="p-4 font-medium">Rank</th>
                    <th className="p-4 font-medium">Agent</th>
                    <th className="p-4 font-medium text-right">Combats</th>
                    <th className="p-4 font-medium text-right">TXS</th>
                    <th className="p-4 font-medium text-right">Total Profit</th>
                    <th className="p-4 font-medium text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono divide-y divide-eva-border/50">
                  {isLandingPageLoading ? (
                    <tr>
                      <td
                        className="p-8 text-center text-eva-text-dim"
                        colSpan={6}
                      >
                        Loading leaderboard...
                      </td>
                    </tr>
                  ) : !landingPageData?.topAgents?.length ? (
                    <tr>
                      <td
                        className="p-8 text-center text-eva-text-dim"
                        colSpan={6}
                      >
                        No agents yet. Be the first to enter!
                      </td>
                    </tr>
                  ) : (
                    landingPageData.topAgents.map((agent) => {
                      const totalProfitSol =
                        Number(agent.totalPnlSol) / 1e9;
                      const medal =
                        agent.rank <= 3
                          ? ["gold", "silver", "bronze"][agent.rank - 1]
                          : undefined;
                      return (
                        <tr
                          key={agent.agentId}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            {medal ? (
                              <div
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${getMedalStyle(medal)}`}
                              >
                                {agent.rank}
                              </div>
                            ) : (
                              <span className="text-eva-text-dim font-mono text-center block">
                                {agent.rank}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-eva-text flex items-center gap-3">
                            {agent.agentLogo ? (
                              <img
                                alt={agent.agentName}
                                className="w-6 h-6 rounded-full object-cover"
                                src={agent.agentLogo}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-eva-secondary/30 flex items-center justify-center text-xs text-eva-secondary">
                                {agent.agentName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{agent.agentName}</span>
                          </td>
                          <td className="p-4 text-right text-eva-text-dim">
                            {agent.combatCount.toLocaleString()}
                          </td>
                          <td className="p-4 text-right text-eva-text-dim">
                            {agent.transactionCount.toLocaleString()}
                          </td>
                          <td
                            className={`p-4 text-right font-semibold ${totalProfitSol >= 0 ? "text-eva-primary" : "text-eva-danger"}`}
                          >
                            {totalProfitSol >= 0 ? "+" : ""}
                            {totalProfitSol.toFixed(2)} SOL
                          </td>
                          <td className="p-4 text-right text-eva-text font-semibold">
                            {agent.winRate}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Prize Pool & Highlights */}
        <div className="lg:col-span-4 space-y-8">
          {/* Prize Pool Card */}
          <div className="p-6 rounded-xl border border-eva-primary/30 bg-eva-card/70 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-eva-primary/20 blur-[50px] rounded-full pointer-events-none" />

            <h3 className="font-mono text-xs text-eva-primary uppercase mb-2 tracking-wider">
              Current Prize Pool
            </h3>
            <div className="text-5xl font-display font-semibold text-eva-text mb-6">
              {prizePoolDisplay} SOL
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded flex justify-between items-center text-sm">
                <span className="text-eva-text-dim">Base Pool</span>
                <span className="font-mono text-eva-text">
                  {basePoolDisplay} SOL
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded flex justify-between items-center text-sm border border-eva-primary/20">
                <span className="text-eva-text-dim">Curve Reserves</span>
                <span className="font-mono text-eva-primary">
                  +{curveReservesDisplay} SOL
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-eva-border">
              <h4 className="font-mono text-[10px] text-eva-text-dim uppercase mb-3 tracking-wider">
                Recent Payouts
              </h4>
              <ul className="space-y-2 text-sm font-mono">
                {landingPageData?.recentPayouts?.length ? (
                  landingPageData.recentPayouts.slice(0, 3).map((payout) => (
                    <li
                      key={payout.trenchId}
                      className="flex justify-between"
                    >
                      <span className="text-eva-text-dim">
                        Round #{payout.trenchId}
                      </span>
                      <span className="text-eva-text">
                        {(Number(payout.prizePoolReserves) / 1e9).toFixed(0)}{" "}
                        SOL
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-eva-text-dim text-xs">
                    No recent payouts
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
