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

	const profileOptions = allProfiles.map(p => ({
		label: `${p.full_name}${p.nmls_number ? ' (NMLS# ' + p.nmls_number + ')' : ''}${p.city_state ? ' - ' + p.city_state : ''}`,
		value: p.id.toString(),
	}));

	// Size mapping for ProfileCard
	const sizeClasses = {
		small: 'max-w-sm',
		medium: 'max-w-md',
		large: 'max-w-2xl',
	};

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
						help={__('Note: Profile card currently shows full detail level', 'frs-users')}
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
					<div className="loan-officer-card-preview flex justify-center">
						<ProfileCard
							profile={profile}
							showQRCode={false}
							showContactButtons={showContactButtons}
							className={sizeClasses[size]}
						/>
					</div>
				)}
			</div>
		</>
	);
}
