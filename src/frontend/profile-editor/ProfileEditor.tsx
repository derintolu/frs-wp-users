import React from 'react';
import { ProfileSection } from './ProfileSection';

interface ProfileEditorProps {
	profileId: number;
	userId: number;
}

export default function ProfileEditor({ profileId, userId }: ProfileEditorProps) {
	return <ProfileSection profileId={profileId} userId={userId} activeTab="personal" autoEdit={true} />;
}
