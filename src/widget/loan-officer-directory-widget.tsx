/**
 * Loan Officer Directory Embeddable Widget
 *
 * Usage:
 * <div data-frs-lo-directory
 *      data-api-url="https://yoursite.com/wp-json"
 *      data-person-type="loan_officer"
 *      data-card-size="medium"
 *      data-show-filters="true"
 *      data-per-page="12">
 * </div>
 * <script src="https://yoursite.com/wp-content/plugins/frs-wp-users/assets/widget/loan-officer-directory-widget.js"></script>
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import './widget.css';

interface WidgetConfig {
	apiUrl: string;
	personType?: string;
	region?: string;
	cardSize: 'small' | 'medium' | 'large';
	detailLevel: 'minimal' | 'standard' | 'full';
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

function LoanOfficerDirectoryWidget({ config }: { config: WidgetConfig }) {
	const { apiUrl, personType, region, cardSize, detailLevel, showFilters, showContactButtons, perPage } = config;
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activePersonType, setActivePersonType] = useState(personType || '');
	const [activeRegion, setActiveRegion] = useState(region || '');

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

		fetch(`${apiUrl}/frs-users/v1/profiles?${params.toString()}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				let filteredProfiles = data.data || [];

				// Apply region filter if set
				if (activeRegion) {
					filteredProfiles = filteredProfiles.filter((p: Profile) => p.region === activeRegion);
				}

				setProfiles(filteredProfiles);
				setLoading(false);
			})
			.catch((err: Error) => {
				setError(err.message);
				setLoading(false);
			});
	}, [activePersonType, activeRegion, perPage, apiUrl]);

	const getInitials = (firstName: string, lastName: string): string => {
		return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
	};

	const cardSizeClass = {
		small: 'frs-lo-max-w-xs',
		medium: 'frs-lo-max-w-md',
		large: 'frs-lo-max-w-2xl',
	}[cardSize];

	const avatarSizeClass = {
		small: 'frs-lo-h-12 frs-lo-w-12 frs-lo-text-sm',
		medium: 'frs-lo-h-16 frs-lo-w-16 frs-lo-text-base',
		large: 'frs-lo-h-20 frs-lo-w-20 frs-lo-text-lg',
	}[cardSize];

	const gridColsClass = {
		small: 'frs-lo-grid-cols-1 sm:frs-lo-grid-cols-2 lg:frs-lo-grid-cols-3 xl:frs-lo-grid-cols-4',
		medium: 'frs-lo-grid-cols-1 md:frs-lo-grid-cols-2 lg:frs-lo-grid-cols-3',
		large: 'frs-lo-grid-cols-1 lg:frs-lo-grid-cols-2',
	}[cardSize];

	return (
		<div className="frs-loan-officer-directory">
			{/* Header */}
			<div className="frs-lo-mb-6">
				<h2 className="frs-lo-text-2xl frs-lo-font-bold">Loan Officer Directory</h2>
				{loading && <p className="frs-lo-text-gray-600">Loading...</p>}
				{!loading && (
					<p className="frs-lo-text-gray-600">
						{profiles.length} {profiles.length === 1 ? 'officer' : 'officers'} found
					</p>
				)}
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="frs-lo-mb-6 frs-lo-p-4 frs-lo-bg-gray-50 frs-lo-rounded-lg frs-lo-border frs-lo-border-gray-200">
					<div className="frs-lo-grid frs-lo-grid-cols-1 md:frs-lo-grid-cols-2 frs-lo-gap-4">
						<div>
							<label className="frs-lo-block frs-lo-text-sm frs-lo-font-medium frs-lo-text-gray-700 frs-lo-mb-2">Person Type</label>
							<select
								className="frs-lo-w-full frs-lo-px-3 frs-lo-py-2 frs-lo-border frs-lo-border-gray-300 frs-lo-rounded-md focus:frs-lo-outline-none focus:frs-lo-ring-2 focus:frs-lo-ring-blue-500"
								value={activePersonType}
								onChange={(e) => setActivePersonType(e.target.value)}
							>
								<option value="">All Types</option>
								<option value="loan_officer">Loan Officer</option>
								<option value="realtor">Realtor</option>
							</select>
						</div>
						<div>
							<label className="frs-lo-block frs-lo-text-sm frs-lo-font-medium frs-lo-text-gray-700 frs-lo-mb-2">Region</label>
							<select
								className="frs-lo-w-full frs-lo-px-3 frs-lo-py-2 frs-lo-border frs-lo-border-gray-300 frs-lo-rounded-md focus:frs-lo-outline-none focus:frs-lo-ring-2 focus:frs-lo-ring-blue-500"
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
				<div className="frs-lo-flex frs-lo-items-center frs-lo-justify-center frs-lo-p-12">
					<div className="frs-lo-animate-spin frs-lo-rounded-full frs-lo-h-8 frs-lo-w-8 frs-lo-border-b-2 frs-lo-border-blue-600"></div>
					<span className="frs-lo-ml-3 frs-lo-text-gray-600">Loading profiles...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="frs-lo-p-6 frs-lo-border-2 frs-lo-border-red-300 frs-lo-bg-red-50 frs-lo-rounded-lg frs-lo-text-center">
					<p className="frs-lo-text-red-700 frs-lo-font-semibold">Error loading profiles</p>
					<p className="frs-lo-text-sm frs-lo-text-red-600 frs-lo-mt-2">{error}</p>
				</div>
			)}

			{/* Empty State */}
			{!loading && !error && profiles.length === 0 && (
				<div className="frs-lo-p-12 frs-lo-border-2 frs-lo-border-dashed frs-lo-border-gray-300 frs-lo-rounded-lg frs-lo-text-center">
					<p className="frs-lo-text-gray-600 frs-lo-font-semibold">No loan officers found</p>
					<p className="frs-lo-text-sm frs-lo-text-gray-500 frs-lo-mt-2">Try adjusting the filters above</p>
				</div>
			)}

			{/* Profiles Grid */}
			{!loading && !error && profiles.length > 0 && (
				<div className={`frs-lo-grid frs-lo-gap-6 ${gridColsClass}`}>
					{profiles.map((profile) => (
						<div key={profile.id} className={`${cardSizeClass} frs-lo-border frs-lo-rounded-xl frs-lo-shadow-md hover:frs-lo-shadow-lg frs-lo-transition-shadow frs-lo-duration-300 frs-lo-border-gray-200 frs-lo-bg-white frs-lo-overflow-hidden`}>
							<div className="frs-lo-p-4">
								<div className={`frs-lo-flex ${cardSize === 'large' ? 'frs-lo-flex-row' : 'frs-lo-flex-col'} frs-lo-gap-3 frs-lo-items-center`}>
									{/* Avatar */}
									{profile.headshot_url ? (
										<img
											src={profile.headshot_url}
											alt={profile.full_name}
											className={`${avatarSizeClass} frs-lo-rounded-full frs-lo-object-cover frs-lo-border-2 frs-lo-border-blue-100 frs-lo-flex-shrink-0`}
										/>
									) : (
										<div className={`${avatarSizeClass} frs-lo-rounded-full frs-lo-bg-gradient-to-br frs-lo-from-blue-500 frs-lo-to-cyan-500 frs-lo-flex frs-lo-items-center frs-lo-justify-center frs-lo-text-white frs-lo-font-bold frs-lo-flex-shrink-0`}>
											{getInitials(profile.first_name, profile.last_name)}
										</div>
									)}

									{/* Name and Title */}
									<div className={`frs-lo-flex-1 ${cardSize === 'large' ? 'frs-lo-text-left' : 'frs-lo-text-center'}`}>
										<h3 className={`frs-lo-font-bold ${cardSize === 'small' ? 'frs-lo-text-sm' : cardSize === 'medium' ? 'frs-lo-text-base' : 'frs-lo-text-lg'} frs-lo-text-gray-900`}>
											{profile.full_name}
										</h3>
										{profile.job_title && (
											<p className="frs-lo-text-gray-600 frs-lo-text-xs frs-lo-mt-1">{profile.job_title}</p>
										)}
										{profile.nmls_number && detailLevel !== 'minimal' && (
											<span className="frs-lo-inline-block frs-lo-mt-1 frs-lo-px-2 frs-lo-py-0.5 frs-lo-text-xs frs-lo-bg-blue-100 frs-lo-text-blue-800 frs-lo-rounded">
												NMLS# {profile.nmls_number}
											</span>
										)}
									</div>
								</div>

								{/* Office/Company */}
								{detailLevel !== 'minimal' && profile.office && (
									<p className="frs-lo-text-xs frs-lo-text-blue-600 hover:frs-lo-underline frs-lo-mt-1">
										<a href="#">{profile.office}</a>
									</p>
								)}

								{/* Location */}
								{detailLevel !== 'minimal' && profile.city_state && (
									<div className="frs-lo-flex frs-lo-items-center frs-lo-gap-1 frs-lo-text-xs frs-lo-text-gray-600 frs-lo-mt-2">
										<svg className="frs-lo-w-3 frs-lo-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										<span>{profile.city_state}</span>
									</div>
								)}

								{/* Social Media Icons */}
								{detailLevel !== 'minimal' && (
									<div className="frs-lo-flex frs-lo-items-center frs-lo-gap-2 frs-lo-mt-3">
										{profile.linkedin_url && (
											<a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="frs-lo-text-gray-600 hover:frs-lo-text-blue-600 frs-lo-transition-colors">
												<svg className="frs-lo-w-4 frs-lo-h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
												</svg>
											</a>
										)}
										{profile.facebook_url && (
											<a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="frs-lo-text-gray-600 hover:frs-lo-text-blue-600 frs-lo-transition-colors">
												<svg className="frs-lo-w-4 frs-lo-h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
												</svg>
											</a>
										)}
										{profile.instagram_url && (
											<a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="frs-lo-text-gray-600 hover:frs-lo-text-pink-600 frs-lo-transition-colors">
												<svg className="frs-lo-w-4 frs-lo-h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
												</svg>
											</a>
										)}
										{profile.twitter_url && (
											<a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="frs-lo-text-gray-600 hover:frs-lo-text-blue-400 frs-lo-transition-colors">
												<svg className="frs-lo-w-4 frs-lo-h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
												</svg>
											</a>
										)}
										{profile.youtube_url && (
											<a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="frs-lo-text-gray-600 hover:frs-lo-text-red-600 frs-lo-transition-colors">
												<svg className="frs-lo-w-4 frs-lo-h-4" fill="currentColor" viewBox="0 0 24 24">
													<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
												</svg>
											</a>
										)}
									</div>
								)}

								{/* Biography */}
								{detailLevel === 'full' && profile.biography && (
									<div className="frs-lo-mt-3 frs-lo-pt-3 frs-lo-border-t frs-lo-border-gray-100">
										<p className="frs-lo-text-xs frs-lo-text-gray-600 frs-lo-line-clamp-3">
											{profile.biography}
										</p>
									</div>
								)}

								{/* Contact Buttons */}
								{showContactButtons && (
									<div className="frs-lo-mt-4 frs-lo-flex frs-lo-gap-2">
										{profile.phone_number && (
											<a
												href={`tel:${profile.phone_number}`}
												className="frs-lo-flex-1 frs-lo-bg-blue-600 frs-lo-text-white frs-lo-px-3 frs-lo-py-2 frs-lo-rounded-lg frs-lo-text-xs frs-lo-font-medium hover:frs-lo-bg-blue-700 frs-lo-transition-colors frs-lo-text-center"
											>
												Call
											</a>
										)}
										{profile.email && (
											<a
												href={`mailto:${profile.email}`}
												className="frs-lo-flex-1 frs-lo-bg-gray-100 frs-lo-text-gray-700 frs-lo-px-3 frs-lo-py-2 frs-lo-rounded-lg frs-lo-text-xs frs-lo-font-medium hover:frs-lo-bg-gray-200 frs-lo-transition-colors frs-lo-text-center"
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

// Initialize all widgets on the page
(function() {
	function initWidgets() {
		const widgets = document.querySelectorAll('[data-frs-lo-directory]');

		widgets.forEach((widget) => {
			const htmlElement = widget as HTMLElement;

			// Parse configuration from data attributes
			const config: WidgetConfig = {
				apiUrl: htmlElement.dataset.apiUrl || window.location.origin + '/wp-json',
				personType: htmlElement.dataset.personType,
				region: htmlElement.dataset.region,
				cardSize: (htmlElement.dataset.cardSize as any) || 'medium',
				detailLevel: (htmlElement.dataset.detailLevel as any) || 'standard',
				showFilters: htmlElement.dataset.showFilters !== 'false',
				showContactButtons: htmlElement.dataset.showContactButtons !== 'false',
				perPage: parseInt(htmlElement.dataset.perPage || '12', 10),
			};

			const root = createRoot(htmlElement);
			root.render(<LoanOfficerDirectoryWidget config={config} />);
		});
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWidgets);
	} else {
		initWidgets();
	}
})();
