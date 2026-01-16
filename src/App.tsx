import { Route, Routes } from "react-router-dom";

import ArenaPage from "@/pages/arena";
import MyAgentPage from "@/pages/my-agent";
import CreateAgentPage from "@/pages/create-agent";
import { AlphaGuard } from "@/components/auth";

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;
