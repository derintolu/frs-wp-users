/**
 * Public Profile Entry Point
 *
 * Entry point for public-facing profile view
 */

import { createRoot } from "react-dom/client";
import { ProfileEditorView } from './components/ProfileEditorView';
import { ProfileEditProvider } from './contexts/ProfileEditContext';
import "./index.css";

// WordPress integration - look for the public profile root element
const publicProfileRoot = document.getElementById("frs-public-profile-root");

if (publicProfileRoot) {
  const profileSlug = publicProfileRoot.dataset.profileSlug || '';
  const profileId = publicProfileRoot.dataset.profileId || '';

  // Get config from WordPress
  const config = (window as any).frsPublicProfileConfig || {};

  console.log('Public Profile mounting with config:', config);
  console.log('Profile Slug:', profileSlug);
  console.log('Profile ID:', profileId);

  createRoot(publicProfileRoot).render(
    <ProfileEditProvider>
      <ProfileEditorView slug={profileSlug} />
    </ProfileEditProvider>
  );

  console.log('Public Profile mounted successfully');
}
