import type { ArenaRound, AgentRanking } from "@/types";
import type { AgentDetailData } from "@/components/arena/agent-detail-modal";

import { useCallback, useMemo, useState } from "react";

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
  FloatingThinkButton,
  ThinkListPanel,
} from "@/components/arena";
import { EditAgentModal, EvolveMeDrawer, PauseRequiredModal, StartTimingModal } from "@/components/agent";
import {
  useCurrentTrench,
  useLeaderboard,
  useTrenchTransactions,
  useUserTransactions,
  useMyAgents,
  useAgent,
  useTrenchSocket,
  useSlotSubscription,
  useFirstVisit,
  useToggleAgentStatus,
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
import {
  mockArenaRound,
  mockRankings,
  mockActivities,
} from "@/services/mock";
import { agentApi } from "@/services/api";

// Feature flag for using real API data
const USE_REAL_DATA = true;

export default function ArenaPage() {
  // Auth state
  const { isAuthenticated } = useIsAuthenticated();
  const { user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress;

  // First visit detection for welcome modal
  const { isFirstVisit, markVisited } = useFirstVisit();

  // Fetch current trench from API
  const {
    data: trenchData,
    isLoading: isTrenchLoading,
    error: trenchError,
  } = useCurrentTrench();

  // Get trench ID for dependent queries (database primary key for REST APIs)
  const trenchId = trenchData?.id;
  // Get on-chain trench ID for WebSocket subscription
  // trenchData.trenchId may be in format "eva-916", but WebSocket expects just the number
  const onChainTrenchId = trenchData?.trenchId
    ? parseInt(trenchData.trenchId.replace(/^eva-/, ""), 10)
    : undefined;

  // Fetch leaderboard
  const { data: leaderboardData } = useLeaderboard(trenchId);

  // Fetch recent transactions
  const { data: transactionsData } = useTrenchTransactions(trenchId, {
    limit: 10,
    txType: ["DEPOSIT", "WITHDRAW", "BUY", "SELL"],
  });

  // Subscribe to real-time updates (uses on-chain trenchId)
  const { isConnected, transactions: realtimeTransactions } = useTrenchSocket(
    onChainTrenchId ?? null,
    {
      autoInvalidate: true,
      // Pass database ID for query invalidation
      dbTrenchId: trenchId,
    },
  );

  // Fetch user's agents (with polling to detect WAITING -> ACTIVE transitions)
  const { data: agentsData, refetch: refetchAgents } = useMyAgents(undefined, { polling: true });
  const userAgents = agentsData?.agents ?? [];
  const hasAgent = userAgents.length > 0;
  const primaryAgent = userAgents[0];

  // Fetch user's buy/sell transactions for chart markers
  // Use the primary agent's turnkey address when available
  const { data: userBuySellData } = useUserTransactions(
    trenchId,
    {
      userAddress: primaryAgent?.turnkeyAddress,
      txType: ["BUY", "SELL"],
      limit: 100, // Get all buy/sell transactions for the chart
    },
    { polling: true }
  );

  // Fetch full agent detail for edit modal
  const { data: agentDetail, refetch: refetchAgentDetail } = useAgent(primaryAgent?.id);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Start timing modal state
  const [isStartTimingModalOpen, setIsStartTimingModalOpen] = useState(false);

  // Pause required modal state
  const [isPauseRequiredModalOpen, setIsPauseRequiredModalOpen] = useState(false);

  // Evolve Me drawer state
  const [isEvolveMeOpen, setIsEvolveMeOpen] = useState(false);

  // Think list panel state
  const [isThinkPanelOpen, setIsThinkPanelOpen] = useState(false);

  // Right sidebar tab state
  const [rightSidebarTab, setRightSidebarTab] = useState<"agent" | "rankings">("agent");

  // Toggle agent status mutation
  const toggleAgentStatus = useToggleAgentStatus();

  // Subscribe to Turnkey wallet balance updates via WebSocket
  const { balance: turnkeyBalance } = useTurnkeyBalance(turnkeyAddress);

  // Subscribe to real-time Solana slot updates via WebSocket
  const { slot: currentSlot } = useSlotSubscription();

  // Convert backend data to UI format
  const currentRound: ArenaRound | null = useMemo(() => {
    if (!USE_REAL_DATA) return mockArenaRound;

    return trenchToArenaRound(trenchData ?? null, currentSlot, leaderboardData);
  }, [trenchData, currentSlot, leaderboardData]);

  const rankings = useMemo(() => {
    if (!USE_REAL_DATA) return mockRankings;

    return leaderboardToRankings(
      leaderboardData,
      trenchData?.totalDepositedSol,
    );
  }, [leaderboardData, trenchData?.totalDepositedSol]);

  const currentUserRanking = useMemo(() => {
    if (!USE_REAL_DATA) return null;

    return getCurrentUserRanking(
      leaderboardData,
      trenchData?.totalDepositedSol,
    );
  }, [leaderboardData, trenchData?.totalDepositedSol]);

  const thirdPlaceTokenAmount = useMemo(() => {
    if (!USE_REAL_DATA) return 0;

    return getThirdPlaceTokenAmount(leaderboardData);
  }, [leaderboardData]);

  // Calculate user's agent ranking info
  const userAgentRankingInfo = useMemo(() => {
    if (!primaryAgent?.turnkeyAddress || rankings.length === 0) {
      return { rank: undefined, gapToTop3: undefined, totalAgents: undefined };
    }

    // Find user's rank in the rankings list
    const userRankIndex = rankings.findIndex(
      (r) => r.userAddress === primaryAgent.turnkeyAddress
    );

    if (userRankIndex === -1) {
      return { rank: undefined, gapToTop3: undefined, totalAgents: rankings.length };
    }

    const rank = userRankIndex + 1; // Convert 0-based index to 1-based rank
    const userTokenAmount = rankings[userRankIndex]?.tokenAmount ?? 0;

    // Calculate gap to top 3 (difference from 3rd place)
    let gapToTop3 = 0;
    if (rank > 3 && thirdPlaceTokenAmount > 0) {
      gapToTop3 = Math.max(0, thirdPlaceTokenAmount - userTokenAmount);
    }

    return {
      rank,
      gapToTop3,
      totalAgents: rankings.length,
    };
  }, [primaryAgent?.turnkeyAddress, rankings, thirdPlaceTokenAmount]);

  const activities = useMemo(() => {
    if (!USE_REAL_DATA) return mockActivities;
    // Combine real-time and fetched transactions, deduplicating by ID
    const realtimeTxs = realtimeTransactions.map((tx) => ({
      id: tx.id,
      trenchId: tx.trenchId,
      txType: tx.txType as "DEPOSIT" | "WITHDRAW" | "BUY" | "SELL" | "CLAIM",
      userAddress: tx.userAddress,
      agentName: tx.agentName || (tx.userAddress ? `Agent ${tx.userAddress.slice(0, 8)}` : "Unknown Agent"),
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

  // Handle loading agent detail data for modal (used by LiveRankings)
  const handleLoadAgentDetail = useCallback(
    async (agentId: string): Promise<AgentDetailData | null> => {
      // Find the agent in rankings to get userAddress
      const agent = rankings.find((r) => r.agentId === agentId);
      if (!agent?.userAddress) {
        console.warn("Agent not found in rankings or missing userAddress:", agentId);
        return null;
      }

      try {
        const panelData = await agentApi.getAgentPanelByUserAddress(agent.userAddress);
        
        // Convert AgentPanelDto to AgentDetailData
        return {
          agentId: panelData.id,
          agentName: panelData.name,
          agentAvatar: panelData.logo,
          solBalance: 0, // Not provided by panel API, modal will show from ranking
          tokenBalance: agent.tokenAmount,
          roundPnl: panelData.roundPnl
            ? parseFloat(panelData.roundPnl) / 1e9 // Convert lamports to SOL
            : 0,
          totalPnl: panelData.totalPnl,
          recentActions: [], // Loaded by modal via useUserTransactions hook
        };
      } catch (error) {
        console.error("Failed to load agent panel data:", error);
        return null;
      }
    },
    [rankings],
  );

  // Handle loading agent detail data by userAddress (used by LiveActivity)
  const handleLoadAgentDetailByUserAddress = useCallback(
    async (userAddress: string): Promise<AgentDetailData | null> => {
      // Find agent in rankings to get avatar and tokenAmount if available
      const agent = rankings.find((r) => r.userAddress === userAddress);
      
      try {
        const panelData = await agentApi.getAgentPanelByUserAddress(userAddress);
        
        // Convert AgentPanelDto to AgentDetailData
        return {
          agentId: panelData.id,
          agentName: panelData.name,
          agentAvatar: panelData.logo || agent?.agentAvatar,
          solBalance: 0, // Not provided by panel API, modal will show from RPC
          tokenBalance: agent?.tokenAmount ?? 0,
          roundPnl: panelData.roundPnl
            ? parseFloat(panelData.roundPnl) / 1e9 // Convert lamports to SOL
            : 0,
          totalPnl: panelData.totalPnl,
          recentActions: [], // Loaded by modal via useUserTransactions hook
        };
      } catch (error) {
        console.error("Failed to load agent panel data:", error);
        // Fallback to rankings data if API fails
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

      return (
        <TradingPhaseChart
          round={currentRound}
          userTransactions={userBuySellData?.transactions}
        />
      );
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
            <LiveActivity
              activities={activities}
              trenchId={trenchId}
              onLoadAgentDetail={handleLoadAgentDetailByUserAddress}
              rankings={rankings}
              prizePool={currentRound.totalPrizePool}
            />
          </div>

          {/* Right column: Tabs for Agent/Rankings */}
          <div className="space-y-4">
            {/* Show tabs only when user has an agent */}
            {isAuthenticated && hasAgent ? (
              <div className="bg-eva-card border border-eva-border rounded-lg overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-eva-border">
                  <button
                    className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      rightSidebarTab === "agent"
                        ? "text-eva-primary border-b-2 border-eva-primary bg-eva-dark/50"
                        : "text-eva-text-dim hover:text-eva-text hover:bg-eva-dark/30"
                    }`}
                    onClick={() => setRightSidebarTab("agent")}
                  >
                    My Agent
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      rightSidebarTab === "rankings"
                        ? "text-eva-primary border-b-2 border-eva-primary bg-eva-dark/50"
                        : "text-eva-text-dim hover:text-eva-text hover:bg-eva-dark/30"
                    }`}
                    onClick={() => setRightSidebarTab("rankings")}
                  >
                    Rankings
                  </button>
                </div>

                {/* Tab Content */}
                <div>
                  {rightSidebarTab === "agent" && primaryAgent && (
                    <AgentDashboardCard
                      agent={{
                        id: primaryAgent.id,
                        name: primaryAgent.name,
                        avatar: primaryAgent.logo,
                        createdAt: new Date(primaryAgent.createdAt),
                        status:
                          primaryAgent.status === "ACTIVE" ? "running" : primaryAgent.status === "WAITING" ? "waiting" : "paused",
                        balance: turnkeyBalance || primaryAgent.currentBalance,
                        totalDeposit: 0,
                        totalWithdraw: 0,
                        pnl: primaryAgent.totalPnl,
                        frequency: parseInt(primaryAgent.frequency) || 10,
                      }}
                      isToggling={toggleAgentStatus.isPending}
                      roundPnl={trenchData?.pnlSol ? parseFloat(trenchData.pnlSol) / 1e9 : 0}
                      solBalance={turnkeyBalance || primaryAgent.currentBalance}
                      tokenBalance={trenchData?.tokenBalance ? parseFloat(trenchData.tokenBalance) / 1e6 : 0}
                      tokenChangePercent={(trenchData?.tokenBalance ? parseFloat(trenchData.tokenBalance) / 1e9 : 0) * 100}
                      totalPnl={primaryAgent.totalPnl}
                      trenchId={trenchId}
                      turnkeyAddress={primaryAgent.turnkeyAddress}
                      rank={userAgentRankingInfo.rank}
                      gapToTop3={userAgentRankingInfo.gapToTop3}
                      totalAgents={userAgentRankingInfo.totalAgents}
                      onEvolveMe={() => setIsEvolveMeOpen(true)}
                      onEditName={() => {
                        if (primaryAgent.status === "ACTIVE") {
                          setIsPauseRequiredModalOpen(true);
                        } else {
                          setIsEditModalOpen(true);
                        }
                      }}
                      onPauseSystem={() => toggleAgentStatus.mutate({ id: primaryAgent.id })}
                      onStartSystem={() => setIsStartTimingModalOpen(true)}
                      embedded={true}
                    />
                  )}
                  {rightSidebarTab === "rankings" && (
                    <LiveRankings
                      rankings={rankings}
                      currentUser={currentUserRanking}
                      thirdPlaceTokenAmount={thirdPlaceTokenAmount}
                      isSkipped={currentRound.phase === "trading" && !currentRound.hasBets}
                      isBettingPhase={currentRound.phase === "betting"}
                      trenchId={trenchId}
                      onLoadAgentDetail={handleLoadAgentDetail}
                      embedded={true}
                      activities={activities}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* No tabs - show rankings and welcome/create card separately */}
                <LiveRankings
                  rankings={rankings}
                  currentUser={currentUserRanking}
                  thirdPlaceTokenAmount={thirdPlaceTokenAmount}
                  isSkipped={currentRound.phase === "trading" && !currentRound.hasBets}
                  isBettingPhase={currentRound.phase === "betting"}
                  trenchId={trenchId}
                  onLoadAgentDetail={handleLoadAgentDetail}
                  activities={activities}
                />
                {!isAuthenticated && <WelcomeCard />}
                {isAuthenticated && !hasAgent && <CreateAgentCard />}
              </>
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

      {/* Start Timing Modal */}
      {primaryAgent && (
        <StartTimingModal
          isOpen={isStartTimingModalOpen}
          onClose={() => setIsStartTimingModalOpen(false)}
          onSelectTiming={(timing) => {
            const immediate = timing === "now";
            toggleAgentStatus.mutate({ id: primaryAgent.id, immediate });
            setIsStartTimingModalOpen(false);
          }}
          isLoading={toggleAgentStatus.isPending}
        />
      )}

      {/* Pause Required Modal */}
      {primaryAgent && (
        <PauseRequiredModal
          isOpen={isPauseRequiredModalOpen}
          onClose={() => setIsPauseRequiredModalOpen(false)}
          onPause={async () => {
            // Pause the agent first
            await toggleAgentStatus.mutateAsync({ id: primaryAgent.id });
            // Close pause required modal
            setIsPauseRequiredModalOpen(false);
            // Open edit modal
            setIsEditModalOpen(true);
          }}
          isLoading={toggleAgentStatus.isPending}
        />
      )}

      {/* Evolve Me Drawer */}
      {primaryAgent && agentDetail && (
        <EvolveMeDrawer
          isOpen={isEvolveMeOpen}
          onClose={() => setIsEvolveMeOpen(false)}
          agentId={primaryAgent.id}
          currentBettingPrompt={agentDetail.bettingStrategyPrompt || ""}
          currentTradingPrompt={agentDetail.tradingStrategyPrompt || ""}
          onSuccess={() => {
            refetchAgents();
            refetchAgentDetail();
          }}
        />
      )}

      {/* Floating Think Button & Panel - Only show when authenticated with agent */}
      {isAuthenticated && hasAgent && (
        <>
          <FloatingThinkButton
            isOpen={isThinkPanelOpen}
            onToggle={() => setIsThinkPanelOpen(!isThinkPanelOpen)}
          />
          <ThinkListPanel
            isOpen={isThinkPanelOpen}
            onClose={() => setIsThinkPanelOpen(false)}
          />
        </>
      )}
    </DefaultLayout>
  );
}
