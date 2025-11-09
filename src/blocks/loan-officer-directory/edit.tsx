import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RangeControl,
	Spinner,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

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

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
	const { personType, region, cardSize, detailLevel, audience, showFilters, showContactButtons, perPage } = attributes;
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const blockProps = useBlockProps();

	// Fetch profiles
	useEffect(() => {
		setLoading(true);
		setError(null);

		const params = new URLSearchParams({
			per_page: perPage.toString(),
		});

		if (personType) {
			params.append('type', personType);
		}

		apiFetch<{ data: Profile[] }>({
			path: `/frs-users/v1/profiles?${params.toString()}`,
		})
			.then((response) => {
				let filteredProfiles = response.data || [];

				// Apply region filter if set
				if (region) {
					filteredProfiles = filteredProfiles.filter(p => p.region === region);
				}

				setProfiles(filteredProfiles);
				setLoading(false);
			})
			.catch((err: Error) => {
				setError(err.message);
				setLoading(false);
			});
	}, [personType, region, perPage]);

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
		<>
			<InspectorControls>
				<PanelBody title={__('Filter Settings', 'frs-users')}>
					<SelectControl
						label={__('Person Type', 'frs-users')}
						value={personType}
						options={[
							{ label: __('All Types', 'frs-users'), value: '' },
							{ label: __('Loan Officer', 'frs-users'), value: 'loan_officer' },
							{ label: __('Realtor', 'frs-users'), value: 'realtor' },
						]}
						onChange={(value) => setAttributes({ personType: value })}
					/>
					<SelectControl
						label={__('Region', 'frs-users')}
						value={region}
						options={[
							{ label: __('All Regions', 'frs-users'), value: '' },
							{ label: __('Pacific', 'frs-users'), value: 'pacific' },
							{ label: __('Mountain', 'frs-users'), value: 'mountain' },
							{ label: __('Southwest', 'frs-users'), value: 'southwest' },
						]}
						onChange={(value) => setAttributes({ region: value })}
					/>
					<RangeControl
						label={__('Profiles Per Page', 'frs-users')}
						value={perPage}
						onChange={(value) => setAttributes({ perPage: value || 12 })}
						min={6}
						max={50}
						step={6}
					/>
					<ToggleControl
						label={__('Show Filters on Frontend', 'frs-users')}
						checked={showFilters}
						onChange={(value) => setAttributes({ showFilters: value })}
					/>
				</PanelBody>

				<PanelBody title={__('Display Settings', 'frs-users')}>
					<SelectControl
						label={__('Card Size', 'frs-users')}
						value={cardSize}
						options={[
							{ label: __('Small', 'frs-users'), value: 'small' },
							{ label: __('Medium', 'frs-users'), value: 'medium' },
							{ label: __('Large', 'frs-users'), value: 'large' },
						]}
						onChange={(value) => setAttributes({ cardSize: value as BlockAttributes['cardSize'] })}
					/>
					<SelectControl
						label={__('Detail Level', 'frs-users')}
						value={detailLevel}
						options={[
							{ label: __('Minimal', 'frs-users'), value: 'minimal' },
							{ label: __('Standard', 'frs-users'), value: 'standard' },
							{ label: __('Full', 'frs-users'), value: 'full' },
						]}
						onChange={(value) => setAttributes({ detailLevel: value as BlockAttributes['detailLevel'] })}
					/>
					<SelectControl
						label={__('Audience', 'frs-users')}
						value={audience}
						options={[
							{ label: __('External (Public)', 'frs-users'), value: 'external' },
							{ label: __('Internal (Staff)', 'frs-users'), value: 'internal' },
						]}
						onChange={(value) => setAttributes({ audience: value as BlockAttributes['audience'] })}
					/>
					<ToggleControl
						label={__('Show Contact Buttons', 'frs-users')}
						checked={showContactButtons}
						onChange={(value) => setAttributes({ showContactButtons: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="loan-officer-directory">
					{/* Header */}
					<div className="mb-6">
						<h2 className="text-2xl font-bold">{__('Loan Officer Directory', 'frs-users')}</h2>
						{loading && (
							<p className="text-gray-600">{__('Loading...', 'frs-users')}</p>
						)}
						{!loading && (
							<p className="text-gray-600">
								{profiles.length} {profiles.length === 1 ? __('officer', 'frs-users') : __('officers', 'frs-users')} {__('found', 'frs-users')}
							</p>
						)}
					</div>

					{loading && (
						<div className="flex items-center justify-center p-12">
							<Spinner />
							<span className="ml-2">{__('Loading profiles...', 'frs-users')}</span>
						</div>
					)}

					{error && (
						<div className="p-6 border-2 border-red-300 bg-red-50 rounded-lg text-center">
							<p className="text-red-700 font-semibold">{__('Error loading profiles', 'frs-users')}</p>
							<p className="text-sm text-red-600 mt-2">{error}</p>
						</div>
					)}

					{!loading && !error && profiles.length === 0 && (
						<div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
							<p className="text-gray-600 font-semibold">{__('No loan officers found', 'frs-users')}</p>
							<p className="text-sm text-gray-500 mt-2">
								{__('Try adjusting the filters in the sidebar', 'frs-users')}
							</p>
						</div>
					)}

					{!loading && !error && profiles.length > 0 && (
						<div className={`grid gap-6 ${gridColsClass}`}>
							{profiles.map((profile) => (
								<div key={profile.id} className={`${cardSizeClass} border rounded-xl shadow-md p-4 bg-white`}>
									<div className={`flex ${cardSize === 'large' ? 'flex-row' : 'flex-col'} gap-3 items-center`}>
										{/* Avatar */}
										<div
											className={`${avatarSizeClass} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0`}
											style={{
												backgroundImage: profile.headshot_url ? `url(${profile.headshot_url})` : undefined,
												backgroundSize: 'cover',
												backgroundPosition: 'center',
											}}
										>
											{!profile.headshot_url && getInitials(profile.first_name, profile.last_name)}
										</div>

										{/* Name and Title */}
										<div className={`flex-1 ${cardSize === 'large' ? 'text-left' : 'text-center'}`}>
											<h3 className={`font-bold ${cardSize === 'small' ? 'text-sm' : cardSize === 'medium' ? 'text-base' : 'text-lg'}`}>
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
										<div className="mt-3 space-y-1 text-xs text-gray-600">
											{profile.city_state && <p>📍 {profile.city_state}</p>}
											{profile.email && <p>✉️ {profile.email}</p>}
										</div>
									)}

									{/* Specialties */}
									{detailLevel !== 'minimal' && profile.specialties_lo && profile.specialties_lo.length > 0 && (
										<div className="mt-2">
											<div className="flex flex-wrap gap-1">
												{profile.specialties_lo.slice(0, 2).map((specialty, idx) => (
													<span key={idx} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
														{specialty}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
