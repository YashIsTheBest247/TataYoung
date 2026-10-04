import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import ReportFlood from './pages/ReportFlood.jsx';
import FamilyRegister from './pages/FamilyRegister.jsx';
import ChatbotFab from './components/ChatbotFab.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/map" element={<MapDashboard />} />
        <Route path="/report" element={<ReportFlood />} />
        <Route path="/family" element={<FamilyRegister />} />
      </Routes>
      <ChatbotFab />
    </BrowserRouter>
  );
}
