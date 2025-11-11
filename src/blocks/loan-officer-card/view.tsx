import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { ProfileCard } from '../../components/ProfileCard';

interface BlockAttributes {
	userId: number;
	profileId: number;
	size: 'small' | 'medium' | 'large';
	detailLevel: 'minimal' | 'standard' | 'full';
	audience: 'internal' | 'external';
	showContactButtons: boolean;
}

interface Profile {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	email: string;
	phone_number?: string;
	mobile_number?: string;
	job_title?: string;
	headshot_url?: string;
	biography?: string;
	nmls_number?: string;
	city_state?: string;
	region?: string;
	office?: string;
	specialties_lo?: string[];
	languages?: string[];
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	twitter_url?: string;
	youtube_url?: string;
	tiktok_url?: string;
}

function LoanOfficerCardView({ attributes }: { attributes: BlockAttributes }) {
	const { profileId, size, showContactButtons } = attributes;
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
				<div className="animate-pulse w-full max-w-md">
					<div className="h-96 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="frs-loan-officer-card flex justify-center">
				<div className="w-full max-w-md p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
					<p className="text-gray-500">No profile selected</p>
					<p className="text-sm text-gray-400 mt-2">Please select a profile from the block settings</p>
				</div>
			</div>
		);
	}

	// Size mapping for ProfileCard
	const sizeClasses = {
		small: 'max-w-sm',
		medium: 'max-w-md',
		large: 'max-w-2xl',
	};

	return (
		<div className="frs-loan-officer-card flex justify-center">
			<ProfileCard
				profile={profile}
				showQRCode={false}
				showContactButtons={showContactButtons}
				className={sizeClasses[size]}
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
