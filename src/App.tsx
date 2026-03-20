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
import { AlphaGuard } from "@/components/auth";
import { setReferralCode } from "@/lib/referral-code";

function ReferralRedirect() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  if (ref) {
    setReferralCode(ref);
  }
  return <Navigate replace to="/" />;
}

function App() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  return (
    <Routes>
      {/* Referral landing — saves code then redirects to home */}
      <Route path="/join" element={<ReferralRedirect />} />

      {/* All routes protected by AlphaGuard - requires auth + whitelist */}
      <Route
        element={
          <AlphaGuard>
            <ArenaPage />
          </AlphaGuard>
        }
        path="/"
      />

      {/* Create agent - requires auth + whitelist */}
      <Route
        element={
          <AlphaGuard>
            <CreateAgentPage />
          </AlphaGuard>
        }
        path="/create-agent"
      />

      {/* My Agent - requires auth + whitelist */}
      <Route
        element={
          <AlphaGuard>
            <MyAgentPage />
          </AlphaGuard>
        }
        path="/my-agent"
      />

      {/* Leaderboard - requires auth + whitelist */}
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

export default App;
