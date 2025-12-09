import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { ProfileCardCompact } from '../../components/ProfileCardCompact';

interface BlockAttributes {
	audience: 'internal' | 'external';
	cardSize: 'small' | 'medium' | 'large';
	detailLevel: 'minimal' | 'standard' | 'full';
	perPage: number;
	personType: string;
	region: string;
	showContactButtons: boolean;
	showFilters: boolean;
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
	last_name: string;
	linkedin_url?: string;
	mobile_number?: string;
	nmls_number?: string;
	office?: string;
	phone_number?: string;
	region?: string;
	select_person_type?: string;
	specialties_lo?: string[];
	tiktok_url?: string;
	twitter_url?: string;
	youtube_url?: string;
}

function LoanOfficerDirectoryView({ attributes }: { attributes: BlockAttributes }) {
	const { audience, cardSize, detailLevel, perPage, personType, region, showContactButtons, showFilters } = attributes;
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
			.catch((error_: Error) => {
				setError(error_.message);
				setLoading(false);
			});
	}, [activePersonType, activeRegion, perPage]);

	const getInitials = (firstName: string, lastName: string): string => {
		return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
	};

	const cardSizeClass = {
		large: 'max-w-2xl',
		medium: 'max-w-md',
		small: 'max-w-xs',
	}[cardSize];

	const avatarSizeClass = {
		large: 'h-20 w-20 text-lg',
		medium: 'h-16 w-16 text-base',
		small: 'h-12 w-12 text-sm',
	}[cardSize];

	const gridColsClass = {
		large: 'grid-cols-1 lg:grid-cols-2',
		medium: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
		small: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
	}[cardSize];

	return (
		<div className="loan-officer-directory">

			{/* Filters */}
			{showFilters && (
				<div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">Person Type</label>
							<select
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) => setActivePersonType(e.target.value)}
								value={activePersonType}
							>
								<option value="">All Types</option>
								<option value="loan_officer">Loan Officer</option>
								<option value="realtor">Realtor</option>
							</select>
						</div>
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700">Region</label>
							<select
								className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={(e) => setActiveRegion(e.target.value)}
								value={activeRegion}
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
					<div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<span className="ml-3 text-gray-600">Loading profiles...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center">
					<p className="font-semibold text-red-700">Error loading profiles</p>
					<p className="mt-2 text-sm text-red-600">{error}</p>
				</div>
			)}

			{/* Empty State */}
			{!loading && !error && profiles.length === 0 && (
				<div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
					<p className="font-semibold text-gray-600">No loan officers found</p>
					<p className="mt-2 text-sm text-gray-500">Try adjusting the filters above</p>
				</div>
			)}

			{/* Profiles Grid */}
			{!loading && !error && profiles.length > 0 && (
				<div className={`grid gap-6 ${gridColsClass}`}>
					{profiles.map((profile) => (
						<ProfileCardCompact
							key={profile.id}
							profile={profile}
							showBio={detailLevel === 'full'}
							showContactButtons={showContactButtons}
							size={cardSize}
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
