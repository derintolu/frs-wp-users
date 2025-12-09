import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { ProfileCard } from '../../components/ProfileCard';

interface BlockAttributes {
	audience: 'internal' | 'external';
	detailLevel: 'minimal' | 'standard' | 'full';
	profileId: number;
	showContactButtons: boolean;
	size: 'small' | 'medium' | 'large';
	userId: number;
}

interface Profile {
	biography?: string;
	city_state?: string;
	email: string;
	facebook_url?: string;
	first_name: string;
	full_name: string;
	headshot_url?: string;
	id: number;
	instagram_url?: string;
	job_title?: string;
	languages?: string[];
	last_name: string;
	linkedin_url?: string;
	mobile_number?: string;
	nmls_number?: string;
	office?: string;
	phone_number?: string;
	region?: string;
	specialties_lo?: string[];
	tiktok_url?: string;
	twitter_url?: string;
	youtube_url?: string;
}

function LoanOfficerCardView({ attributes }: { attributes: BlockAttributes }) {
	const { profileId, showContactButtons, size } = attributes;
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!profileId) {
			setLoading(false);
			return;
		}

		apiFetch<Profile>({ path: `/frs-users/v1/profiles/${profileId}` })
			.then((data) => {
				setProfile(data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, [profileId]);

	if (loading) {
		return (
			<div className="frs-loan-officer-card flex justify-center">
				<div className="w-full max-w-md animate-pulse">
					<div className="h-96 rounded bg-gray-200"></div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="frs-loan-officer-card flex justify-center">
				<div className="w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
					<p className="text-gray-500">No profile selected</p>
					<p className="mt-2 text-sm text-gray-400">Please select a profile from the block settings</p>
				</div>
			</div>
		);
	}

	// Size mapping for ProfileCard
	const sizeClasses = {
		large: 'max-w-2xl',
		medium: 'max-w-md',
		small: 'max-w-sm',
	};

	return (
		<div className="frs-loan-officer-card flex justify-center">
			<ProfileCard
				className={sizeClasses[size]}
				profile={profile}
				showContactButtons={showContactButtons}
				showQRCode={false}
			/>
		</div>
	);
}

// Initialize all blocks on the page
document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.wp-block-frs-users-loan-officer-card');

	blocks.forEach((block) => {
		const htmlElement = block as HTMLElement;
		const attributes = JSON.parse(
			htmlElement.dataset.attributes || '{}'
		) as BlockAttributes;

		const root = createRoot(htmlElement);
		root.render(<LoanOfficerCardView attributes={attributes} />);
	});
});
