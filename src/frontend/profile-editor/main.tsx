import React from 'react';
import ReactDOM from 'react-dom/client';
import ProfileEditor from './ProfileEditor';
import '../../admin/index.css';

// Find all profile editor containers and mount React
document.addEventListener('DOMContentLoaded', () => {
	const containers = document.querySelectorAll('.frs-profile-editor-root');

	containers.forEach((container) => {
		const profileId = container.getAttribute('data-profile-id');
		const userId = container.getAttribute('data-user-id');

		if (profileId && userId) {
			const root = ReactDOM.createRoot(container as HTMLElement);
			root.render(
				<React.StrictMode>
					<ProfileEditor
						profileId={parseInt(profileId)}
						userId={parseInt(userId)}
					/>
				</React.StrictMode>
			);
		}
	});
});
