import { Route, Routes } from "react-router-dom";

import ArenaPage from "@/pages/arena";
import MyAgentPage from "@/pages/my-agent";
import CreateAgentPage from "@/pages/create-agent";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<ArenaPage />} path="/" />

      {/* Create agent - requires auth but doesn't require existing agent */}
      <Route element={<CreateAgentPage />} path="/create-agent" />

      {/* My Agent - shows connect wallet prompt if not authenticated */}
      <Route element={<MyAgentPage />} path="/my-agent" />
    </Routes>
  );
}

export default App;
