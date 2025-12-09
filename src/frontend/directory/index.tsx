import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Directory from './Directory';
import { ProfileDetailPage } from './components/ProfileDetailPage';
import { ProfileEditProvider } from '@/frontend/portal/contexts/ProfileEditContext';
import '@/frontend/portal/index.css';

// Mount the Directory app with routing
const container = document.getElementById('frs-directory-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <HashRouter>
      <ProfileEditProvider>
        <Routes>
          <Route element={<Directory />} path="/" />
          <Route element={<ProfileDetailPage />} path="/lo/:slug" />
          <Route element={<ProfileDetailPage />} path="/agent/:slug" />
          <Route element={<ProfileDetailPage />} path="/staff/:slug" />
          <Route element={<ProfileDetailPage />} path="/leadership/:slug" />
          <Route element={<ProfileDetailPage />} path="/assistant/:slug" />
        </Routes>
      </ProfileEditProvider>
    </HashRouter>
  );
}
