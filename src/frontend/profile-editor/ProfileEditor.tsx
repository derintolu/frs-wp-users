import React from 'react';
import { ProfileDashboard } from './ProfileDashboard';

interface ProfileEditorProps {
	profileId: number;
	userId: number;
}

export default function ProfileEditor({ profileId, userId }: ProfileEditorProps) {
	return <ProfileDashboard autoEdit={false} profileId={profileId} userId={userId} />;
}
