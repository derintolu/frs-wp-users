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

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
	const { audience, detailLevel, profileId, showContactButtons, size } = attributes;
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
		large: 'max-w-2xl',
		medium: 'max-w-md',
		small: 'max-w-sm',
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
							help={__('Search and select a loan officer to display', 'frs-users')}
							label={__('Select Loan Officer', 'frs-users')}
							onChange={(value) => setAttributes({ profileId: Number.parseInt(value || '0') || 0 })}
							options={[
								{ label: __('-- Select a profile --', 'frs-users'), value: '0' },
								...profileOptions,
							]}
							value={profileId.toString()}
						/>
					)}
				</PanelBody>

				<PanelBody initialOpen={false} title={__('Display Settings', 'frs-users')}>
					<SelectControl
						label={__('Card Size', 'frs-users')}
						onChange={(value) => setAttributes({ size: value as BlockAttributes['size'] })}
						options={[
							{ label: __('Small', 'frs-users'), value: 'small' },
							{ label: __('Medium', 'frs-users'), value: 'medium' },
							{ label: __('Large', 'frs-users'), value: 'large' },
						]}
						value={size}
					/>
					<SelectControl
						help={__('Note: Profile card currently shows full detail level', 'frs-users')}
						label={__('Detail Level', 'frs-users')}
						onChange={(value) => setAttributes({ detailLevel: value as BlockAttributes['detailLevel'] })}
						options={[
							{ label: __('Minimal', 'frs-users'), value: 'minimal' },
							{ label: __('Standard', 'frs-users'), value: 'standard' },
							{ label: __('Full', 'frs-users'), value: 'full' },
						]}
						value={detailLevel}
					/>
					<SelectControl
						label={__('Audience', 'frs-users')}
						onChange={(value) => setAttributes({ audience: value as BlockAttributes['audience'] })}
						options={[
							{ label: __('External (Public)', 'frs-users'), value: 'external' },
							{ label: __('Internal (Staff)', 'frs-users'), value: 'internal' },
						]}
						value={audience}
					/>
					<ToggleControl
						checked={showContactButtons}
						label={__('Show Contact Buttons', 'frs-users')}
						onChange={(value) => setAttributes({ showContactButtons: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{loading && (
					<div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12">
						<Spinner />
						<span className="ml-2">{__('Loading profile...', 'frs-users')}</span>
					</div>
				)}

				{!loading && !profile && (
					<div className="rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50 p-12 text-center">
						<div className="mx-auto max-w-md">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
								<svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold text-gray-900">
								{__('Loan Officer Card', 'frs-users')}
							</h3>
							<p className="mb-4 text-sm text-gray-600">
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
							className={sizeClasses[size]}
							profile={profile}
							showContactButtons={showContactButtons}
							showQRCode={false}
						/>
					</div>
				)}
			</div>
		</>
	);
}
