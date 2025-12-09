import { ProfileEditorView } from './ProfileEditorView';

interface MyProfileProps {
  autoEdit?: boolean;
  userId: string;
}

export function MyProfile({ userId }: MyProfileProps) {
  return <ProfileEditorView userId={userId} />;
}
