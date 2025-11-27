import { useParams } from 'react-router-dom';
import { ProfileEditorView } from '@/frontend/portal/components/ProfileEditorView';

export function ProfileDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return <ProfileEditorView slug={slug} />;
}
