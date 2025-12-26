import type { ArenaRound } from "@/types";

import { useMemo, useState } from "react";

import DefaultLayout from "@/layouts/default";
import {
  ArenaHeader,
  PreMarketBetting,
  TradingPhaseChart,
  RoundSettlement,
  RoundSkipped,
  LiveActivity,
  LiveRankings,
  WelcomeCard,
  CreateAgentCard,
  AgentDashboardCard,
  WelcomeOnboardingModal,
} from "@/components/arena";
import { EditAgentModal } from "@/components/agent";
import {
  useCurrentTrench,
  useLeaderboard,
  useTrenchTransactions,
  useMyAgents,
  useAgent,
  useTrenchSocket,
  useSlotSubscription,
  useFirstVisit,
  useToggleAgentStatus,
  useTurnkeyBalance,
} from "@/hooks";
import { useIsAuthenticated } from "@/hooks/use-auth";
import {
  trenchToArenaRound,
  leaderboardToRankings,
  transactionsToActivities,
} from "@/lib/trench-utils";
import {
  mockArenaRound,
  mockRankings,
  mockActivities,
} from "@/services/mock";

// Feature flag for using real API data
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_DATA === "true";

export default function ArenaPage() {
  // Auth state
  const { isAuthenticated } = useIsAuthenticated();

  // First visit detection for welcome modal
  const { isFirstVisit, markVisited } = useFirstVisit();

  // Fetch current trench from API
  const {
    data: trenchData,
    isLoading: isTrenchLoading,
    error: trenchError,
  } = useCurrentTrench();

  // Get trench ID for dependent queries
  const trenchId = trenchData?.id;

  // Fetch leaderboard
  const { data: leaderboardData } = useLeaderboard(trenchId);

  // Fetch recent transactions
  const { data: transactionsData } = useTrenchTransactions(trenchId, {
    limit: 10,
  });

  // Subscribe to real-time updates
  const { isConnected, transactions: realtimeTransactions } = useTrenchSocket(
    trenchId ?? null,
    {
      autoInvalidate: true,
    },
  );

  // Fetch user's agents
  const { data: agentsData, refetch: refetchAgents } = useMyAgents();
  const userAgents = agentsData?.agents ?? [];
  const hasAgent = userAgents.length > 0;
  const primaryAgent = userAgents[0];

  // Fetch full agent detail for edit modal
  const { data: agentDetail, refetch: refetchAgentDetail } = useAgent(primaryAgent?.id);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Toggle agent status mutation
  const toggleAgentStatus = useToggleAgentStatus();

  // Subscribe to Turnkey wallet balance updates via WebSocket
  const { balance: turnkeyBalance } = useTurnkeyBalance(primaryAgent?.turnkeyAddress);

  // Subscribe to real-time Solana slot updates via WebSocket
  const { slot: currentSlot } = useSlotSubscription();

  // Convert backend data to UI format
  const currentRound: ArenaRound | null = useMemo(() => {
    if (!USE_REAL_DATA) return mockArenaRound;

    return trenchToArenaRound(trenchData ?? null, currentSlot, leaderboardData);
  }, [trenchData, currentSlot, leaderboardData]);

  const rankings = useMemo(() => {
    if (!USE_REAL_DATA) return mockRankings;

    return leaderboardToRankings(leaderboardData);
  }, [leaderboardData]);

  const activities = useMemo(() => {
    if (!USE_REAL_DATA) return mockActivities;
    // Combine real-time and fetched transactions, deduplicating by ID
    const realtimeTxs = realtimeTransactions.map((tx) => ({
      id: tx.id,
      trenchId: tx.trenchId,
      txType: tx.txType as "DEPOSIT" | "WITHDRAW" | "BUY" | "SELL" | "CLAIM",
      userAddress: tx.userAddress,
      solAmount: tx.solAmount,
      tokenAmount: tx.tokenAmount,
      totalDeposited: tx.totalDeposited,
      signature: tx.signature,
      slot: tx.slot,
      blockTime: tx.blockTime,
      createdAt: tx.createdAt,
    }));

    // Get IDs from realtime transactions to filter duplicates
    const realtimeIds = new Set(realtimeTxs.map((tx) => tx.id));

    // Filter out transactions that are already in realtime (prioritize realtime)
    const fetchedTxs = (transactionsData?.transactions ?? []).filter(
      (tx) => !realtimeIds.has(tx.id),
    );

    const allTransactions = [...realtimeTxs, ...fetchedTxs];

    return transactionsToActivities(allTransactions);
  }, [transactionsData, realtimeTransactions]);

  // Loading state
  if (USE_REAL_DATA && isTrenchLoading) {
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

  // Error state
  if (USE_REAL_DATA && trenchError) {
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

  // No active trench
  if (USE_REAL_DATA && !currentRound) {
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

  // Fallback for null round (shouldn't happen but TypeScript requires it)
  if (!currentRound) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-eva-text-dim">No data available</p>
        </div>
      </DefaultLayout>
    );
  }

  // Render the appropriate panel based on phase and state
  const renderPhasePanel = () => {
    if (currentRound.phase === "betting") {
      return <PreMarketBetting round={currentRound} />;
    }

    if (currentRound.phase === "trading") {
      // Check if there were bets in the betting phase
      if (!currentRound.hasBets) {
        return <RoundSkipped round={currentRound} />;
      }

      return <TradingPhaseChart round={currentRound} />;
    }

    if (currentRound.phase === "liquidation") {
      return <RoundSettlement round={currentRound} />;
    }

    return <PreMarketBetting round={currentRound} />;
  };

  return (
    <DefaultLayout>
      {/* Welcome Onboarding Modal for first-time visitors */}
      <WelcomeOnboardingModal isOpen={isFirstVisit} onClose={markVisited} />

      <div className="space-y-4">

        {/* Development Mode Indicator */}
        {!USE_REAL_DATA && (
          <div className="flex items-center gap-2 p-3 bg-white/5 border border-eva-border/30">
            <span className="text-xs font-mono text-white/40">
              DEV MODE: Using mock data. Set VITE_USE_REAL_DATA=true to use real
              API.
            </span>
          </div>
        )}

        {/* Top row: Target Info + Phase Progress in one card */}
        <ArenaHeader round={currentRound} />

        {/* Main content: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Phase panel + Activity */}
          <div className="lg:col-span-2 space-y-4">
            {renderPhasePanel()}
            <LiveActivity activities={activities} />
          </div>

          {/* Right column: Rankings + Welcome/Agent */}
          <div className="space-y-4">
            <LiveRankings rankings={rankings} />
            {!isAuthenticated && <WelcomeCard />}
            {isAuthenticated && !hasAgent && <CreateAgentCard />}
            {isAuthenticated && hasAgent && primaryAgent && (
              <AgentDashboardCard
                agent={{
                  id: primaryAgent.id,
                  name: primaryAgent.name,
                  avatar: primaryAgent.logo,
                  createdAt: new Date(primaryAgent.createdAt),
                  status:
                    primaryAgent.status === "ACTIVE" ? "running" : "paused",
                  balance: turnkeyBalance || primaryAgent.currentBalance,
                  totalDeposit: 0, // Would need to fetch from panel
                  totalWithdraw: 0,
                  pnl: primaryAgent.totalPnl,
                  frequency: parseInt(primaryAgent.frequency) || 10,
                }}
                isToggling={toggleAgentStatus.isPending}
                roundPnl={0}
                solBalance={turnkeyBalance || primaryAgent.currentBalance}
                tokenBalance={0}
                tokenChangePercent={0}
                totalPnl={primaryAgent.totalPnl}
                trenchId={trenchId}
                onEditName={() => setIsEditModalOpen(true)}
                onPauseSystem={() => toggleAgentStatus.mutate(primaryAgent.id)}
                onStartSystem={() => toggleAgentStatus.mutate(primaryAgent.id)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Agent Modal */}
      <EditAgentModal
        agent={agentDetail ?? null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          refetchAgents();
          refetchAgentDetail();
        }}
      />
    </DefaultLayout>
  );
}
