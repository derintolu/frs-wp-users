import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

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
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Loan Officer Directory</h2>
				{loading && <p className="text-gray-600">Loading...</p>}
				{!loading && (
					<p className="text-gray-600">
						{profiles.length} {profiles.length === 1 ? 'officer' : 'officers'} found
					</p>
				)}
			</div>

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
						<div key={profile.id} className={`${cardSizeClass} border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-200 bg-white overflow-hidden`}>
							<div className="p-4">
								<div className={`flex ${cardSize === 'large' ? 'flex-row' : 'flex-col'} gap-3 items-center`}>
									{/* Avatar */}
									{profile.headshot_url ? (
										<img
											src={profile.headshot_url}
											alt={profile.full_name}
											className={`${avatarSizeClass} rounded-full object-cover border-2 border-blue-100 flex-shrink-0`}
										/>
									) : (
										<div className={`${avatarSizeClass} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
											{getInitials(profile.first_name, profile.last_name)}
										</div>
									)}

									{/* Name and Title */}
									<div className={`flex-1 ${cardSize === 'large' ? 'text-left' : 'text-center'}`}>
										<h3 className={`font-bold ${cardSize === 'small' ? 'text-sm' : cardSize === 'medium' ? 'text-base' : 'text-lg'} text-gray-900`}>
											{profile.full_name}
										</h3>
										{profile.job_title && (
											<p className="text-gray-600 text-xs mt-1">{profile.job_title}</p>
										)}
										{profile.nmls_number && detailLevel !== 'minimal' && (
											<span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
												NMLS# {profile.nmls_number}
											</span>
										)}
									</div>
								</div>

								{/* Contact Info */}
								{detailLevel !== 'minimal' && (
									<div className="mt-3 space-y-1">
										{profile.city_state && (
											<div className="flex items-center gap-2 text-xs text-gray-600">
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												<span>{profile.city_state}</span>
											</div>
										)}
										{profile.email && (
											<div className="flex items-center gap-2 text-xs text-gray-600">
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
												</svg>
												<a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
													{profile.email}
												</a>
											</div>
										)}
									</div>
								)}

								{/* Specialties */}
								{detailLevel !== 'minimal' && profile.specialties_lo && profile.specialties_lo.length > 0 && (
									<div className="mt-3">
										<div className="flex flex-wrap gap-1">
											{profile.specialties_lo.slice(0, cardSize === 'large' ? 4 : 2).map((specialty, idx) => (
												<span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
													{specialty}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Contact Buttons */}
								{showContactButtons && (
									<div className="mt-4 flex gap-2">
										{profile.phone_number && (
											<a
												href={`tel:${profile.phone_number}`}
												className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors text-center"
											>
												Call
											</a>
										)}
										{profile.email && (
											<a
												href={`mailto:${profile.email}`}
												className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors text-center"
											>
												Email
											</a>
										)}
									</div>
								)}
							</div>
						</div>
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
