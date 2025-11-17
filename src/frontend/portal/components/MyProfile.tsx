import { PublicProfileView } from './PublicProfileView';

interface MyProfileProps {
  userId: string;
  autoEdit?: boolean;
}

export function MyProfile({ userId }: MyProfileProps) {
  return <PublicProfileView userId={userId} />;
}
