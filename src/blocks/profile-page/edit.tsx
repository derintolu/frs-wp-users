import React from 'react';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

interface Profile {
	id: number;
	user_id: number;
	full_name: string;
}

interface EditProps {
	attributes: {
		profile_id: number;
	};
	setAttributes: (attributes: Partial<EditProps['attributes']>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const { profile_id } = attributes;
	const blockProps = useBlockProps();

	// Fetch profiles via direct API call
	const [profiles, setProfiles] = React.useState<Profile[] | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		apiFetch<Profile[]>({ path: '/wp/v2/frs-profiles?per_page=100' })
			.then((data) => {
				console.log('Profiles loaded:', data);
				setProfiles(data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching profiles:', error);
				setIsLoading(false);
			});
	}, []);

	// Build options for SelectControl
	const profileOptions = [
		{ label: __('-- Select a Profile --', 'frs-users'), value: '0' },
		...(profiles || []).map((profile) => ({
			label: `${profile.full_name} (ID: ${profile.id})`,
			value: profile.id.toString(),
		})),
	];

	// Find selected profile name
	const selectedProfile = profiles?.find((p) => p.id === profile_id);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Profile Settings', 'frs-users')}>
					{isLoading ? (
						<div style={{ padding: '1rem', textAlign: 'center' }}>
							<Spinner />
							<p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
								{__('Loading profiles...', 'frs-users')}
							</p>
						</div>
					) : (
						<SelectControl
							label={__('Select Profile', 'frs-users')}
							value={profile_id.toString()}
							options={profileOptions}
							onChange={(value) => setAttributes({ profile_id: parseInt(value) || 0 })}
							help={__('Choose which profile to display on this page', 'frs-users')}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
					<div
						style={{
							width: '80px',
							height: '80px',
							background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
							borderRadius: '50%',
							margin: '0 auto 1rem',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#fff',
							fontSize: '2rem',
						}}
					>
						👤
					</div>
					<h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
						{__('User Profile Page', 'frs-users')}
					</h2>
					<p style={{ margin: 0, color: '#6b7280' }}>
						{profile_id === 0
							? __('No profile selected', 'frs-users')
							: selectedProfile
							? __(`Displaying: ${selectedProfile.full_name}`, 'frs-users')
							: __(`Profile ID: ${profile_id}`, 'frs-users')}
					</p>
					<div style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
						{__('Complete profile with header, contact info, links, biography, and specialties will be displayed on the frontend.', 'frs-users')}
					</div>
				</div>
			</div>
		</>
	);
}
