/**
 * Portal Entry Point - Minimal
 * Renders ProfileEditorView directly with userId from WordPress
 */

import { createRoot } from "react-dom/client";
import { ProfileEditProvider } from './contexts/ProfileEditContext';
import { ProfileEditorView } from './components/ProfileEditorView';
import "./index.css";

const portalRoot = document.getElementById("frs-users-portal-root");

if (portalRoot) {
  const config = (window as any).frsPortalConfig;
  const userId = config?.userId?.toString() || config?.currentUser?.id?.toString();

  createRoot(portalRoot).render(
    userId ? (
      <ProfileEditProvider>
        <ProfileEditorView userId={userId} />
      </ProfileEditProvider>
    ) : (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please <a href="/wp-login.php" className="text-blue-600 underline">log in</a> to view your profile</p>
      </div>
    )
  );
}
