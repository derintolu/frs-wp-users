import { ProfileEditorView } from './ProfileEditorView';

interface MyProfileProps {
  userId: string;
  autoEdit?: boolean;
}

export function MyProfile({ userId }: MyProfileProps) {
  return <ProfileEditorView userId={userId} />;
}
