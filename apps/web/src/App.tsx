import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { tgReady } from './utils/telegram';
import Onboarding from './pages/Onboarding';
import ContactShare from './pages/ContactShare';
import ClientLayout from './pages/client/ClientLayout';
import ClientHome from './pages/client/ClientHome';
import ClientSearch from './pages/client/ClientSearch';
import ClientFavorites from './pages/client/ClientFavorites';
import ClientProfile from './pages/client/ClientProfile';
import ServiceDetail from './pages/ServiceDetail';
import AllCategories from './pages/client/AllCategories';
import QuickServiceDetail from './pages/client/QuickServiceDetail';
import MasterLayout from './pages/master/MasterLayout';
import MasterHome from './pages/master/MasterHome';
import MasterLeads from './pages/master/MasterLeads';
import MasterProfile from './pages/master/MasterProfile';
import CreateService from './pages/master/CreateService';
import EditService from './pages/master/EditService';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Placeholder from './pages/Placeholder';

export default function App() {
  const { user, onboarded, activeRole } = useStore();

  useEffect(() => {
    tgReady();
  }, []);

  if (!onboarded) {
    return <Onboarding />;
  }

  if (!user) {
    return <ContactShare />;
  }

  // Determine which role's UI to show. Prefer activeRole; fall back to whichever flag is set.
  const role: 'master' | 'client' =
    activeRole ?? (user.isMaster ? 'master' : user.isClient ? 'client' : 'client');

  // Shared routes (available in both modes)
  const sharedRoutes = (
    <>
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings/language" element={<Settings />} />
      <Route path="/settings/general" element={<Placeholder titleKey="profile.action.settings" />} />
      <Route path="/settings/privacy" element={<Placeholder titleKey="profile.action.privacy" />} />
      <Route path="/settings/help" element={<Placeholder titleKey="profile.action.help" />} />
      <Route path="/settings/rate" element={<Placeholder titleKey="profile.action.rate" />} />
    </>
  );

  if (role === 'master') {
    return (
      <Routes>
        <Route element={<MasterLayout />}>
          <Route path="/" element={<MasterHome />} />
          <Route path="/leads" element={<MasterLeads />} />
          <Route path="/profile" element={<MasterProfile />} />
        </Route>
        <Route path="/service/create" element={<CreateService />} />
        <Route path="/service/edit/:id" element={<EditService />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        {sharedRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<ClientHome />} />
        <Route path="/search" element={<ClientSearch />} />
        <Route path="/favorites" element={<ClientFavorites />} />
        <Route path="/profile" element={<ClientProfile />} />
      </Route>
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route path="/quick-service/:id" element={<QuickServiceDetail />} />
      <Route path="/categories" element={<AllCategories />} />
      {sharedRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
