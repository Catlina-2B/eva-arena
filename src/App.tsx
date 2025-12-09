import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AgentPage } from './pages/AgentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/agents" element={<AgentPage />} />
    </Routes>
  );
}

export default App;
