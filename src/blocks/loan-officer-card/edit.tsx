import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	Spinner,
	ComboboxControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

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
	specialties_lo?: string[];
	languages?: string[];
}

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
	const { profileId, size, detailLevel, audience, showContactButtons } = attributes;
	const [profile, setProfile] = useState<Profile | null>(null);
	const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingProfiles, setLoadingProfiles] = useState(true);

	const blockProps = useBlockProps();

	// Fetch all profiles for dropdown
	useEffect(() => {
		setLoadingProfiles(true);
		apiFetch<{ data: Profile[] }>({
			path: '/frs-users/v1/profiles?per_page=100',
		})
			.then((response) => {
				setAllProfiles(response.data || []);
				setLoadingProfiles(false);
			})
			.catch(() => {
				setLoadingProfiles(false);
			});
	}, []);

	// Fetch selected profile data
	useEffect(() => {
		if (!profileId) {
			setProfile(null);
			return;
		}

		setLoading(true);

		apiFetch<Profile>({ path: `/frs-users/v1/profiles/${profileId}` })
			.then((data) => {
				setProfile(data);
				setLoading(false);
			})
			.catch(() => {
				setProfile(null);
				setLoading(false);
			});
	}, [profileId]);

	const getInitials = (firstName: string, lastName: string): string => {
		return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
	};

	const profileOptions = allProfiles.map(p => ({
		label: `${p.full_name}${p.nmls_number ? ' (NMLS# ' + p.nmls_number + ')' : ''}${p.city_state ? ' - ' + p.city_state : ''}`,
		value: p.id.toString(),
	}));

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Profile Selection', 'frs-users')}>
					{loadingProfiles ? (
						<div className="flex items-center gap-2 py-4">
							<Spinner />
							<span>{__('Loading profiles...', 'frs-users')}</span>
						</div>
					) : (
						<ComboboxControl
							label={__('Select Loan Officer', 'frs-users')}
							value={profileId.toString()}
							onChange={(value) => setAttributes({ profileId: parseInt(value || '0') || 0 })}
							options={[
								{ label: __('-- Select a profile --', 'frs-users'), value: '0' },
								...profileOptions,
							]}
							help={__('Search and select a loan officer to display', 'frs-users')}
						/>
					)}
				</PanelBody>

				<PanelBody title={__('Display Settings', 'frs-users')} initialOpen={false}>
					<SelectControl
						label={__('Card Size', 'frs-users')}
						value={size}
						options={[
							{ label: __('Small', 'frs-users'), value: 'small' },
							{ label: __('Medium', 'frs-users'), value: 'medium' },
							{ label: __('Large', 'frs-users'), value: 'large' },
						]}
						onChange={(value) => setAttributes({ size: value as BlockAttributes['size'] })}
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
				{loading && (
					<div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
						<Spinner />
						<span className="ml-2">{__('Loading profile...', 'frs-users')}</span>
					</div>
				)}

				{!loading && !profile && (
					<div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gradient-to-br from-blue-50 to-purple-50">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
								<svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{__('Loan Officer Card', 'frs-users')}
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								{__('Select a loan officer from the sidebar to display their profile card', 'frs-users')}
							</p>
							<p className="text-xs text-gray-500">
								{profileOptions.length} {__('profiles available', 'frs-users')}
							</p>
						</div>
					</div>
				)}

				{!loading && profile && (
					<div className="loan-officer-card-preview">
						<div
							className={`
								max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl
								${audience === 'internal' ? 'border-2 border-blue-200 bg-blue-50' : 'bg-white border border-gray-200'}
							`}
						>
							{/* Gradient Header */}
							<div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
								<div className="absolute inset-0 bg-black opacity-10"></div>
							</div>

							{/* Profile Content */}
							<div className="px-8 pb-8 -mt-16 relative">
								{/* Avatar */}
								<div className="mb-4">
									<div
										className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden"
										style={{
											backgroundImage: profile.headshot_url ? `url(${profile.headshot_url})` : undefined,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
										}}
									>
										{!profile.headshot_url && getInitials(profile.first_name, profile.last_name)}
									</div>
								</div>

								{/* Name and Title */}
								<div className="mb-4">
									<h2 className="text-3xl font-bold text-gray-900 mb-1">
										{profile.full_name}
									</h2>
									{profile.job_title && (
										<p className="text-lg text-gray-600 mb-2">{profile.job_title}</p>
									)}
									<div className="flex flex-wrap gap-2 items-center">
										{profile.nmls_number && (
											<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
												<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
												</svg>
												NMLS# {profile.nmls_number}
											</span>
										)}
										{profile.city_state && (
											<span className="inline-flex items-center text-sm text-gray-600">
												<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
												</svg>
												{profile.city_state}
											</span>
										)}
									</div>
								</div>

								{/* Biography */}
								{detailLevel === 'full' && profile.biography && (
									<div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
										<p className="text-sm text-gray-700 leading-relaxed">
											{profile.biography}
										</p>
									</div>
								)}

								{/* Contact Info */}
								{detailLevel !== 'minimal' && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
										{profile.email && (
											<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
												<div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
													<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
													</svg>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs text-gray-500 font-medium">{__('Email', 'frs-users')}</p>
													<p className="text-sm text-gray-900 truncate">{profile.email}</p>
												</div>
											</div>
										)}
										{(profile.mobile_number || profile.phone_number) && (
											<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
												<div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
													<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
													</svg>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs text-gray-500 font-medium">{__('Phone', 'frs-users')}</p>
													<p className="text-sm text-gray-900">{profile.mobile_number || profile.phone_number}</p>
												</div>
											</div>
										)}
									</div>
								)}

								{/* Specialties */}
								{detailLevel !== 'minimal' && profile.specialties_lo && profile.specialties_lo.length > 0 && (
									<div className="mb-6">
										<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
											<svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
												<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
												<path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
											</svg>
											{__('Specialties', 'frs-users')}
										</h4>
										<div className="flex flex-wrap gap-2">
											{profile.specialties_lo.map((specialty, idx) => (
												<span key={idx} className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 rounded-full border border-purple-200 font-medium">
													{specialty}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Languages */}
								{detailLevel === 'full' && profile.languages && profile.languages.length > 0 && (
									<div className="mb-6">
										<h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
											<svg className="w-4 h-4 mr-2 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" />
											</svg>
											{__('Languages', 'frs-users')}
										</h4>
										<div className="flex flex-wrap gap-2">
											{profile.languages.map((language, idx) => (
												<span key={idx} className="px-3 py-1.5 text-sm border-2 border-cyan-200 text-cyan-800 rounded-full font-medium">
													{language}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Contact Buttons */}
								{showContactButtons && (
									<div className="flex flex-col sm:flex-row gap-3">
										{(profile.mobile_number || profile.phone_number) && (
											<button className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
												<svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
												</svg>
												{__('Call Now', 'frs-users')}
											</button>
										)}
										{profile.email && (
											<button className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">
												<svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
												</svg>
												{__('Send Email', 'frs-users')}
											</button>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Editor Info Bar */}
						<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<p className="text-xs text-blue-800">
								<strong>{__('Editor Preview:', 'frs-users')}</strong> {__('Displaying', 'frs-users')} <strong>{size}</strong> {__('size with', 'frs-users')} <strong>{detailLevel}</strong> {__('details for', 'frs-users')} <strong>{audience}</strong> {__('audience', 'frs-users')}
							</p>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
