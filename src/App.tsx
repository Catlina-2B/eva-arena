import { Route, Routes } from "react-router-dom";

import ArenaPage from "@/pages/arena";
import MyAgentPage from "@/pages/my-agent";
import CreateAgentPage from "@/pages/create-agent";
import { AuthGuard } from "@/components/auth";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<ArenaPage />} path="/" />

      {/* Create agent - requires auth but doesn't require existing agent */}
      <Route element={<CreateAgentPage />} path="/create-agent" />

      {/* Protected routes - require auth and agent */}
      <Route
        element={
          <AuthGuard requireAgent={true}>
            <MyAgentPage />
          </AuthGuard>
        }
        path="/my-agent"
      />
    </Routes>
  );
}

export default App;
