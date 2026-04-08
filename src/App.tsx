import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";

import ArenaPage from "@/pages/arena";
import MyAgentPage from "@/pages/my-agent";
import CreateAgentPage from "@/pages/create-agent";
import LeaderboardPage from "@/pages/leaderboard";
import ManualArenaPage from "@/pages/manual-arena";
import ManualHistoryPage from "@/pages/manual-history";
import { AlphaGuard } from "@/components/auth";
import { useAppMode } from "@/contexts/app-mode";
import { setReferralCode } from "@/lib/referral-code";

function ReferralRedirect() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  if (ref) {
    setReferralCode(ref);
  }
  return <Navigate replace to="/" />;
}

function AgentRoutes() {
  return (
    <Routes>
      <Route path="/join" element={<ReferralRedirect />} />
      <Route
        element={
          <AlphaGuard>
            <ArenaPage />
          </AlphaGuard>
        }
        path="/"
      />
      <Route
        element={
          <AlphaGuard>
            <CreateAgentPage />
          </AlphaGuard>
        }
        path="/create-agent"
      />
      <Route
        element={
          <AlphaGuard>
            <MyAgentPage />
          </AlphaGuard>
        }
        path="/my-agent"
      />
      <Route
        element={
          <AlphaGuard>
            <LeaderboardPage />
          </AlphaGuard>
        }
        path="/leaderboard"
      />
    </Routes>
  );
}

function ManualRoutes() {
  return (
    <Routes>
      <Route path="/join" element={<ReferralRedirect />} />
      <Route
        element={
          <AlphaGuard>
            <ManualArenaPage />
          </AlphaGuard>
        }
        path="/"
      />
      <Route
        element={
          <AlphaGuard>
            <LeaderboardPage />
          </AlphaGuard>
        }
        path="/leaderboard"
      />
      <Route
        element={
          <AlphaGuard>
            <ManualHistoryPage />
          </AlphaGuard>
        }
        path="/history"
      />
    </Routes>
  );
}

function App() {
  const [searchParams] = useSearchParams();
  const { isManual } = useAppMode();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  return isManual ? <ManualRoutes /> : <AgentRoutes />;
}

export default App;
