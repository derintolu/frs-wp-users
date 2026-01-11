/**
 * FRS Profile Edit Component
 *
 * Gutenberg-style profile editor using @wordpress/components.
 */
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Spinner,
	Notice,
	TabPanel,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl,
	Panel,
	PanelBody,
	PanelRow,
	Flex,
	FlexItem,
	FlexBlock,
	BaseControl,
	CheckboxControl,
} from '@wordpress/components';

const { profile: initialProfile, roles, listUrl, states, userId } = window.frsProfileEdit;

function ProfileEdit() {
	const [profile, setProfile] = useState(initialProfile);
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);

	const updateField = useCallback((field, value) => {
		setProfile((prev) => ({ ...prev, [field]: value }));
	}, []);

	const openMediaFrame = useCallback(() => {
		const frame = wp.media({
			title: __('Select Profile Photo', 'frs-users'),
			button: { text: __('Use this photo', 'frs-users') },
			multiple: false,
			library: { type: 'image' },
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			updateField('headshot_id', attachment.id);
			updateField('headshot_url', attachment.sizes?.thumbnail?.url || attachment.url);
		});

		frame.open();
	}, [updateField]);

	const handleSave = async () => {
		setIsSaving(true);
		setNotice(null);

		try {
			await apiFetch({
				path: `/frs-users/v1/profiles/${userId}`,
				method: 'PUT',
				data: profile,
			});
			setNotice({ status: 'success', message: __('Profile saved successfully.', 'frs-users') });
		} catch (error) {
			setNotice({ status: 'error', message: error.message || __('Failed to save profile.', 'frs-users') });
		} finally {
			setIsSaving(false);
		}
	};

	const handleServiceAreaChange = (state, checked) => {
		const currentAreas = profile.service_areas || [];
		if (checked) {
			updateField('service_areas', [...currentAreas, state]);
		} else {
			updateField('service_areas', currentAreas.filter((s) => s !== state));
		}
	};

	const tabs = [
		{
			name: 'contact',
			title: __('Contact', 'frs-users'),
			content: (
				<Panel>
					<PanelBody title={__('Basic Information', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<Flex direction="row" gap={4} wrap>
								<FlexBlock>
									<TextControl
										label={__('First Name', 'frs-users')}
										value={profile.first_name || ''}
										onChange={(value) => updateField('first_name', value)}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={__('Last Name', 'frs-users')}
										value={profile.last_name || ''}
										onChange={(value) => updateField('last_name', value)}
									/>
								</FlexBlock>
							</Flex>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Email', 'frs-users')}
								type="email"
								value={profile.email || ''}
								onChange={(value) => updateField('email', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
					<PanelBody title={__('Phone Numbers', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<Flex direction="row" gap={4} wrap>
								<FlexBlock>
									<TextControl
										label={__('Phone', 'frs-users')}
										value={profile.phone_number || ''}
										onChange={(value) => updateField('phone_number', value)}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={__('Mobile', 'frs-users')}
										value={profile.mobile_number || ''}
										onChange={(value) => updateField('mobile_number', value)}
									/>
								</FlexBlock>
							</Flex>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Office', 'frs-users')}
								value={profile.office || ''}
								onChange={(value) => updateField('office', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			),
		},
		{
			name: 'professional',
			title: __('Professional', 'frs-users'),
			content: (
				<Panel>
					<PanelBody title={__('Professional Details', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<TextControl
								label={__('Job Title', 'frs-users')}
								value={profile.job_title || ''}
								onChange={(value) => updateField('job_title', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<Flex direction="row" gap={4} wrap>
								<FlexBlock>
									<TextControl
										label={__('NMLS #', 'frs-users')}
										value={profile.nmls || ''}
										onChange={(value) => updateField('nmls', value)}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={__('DRE License #', 'frs-users')}
										value={profile.dre_license || ''}
										onChange={(value) => updateField('dre_license', value)}
									/>
								</FlexBlock>
							</Flex>
						</PanelRow>
						<PanelRow>
							<TextareaControl
								label={__('Biography', 'frs-users')}
								value={profile.biography || ''}
								onChange={(value) => updateField('biography', value)}
								rows={6}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
					<PanelBody title={__('Profile Photo', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<BaseControl label={__('Headshot', 'frs-users')} __nextHasNoMarginBottom>
								<div className="frs-profile-photo">
									{profile.headshot_url && (
										<img
											src={profile.headshot_url}
											alt={__('Profile photo', 'frs-users')}
											className="frs-profile-photo__preview"
										/>
									)}
									<Flex direction="row" gap={2}>
										<Button variant="secondary" onClick={openMediaFrame}>
											{profile.headshot_id
												? __('Change Photo', 'frs-users')
												: __('Select Photo', 'frs-users')}
										</Button>
										{profile.headshot_id && (
											<Button
												variant="tertiary"
												isDestructive
												onClick={() => {
													updateField('headshot_id', '');
													updateField('headshot_url', '');
												}}
											>
												{__('Remove', 'frs-users')}
											</Button>
										)}
									</Flex>
								</div>
							</BaseControl>
						</PanelRow>
					</PanelBody>
				</Panel>
			),
		},
		{
			name: 'location',
			title: __('Location', 'frs-users'),
			content: (
				<Panel>
					<PanelBody title={__('Location Details', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<TextControl
								label={__('City, State', 'frs-users')}
								value={profile.city_state || ''}
								onChange={(value) => updateField('city_state', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Region', 'frs-users')}
								value={profile.region || ''}
								onChange={(value) => updateField('region', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
					<PanelBody title={__('Service Areas', 'frs-users')} initialOpen={true}>
						<div className="frs-service-areas-grid">
							{Object.entries(states).map(([code, name]) => (
								<CheckboxControl
									key={code}
									label={name}
									checked={(profile.service_areas || []).includes(code)}
									onChange={(checked) => handleServiceAreaChange(code, checked)}
									__nextHasNoMarginBottom
								/>
							))}
						</div>
					</PanelBody>
				</Panel>
			),
		},
		{
			name: 'social',
			title: __('Social', 'frs-users'),
			content: (
				<Panel>
					<PanelBody title={__('Social Media Links', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<TextControl
								label={__('LinkedIn URL', 'frs-users')}
								type="url"
								value={profile.linkedin_url || ''}
								onChange={(value) => updateField('linkedin_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Facebook URL', 'frs-users')}
								type="url"
								value={profile.facebook_url || ''}
								onChange={(value) => updateField('facebook_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Instagram URL', 'frs-users')}
								type="url"
								value={profile.instagram_url || ''}
								onChange={(value) => updateField('instagram_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Twitter/X URL', 'frs-users')}
								type="url"
								value={profile.twitter_url || ''}
								onChange={(value) => updateField('twitter_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('YouTube URL', 'frs-users')}
								type="url"
								value={profile.youtube_url || ''}
								onChange={(value) => updateField('youtube_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('TikTok URL', 'frs-users')}
								type="url"
								value={profile.tiktok_url || ''}
								onChange={(value) => updateField('tiktok_url', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			),
		},
		{
			name: 'settings',
			title: __('Settings', 'frs-users'),
			content: (
				<Panel>
					<PanelBody title={__('Profile Settings', 'frs-users')} initialOpen={true}>
						<PanelRow>
							<ToggleControl
								label={__('Active', 'frs-users')}
								help={__('Show this profile in public directories.', 'frs-users')}
								checked={profile.is_active}
								onChange={(value) => updateField('is_active', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								label={__('Profile Type', 'frs-users')}
								value={profile.select_person_type || ''}
								options={[
									{ value: '', label: __('Select...', 'frs-users') },
									...Object.entries(roles).map(([value, label]) => ({
										value,
										label,
									})),
								]}
								onChange={(value) => updateField('select_person_type', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Profile Slug', 'frs-users')}
								help={__('URL-friendly identifier for this profile.', 'frs-users')}
								value={profile.profile_slug || ''}
								onChange={(value) => updateField('profile_slug', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label={__('Apply Now URL', 'frs-users')}
								type="url"
								value={profile.arrive || ''}
								onChange={(value) => updateField('arrive', value)}
								__nextHasNoMarginBottom
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			),
		},
	];

	return (
		<div className="frs-profile-edit">
			<div className="frs-profile-edit__header">
				<Flex align="center" justify="space-between">
					<FlexItem>
						<Flex align="center" gap={4}>
							<button
								type="button"
								onClick={openMediaFrame}
								className="frs-profile-edit__avatar-button"
								title={__('Click to change photo', 'frs-users')}
							>
								<img
									src={profile.headshot_url || profile.avatar_url}
									alt=""
									className="frs-profile-edit__avatar"
								/>
								<span className="frs-profile-edit__avatar-overlay">
									{__('Edit', 'frs-users')}
								</span>
							</button>
							<div>
								<h1 className="frs-profile-edit__title">
									{profile.first_name} {profile.last_name}
								</h1>
								<p className="frs-profile-edit__subtitle">{profile.email}</p>
							</div>
						</Flex>
					</FlexItem>
					<FlexItem>
						<Flex gap={2}>
							<Button variant="tertiary" href={listUrl}>
								{__('Back to List', 'frs-users')}
							</Button>
							<Button variant="primary" onClick={handleSave} disabled={isSaving}>
								{isSaving ? <Spinner /> : __('Save Profile', 'frs-users')}
							</Button>
						</Flex>
					</FlexItem>
				</Flex>
			</div>

			{notice && (
				<Notice
					status={notice.status}
					onRemove={() => setNotice(null)}
					className="frs-profile-edit__notice"
				>
					{notice.message}
				</Notice>
			)}

			<div className="frs-profile-edit__content">
				<TabPanel
					className="frs-profile-edit__tabs"
					tabs={tabs.map(({ name, title }) => ({ name, title }))}
				>
					{(tab) => {
						const tabData = tabs.find((t) => t.name === tab.name);
						return <div className="frs-profile-edit__tab-content">{tabData?.content}</div>;
					}}
				</TabPanel>
			</div>
		</div>
	);
}

export default ProfileEdit;
