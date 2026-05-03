import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ServicesPage from './pages/ServicesPage';
import LeadsPage from './pages/LeadsPage';
import BannersPage from './pages/BannersPage';
import QuickServicesPage from './pages/QuickServicesPage';
import NotificationsPage from './pages/NotificationsPage';
import BroadcastPage from './pages/BroadcastPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/banners" element={<BannersPage />} />
        <Route path="/quick-services" element={<QuickServicesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
