import type { ArenaRound } from "@/types";
import type { AgentDetailData } from "@/components/arena/agent-detail-modal";

import { useCallback, useMemo, useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import {
  ArenaHeader,
  PreMarketBetting,
  TradingPhaseChart,
  RoundSettlement,
  RoundSkipped,
  LiveActivity,
  LiveRankings,
} from "@/components/arena";
import { ManualTradingPanel } from "@/components/manual/trading-panel";
import {
  useCurrentTrench,
  useLeaderboard,
  useTrenchTransactions,
  useTrenchSocket,
  useSlotSubscription,
  useTurnkeyBalance,
} from "@/hooks";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth";
import {
  trenchToArenaRound,
  leaderboardToRankings,
  getCurrentUserRanking,
  getThirdPlaceTokenAmount,
  transactionsToActivities,
} from "@/lib/trench-utils";
import { agentApi } from "@/services/api";
import { trackPageView } from "@/services/analytics";

export default function ManualArenaPage() {
  const { isAuthenticated } = useIsAuthenticated();
  const { user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress;

  const {
    data: trenchData,
    isLoading: isTrenchLoading,
    error: trenchError,
  } = useCurrentTrench();

  const trenchId = trenchData?.id;
  const onChainTrenchId = trenchData?.trenchId
    ? parseInt(trenchData.trenchId.replace(/^eva-/, ""), 10)
    : undefined;

  const { data: leaderboardData } = useLeaderboard(trenchId);

  const { data: transactionsData } = useTrenchTransactions(trenchId, {
    limit: 10,
    txType: ["DEPOSIT", "WITHDRAW", "BUY", "SELL"],
  });

  const { transactions: realtimeTransactions } = useTrenchSocket(
    onChainTrenchId ?? null,
    { autoInvalidate: true, dbTrenchId: trenchId },
  );

  const { balance: turnkeyBalance } = useTurnkeyBalance(turnkeyAddress);
  const { slot: currentSlot } = useSlotSubscription();

  useEffect(() => {
    trackPageView({ page_name: "arena" });
  }, []);

  const currentRound: ArenaRound | null = useMemo(() => {
    return trenchToArenaRound(trenchData ?? null, currentSlot, leaderboardData);
  }, [trenchData, currentSlot, leaderboardData]);

  const rankings = useMemo(() => {
    return leaderboardToRankings(
      leaderboardData,
      trenchData?.totalDepositedSol,
    );
  }, [leaderboardData, trenchData?.totalDepositedSol]);

  const currentUserRanking = useMemo(() => {
    return getCurrentUserRanking(
      leaderboardData,
      trenchData?.totalDepositedSol,
    );
  }, [leaderboardData, trenchData?.totalDepositedSol]);

  const thirdPlaceTokenAmount = useMemo(() => {
    return getThirdPlaceTokenAmount(leaderboardData);
  }, [leaderboardData]);

  const activities = useMemo(() => {
    const realtimeTxs = realtimeTransactions.map((tx) => ({
      id: tx.id,
      trenchId: tx.trenchId,
      txType: tx.txType as "DEPOSIT" | "WITHDRAW" | "BUY" | "SELL" | "CLAIM",
      userAddress: tx.userAddress,
      agentName:
        tx.agentName ||
        (tx.userAddress
          ? `Agent ${tx.userAddress.slice(0, 8)}`
          : "Unknown Agent"),
      solAmount: tx.solAmount,
      tokenAmount: tx.tokenAmount,
      totalDeposited: tx.totalDeposited,
      signature: tx.signature,
      slot: tx.slot,
      blockTime: tx.blockTime,
      createdAt: tx.createdAt,
    }));

    const realtimeIds = new Set(realtimeTxs.map((tx) => tx.id));
    const fetchedTxs = (transactionsData?.transactions ?? []).filter(
      (tx) => !realtimeIds.has(tx.id),
    );
    const allTransactions = [...realtimeTxs, ...fetchedTxs];

    return transactionsToActivities(allTransactions);
  }, [transactionsData, realtimeTransactions]);

  const handleLoadAgentDetail = useCallback(
    async (userAddress: string): Promise<AgentDetailData | null> => {
      const agent = rankings.find((r) => r.userAddress === userAddress);

      try {
        const panelData =
          await agentApi.getAgentPanelByUserAddress(userAddress);

        return {
          agentId: panelData.id,
          agentName: panelData.name,
          agentAvatar: panelData.logo || agent?.agentAvatar,
          solBalance: 0,
          tokenBalance: agent?.tokenAmount ?? 0,
          roundPnl: panelData.roundPnl
            ? parseFloat(panelData.roundPnl) / 1e9
            : 0,
          totalPnl: panelData.totalPnl,
          recentActions: [],
        };
      } catch {
        if (agent) {
          return {
            agentId: agent.agentId,
            agentName: agent.agentName,
            agentAvatar: agent.agentAvatar,
            solBalance: 0,
            tokenBalance: agent.tokenAmount,
            roundPnl: agent.pnlSol,
            totalPnl: agent.pnlSol,
            recentActions: [],
          };
        }
        return null;
      }
    },
    [rankings],
  );

  if (isTrenchLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-eva-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-eva-text-dim font-mono text-sm">
              LOADING ARENA...
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (trenchError) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-eva-danger font-mono text-sm mb-2">
              ERROR LOADING ARENA
            </p>
            <p className="text-eva-text-dim text-xs">{String(trenchError)}</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!currentRound) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-eva-text font-mono text-lg mb-2">
              NO ACTIVE ROUND
            </p>
            <p className="text-eva-text-dim text-sm">
              Waiting for next round to start...
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const renderPhasePanel = () => {
    if (currentRound.phase === "betting") {
      return <PreMarketBetting round={currentRound} />;
    }

    if (currentRound.phase === "trading") {
      if (!currentRound.hasBets) {
        return <RoundSkipped round={currentRound} />;
      }
      return <TradingPhaseChart round={currentRound} />;
    }

    if (currentRound.phase === "liquidation") {
      const settlementUser = (() => {
        const inTop3 = rankings.find((r) => r.isCurrentUser);
        if (inTop3) {
          return {
            rank: inTop3.rank,
            agentName: inTop3.agentName,
            agentAvatar: inTop3.agentAvatar,
            prizeAmount: inTop3.prizeAmount,
            pnlSol: inTop3.pnlSol,
          };
        }
        if (currentUserRanking) {
          return {
            rank: currentUserRanking.rank,
            agentName: currentUserRanking.agentName,
            agentAvatar: currentUserRanking.agentAvatar,
            prizeAmount: currentUserRanking.prizeAmount,
            pnlSol: currentUserRanking.pnlSol,
          };
        }
        return null;
      })();

      return (
        <RoundSettlement
          currentUserAgent={settlementUser}
          round={currentRound}
        />
      );
    }

    return <PreMarketBetting round={currentRound} />;
  };

  return (
    <DefaultLayout>
      <div className="space-y-4">
        <ArenaHeader round={currentRound} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: identical to agent version */}
          <div className="lg:col-span-2 space-y-4">
            <div>{renderPhasePanel()}</div>
            <div>
              <LiveActivity
                activities={activities}
                currentUserAddress={turnkeyAddress}
                trenchId={trenchId}
                onLoadAgentDetail={handleLoadAgentDetail}
              />
            </div>
          </div>

          {/* Right column: rankings + manual trading panel */}
          <div className="space-y-4">
            <LiveRankings
              currentUser={currentUserRanking}
              isBettingPhase={currentRound.phase === "betting"}
              isSkipped={
                currentRound.phase === "trading" && !currentRound.hasBets
              }
              rankings={rankings}
              thirdPlaceTokenAmount={thirdPlaceTokenAmount}
              trenchId={trenchId}
              onLoadAgentDetail={async (agentId) => {
                const agent = rankings.find((r) => r.agentId === agentId);
                if (!agent?.userAddress) return null;
                return handleLoadAgentDetail(agent.userAddress);
              }}
            />

            {isAuthenticated && <ManualTradingPanel />}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
