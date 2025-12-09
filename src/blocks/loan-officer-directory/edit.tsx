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

interface EditProps {
	attributes: BlockAttributes;
	setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
	const { audience, cardSize, detailLevel, perPage, personType, region, showContactButtons, showFilters } = attributes;
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
			.catch((error_: Error) => {
				setError(error_.message);
				setLoading(false);
			});
	}, [personType, region, perPage]);

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
		<>
			<InspectorControls>
				<PanelBody title={__('Filter Settings', 'frs-users')}>
					<SelectControl
						label={__('Person Type', 'frs-users')}
						onChange={(value) => setAttributes({ personType: value })}
						options={[
							{ label: __('All Types', 'frs-users'), value: '' },
							{ label: __('Loan Officer', 'frs-users'), value: 'loan_officer' },
							{ label: __('Realtor', 'frs-users'), value: 'realtor' },
						]}
						value={personType}
					/>
					<SelectControl
						label={__('Region', 'frs-users')}
						onChange={(value) => setAttributes({ region: value })}
						options={[
							{ label: __('All Regions', 'frs-users'), value: '' },
							{ label: __('Pacific', 'frs-users'), value: 'pacific' },
							{ label: __('Mountain', 'frs-users'), value: 'mountain' },
							{ label: __('Southwest', 'frs-users'), value: 'southwest' },
						]}
						value={region}
					/>
					<RangeControl
						label={__('Profiles Per Page', 'frs-users')}
						max={50}
						min={6}
						onChange={(value) => setAttributes({ perPage: value || 12 })}
						step={6}
						value={perPage}
					/>
					<ToggleControl
						checked={showFilters}
						label={__('Show Filters on Frontend', 'frs-users')}
						onChange={(value) => setAttributes({ showFilters: value })}
					/>
				</PanelBody>

				<PanelBody title={__('Display Settings', 'frs-users')}>
					<SelectControl
						label={__('Card Size', 'frs-users')}
						onChange={(value) => setAttributes({ cardSize: value as BlockAttributes['cardSize'] })}
						options={[
							{ label: __('Small', 'frs-users'), value: 'small' },
							{ label: __('Medium', 'frs-users'), value: 'medium' },
							{ label: __('Large', 'frs-users'), value: 'large' },
						]}
						value={cardSize}
					/>
					<SelectControl
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
				<div className="loan-officer-directory">

					{loading && (
						<div className="flex items-center justify-center p-12">
							<Spinner />
							<span className="ml-2">{__('Loading profiles...', 'frs-users')}</span>
						</div>
					)}

					{error && (
						<div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center">
							<p className="font-semibold text-red-700">{__('Error loading profiles', 'frs-users')}</p>
							<p className="mt-2 text-sm text-red-600">{error}</p>
						</div>
					)}

					{!loading && !error && profiles.length === 0 && (
						<div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
							<p className="font-semibold text-gray-600">{__('No loan officers found', 'frs-users')}</p>
							<p className="mt-2 text-sm text-gray-500">
								{__('Try adjusting the filters in the sidebar', 'frs-users')}
							</p>
						</div>
					)}

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
			</div>
		</>
	);
}
