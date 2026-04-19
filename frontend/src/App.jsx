import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Log from './pages/Log';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Timeline from './pages/Timeline';

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/log"       element={<Log />} />
        <Route path="/history"   element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/timeline"  element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  );
}
