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
          <Route path="/" element={<Directory />} />
          <Route path="/lo/:slug" element={<ProfileDetailPage />} />
          <Route path="/agent/:slug" element={<ProfileDetailPage />} />
          <Route path="/staff/:slug" element={<ProfileDetailPage />} />
          <Route path="/leadership/:slug" element={<ProfileDetailPage />} />
          <Route path="/assistant/:slug" element={<ProfileDetailPage />} />
        </Routes>
      </ProfileEditProvider>
    </HashRouter>
  );
}
