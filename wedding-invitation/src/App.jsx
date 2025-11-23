import { Routes, Route } from 'react-router-dom';
import InvitationPage from './pages/InvitationPage';
import SeatingChartPage from './pages/SeatingChartPage';
import AdminSeatingChartPage from './pages/AdminSeatingChartPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<InvitationPage />} />
      <Route path="/seating" element={<SeatingChartPage />} />
      <Route
        path="/admin/seating"
        element={
          <ProtectedRoute>
            <AdminSeatingChartPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
