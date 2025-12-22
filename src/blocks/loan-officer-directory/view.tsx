import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { ProfileCardCompact } from '../../components/ProfileCardCompact';

interface BlockAttributes {
	personType: string;
	region: string;
	cardSize: 'small' | 'medium' | 'large';
	detailLevel: 'minimal' | 'standard' | 'full';
	audience: 'internal' | 'external';
	showFilters: boolean;
	showContactButtons: boolean;
	perPage: number;
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
	nmls_number?: string;
	city_state?: string;
	region?: string;
	select_person_type?: string;
	specialties_lo?: string[];
	biography?: string;
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	twitter_url?: string;
	youtube_url?: string;
	tiktok_url?: string;
	office?: string;
}

function LoanOfficerDirectoryView({ attributes }: { attributes: BlockAttributes }) {
	const { personType, region, cardSize, detailLevel, audience, showFilters, showContactButtons, perPage } = attributes;
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activePersonType, setActivePersonType] = useState(personType);
	const [activeRegion, setActiveRegion] = useState(region);

	// Fetch profiles
	useEffect(() => {
		setLoading(true);
		setError(null);

		const params = new URLSearchParams({
			per_page: perPage.toString(),
		});

		if (activePersonType) {
			params.append('type', activePersonType);
		}

		apiFetch<{ data: Profile[] }>({
			path: `/frs-users/v1/profiles?${params.toString()}`,
		})
			.then((response) => {
				let filteredProfiles = response.data || [];

				// Apply region filter if set
				if (activeRegion) {
					filteredProfiles = filteredProfiles.filter((p) => p.region === activeRegion);
				}

				setProfiles(filteredProfiles);
				setLoading(false);
			})
			.catch((err: Error) => {
				setError(err.message);
				setLoading(false);
			});
	}, [activePersonType, activeRegion, perPage]);

	const getInitials = (firstName: string, lastName: string): string => {
		return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
	};

	const cardSizeClass = {
		small: 'max-w-xs',
		medium: 'max-w-md',
		large: 'max-w-2xl',
	}[cardSize];

	const avatarSizeClass = {
		small: 'h-12 w-12 text-sm',
		medium: 'h-16 w-16 text-base',
		large: 'h-20 w-20 text-lg',
	}[cardSize];

	const gridColsClass = {
		small: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
		medium: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
		large: 'grid-cols-1 lg:grid-cols-2',
	}[cardSize];

	return (
		<div className="loan-officer-directory">

			{/* Filters */}
			{showFilters && (
				<div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Person Type</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={activePersonType}
								onChange={(e) => setActivePersonType(e.target.value)}
							>
								<option value="">All Types</option>
								<option value="loan_officer">Loan Officer</option>
								<option value="realtor">Realtor</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={activeRegion}
								onChange={(e) => setActiveRegion(e.target.value)}
							>
								<option value="">All Regions</option>
								<option value="pacific">Pacific</option>
								<option value="mountain">Mountain</option>
								<option value="southwest">Southwest</option>
							</select>
						</div>
					</div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center p-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-3 text-gray-600">Loading profiles...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="p-6 border-2 border-red-300 bg-red-50 rounded-lg text-center">
					<p className="text-red-700 font-semibold">Error loading profiles</p>
					<p className="text-sm text-red-600 mt-2">{error}</p>
				</div>
			)}

			{/* Empty State */}
			{!loading && !error && profiles.length === 0 && (
				<div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
					<p className="text-gray-600 font-semibold">No loan officers found</p>
					<p className="text-sm text-gray-500 mt-2">Try adjusting the filters above</p>
				</div>
			)}

			{/* Profiles Grid */}
			{!loading && !error && profiles.length > 0 && (
				<div className={`grid gap-6 ${gridColsClass}`}>
					{profiles.map((profile) => (
						<ProfileCardCompact
							key={profile.id}
							profile={profile}
							size={cardSize}
							showContactButtons={showContactButtons}
							showBio={detailLevel === 'full'}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// Initialize all blocks on the page
document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.wp-block-frs-users-loan-officer-directory');

	blocks.forEach((block) => {
		const htmlElement = block as HTMLElement;
		const attributes = JSON.parse(
			htmlElement.dataset.attributes || '{}'
		) as BlockAttributes;

		const root = createRoot(htmlElement);
		root.render(<LoanOfficerDirectoryView attributes={attributes} />);
	});
});
