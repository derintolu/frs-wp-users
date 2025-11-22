import { useParams } from 'react-router-dom';
import { PublicProfileView } from '@/frontend/portal/components/PublicProfileView';

export function ProfileDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return <PublicProfileView slug={slug} />;
}
