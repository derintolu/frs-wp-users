import { ProfileSection } from '../ProfileSection';

interface MyProfileProps {
  userId: string;
  autoEdit?: boolean;
}

export function MyProfile({ userId, autoEdit = false }: MyProfileProps) {
  return (
    <ProfileSection
      userRole="loan-officer"
      userId={userId}
      activeTab="personal"
      autoEdit={autoEdit}
    />
  );
}
