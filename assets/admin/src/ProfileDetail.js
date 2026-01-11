/**
 * FRS Profile Detail Panel
 *
 * Embedded edit form for split-view layout
 */
import { useState, useEffect, useCallback } from '@wordpress/element';
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
	FlexBlock,
	BaseControl,
	CheckboxControl,
} from '@wordpress/components';
import { pencil, external, check } from '@wordpress/icons';

const STATES = {
	AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
	CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
	HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
	KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
	MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
	MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
	NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
	OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
	SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
	VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

const ROLE_OPTIONS = [
	{ value: '', label: __('Select...', 'frs-users') },
	{ value: 'broker_associate', label: __('Broker Associate', 'frs-users') },
	{ value: 'sales_associate', label: __('Sales Associate', 'frs-users') },
	{ value: 'dual_license', label: __('Dual License', 'frs-users') },
	{ value: 'loan_originator', label: __('Loan Originator', 'frs-users') },
	{ value: 'leadership', label: __('Leadership', 'frs-users') },
	{ value: 'staff', label: __('Staff', 'frs-users') },
];

function ProfileDetail({ profile: initialProfile, roles, editUrl, onClose, onSave }) {
	const [profile, setProfile] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);
	const [activeTab, setActiveTab] = useState('contact');

	// Update local state when profile prop changes
	useEffect(() => {
		if (initialProfile) {
			setProfile({ ...initialProfile });
			setNotice(null);
			setActiveTab('contact');
		} else {
			setProfile(null);
		}
	}, [initialProfile]);

	const updateField = useCallback((field, value) => {
		setProfile((prev) => ({ ...prev, [field]: value }));
	}, []);

	// Format phone number as (XXX) XXX-XXXX
	const formatPhoneNumber = (value) => {
		if (!value) return '';
		// Remove all non-digits
		const digits = value.replace(/\D/g, '');
		// Format based on length
		if (digits.length <= 3) {
			return digits;
		} else if (digits.length <= 6) {
			return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		} else {
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
		}
	};

	const handlePhoneChange = (field, value) => {
		updateField(field, formatPhoneNumber(value));
	};

	// Parse service areas - handle string (comma-separated or JSON) or array
	const getServiceAreasArray = () => {
		const areas = profile.service_areas;
		if (!areas) return [];
		if (Array.isArray(areas)) return areas;
		if (typeof areas === 'string') {
			// Try JSON parse first
			try {
				const parsed = JSON.parse(areas);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				// Comma-separated string
				return areas.split(',').map((s) => s.trim()).filter(Boolean);
			}
		}
		return [];
	};

	const handleServiceAreaChange = (state, checked) => {
		const currentAreas = getServiceAreasArray();
		if (checked) {
			updateField('service_areas', [...currentAreas, state]);
		} else {
			updateField('service_areas', currentAreas.filter((s) => s !== state));
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: `/frs-users/v1/profiles/${profile.user_id}`,
				method: 'PUT',
				data: profile,
			});
			setNotice({ status: 'success', message: __('Profile saved!', 'frs-users') });
			if (onSave) onSave(profile);
		} catch (error) {
			setNotice({ status: 'error', message: error.message || __('Failed to save.', 'frs-users') });
		} finally {
			setIsSaving(false);
		}
	};

	if (!profile) {
		return (
			<div className="frs-profile-detail frs-profile-detail--empty">
				<div className="frs-profile-detail--empty-content">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<p>{__('Select a profile from the list to edit', 'frs-users')}</p>
				</div>
			</div>
		);
	}

	const avatarUrl = profile.headshot_url || profile.avatar_url || `https://www.gravatar.com/avatar/${profile.email}?s=80&d=mp`;
	const role = roles?.[profile.select_person_type];
	const slug = profile.profile_slug || profile.user_nicename;
	const marketingSiteUrl = window.frsProfilesAdmin?.marketingSiteUrl || '';
	const profileUrl = role && marketingSiteUrl ? `${marketingSiteUrl}${role.url_prefix}/${slug}/` : null;

	return (
		<div className="frs-profile-detail">
			{/* Header */}
			<div className="frs-profile-detail__header">
				<div className="frs-profile-detail__header-info">
					<img src={avatarUrl} alt="" className="frs-profile-detail__avatar" />
					<div>
						<h2 className="frs-profile-detail__name">
							{profile.first_name} {profile.last_name}
						</h2>
						<span className="frs-profile-detail__email">{profile.email}</span>
					</div>
				</div>
				<div className="frs-profile-detail__header-actions">
					<Button
						variant="primary"
						icon={check}
						onClick={handleSave}
						disabled={isSaving}
						isBusy={isSaving}
					>
						{__('Save', 'frs-users')}
					</Button>
					{profileUrl && (
						<Button
							variant="secondary"
							icon={external}
							href={profileUrl}
							target="_blank"
						>
							{__('View', 'frs-users')}
						</Button>
					)}
					<button className="frs-profile-detail__close" onClick={onClose}>×</button>
				</div>
			</div>

			{/* Notice */}
			{notice && (
				<Notice status={notice.status} onRemove={() => setNotice(null)} isDismissible>
					{notice.message}
				</Notice>
			)}

			{/* Tabs */}
			<div className="frs-profile-detail__tabs">
				{['contact', 'professional', 'location', 'social', 'settings'].map((tab) => (
					<button
						key={tab}
						className={`frs-profile-detail__tab ${activeTab === tab ? 'is-active' : ''}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="frs-profile-detail__content">
				{activeTab === 'contact' && (
					<div className="frs-profile-detail__fields">
						<Flex gap={4} wrap>
							<FlexBlock>
								<TextControl
									label={__('First Name', 'frs-users')}
									value={profile.first_name || ''}
									onChange={(v) => updateField('first_name', v)}
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={__('Last Name', 'frs-users')}
									value={profile.last_name || ''}
									onChange={(v) => updateField('last_name', v)}
								/>
							</FlexBlock>
						</Flex>
						<TextControl
							label={__('Email', 'frs-users')}
							type="email"
							value={profile.email || ''}
							onChange={(v) => updateField('email', v)}
						/>
						<Flex gap={4} wrap>
							<FlexBlock>
								<TextControl
									label={__('Phone', 'frs-users')}
									value={profile.phone_number || ''}
									onChange={(v) => handlePhoneChange('phone_number', v)}
									placeholder="(555) 123-4567"
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={__('Mobile', 'frs-users')}
									value={profile.mobile_number || ''}
									onChange={(v) => handlePhoneChange('mobile_number', v)}
									placeholder="(555) 123-4567"
								/>
							</FlexBlock>
						</Flex>
						<TextControl
							label={__('Office', 'frs-users')}
							value={profile.office || ''}
							onChange={(v) => updateField('office', v)}
						/>
					</div>
				)}

				{activeTab === 'professional' && (
					<div className="frs-profile-detail__fields">
						<TextControl
							label={__('Job Title', 'frs-users')}
							value={profile.job_title || ''}
							onChange={(v) => updateField('job_title', v)}
						/>
						<Flex gap={4} wrap>
							<FlexBlock>
								<TextControl
									label={__('NMLS #', 'frs-users')}
									value={profile.nmls || ''}
									onChange={(v) => updateField('nmls', v)}
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={__('DRE License', 'frs-users')}
									value={profile.dre_license || ''}
									onChange={(v) => updateField('dre_license', v)}
								/>
							</FlexBlock>
						</Flex>
						<TextareaControl
							label={__('Biography', 'frs-users')}
							value={profile.biography || ''}
							onChange={(v) => updateField('biography', v)}
							rows={5}
						/>
					</div>
				)}

				{activeTab === 'location' && (
					<div className="frs-profile-detail__fields">
						<TextControl
							label={__('City, State', 'frs-users')}
							value={profile.city_state || ''}
							onChange={(v) => updateField('city_state', v)}
						/>
						<TextControl
							label={__('Region', 'frs-users')}
							value={profile.region || ''}
							onChange={(v) => updateField('region', v)}
						/>
						<BaseControl label={__('Service Areas', 'frs-users')}>
							<div className="frs-service-areas-grid">
								{Object.entries(STATES).map(([code, name]) => (
									<CheckboxControl
										key={code}
										label={code}
										checked={getServiceAreasArray().includes(code)}
										onChange={(checked) => handleServiceAreaChange(code, checked)}
									/>
								))}
							</div>
						</BaseControl>
					</div>
				)}

				{activeTab === 'social' && (
					<div className="frs-profile-detail__fields">
						<TextControl
							label={__('LinkedIn', 'frs-users')}
							type="url"
							value={profile.linkedin_url || ''}
							onChange={(v) => updateField('linkedin_url', v)}
						/>
						<TextControl
							label={__('Facebook', 'frs-users')}
							type="url"
							value={profile.facebook_url || ''}
							onChange={(v) => updateField('facebook_url', v)}
						/>
						<TextControl
							label={__('Instagram', 'frs-users')}
							type="url"
							value={profile.instagram_url || ''}
							onChange={(v) => updateField('instagram_url', v)}
						/>
						<TextControl
							label={__('Twitter/X', 'frs-users')}
							type="url"
							value={profile.twitter_url || ''}
							onChange={(v) => updateField('twitter_url', v)}
						/>

						{/* External profile URLs for real estate agents */}
						<hr style={{ margin: '20px 0', borderTop: '1px solid #ddd' }} />
						<p className="components-base-control__help" style={{ marginBottom: '10px' }}>
							{__('External Real Estate Profile Links', 'frs-users')}
						</p>
						<TextControl
							label={__('Century 21 Profile', 'frs-users')}
							type="url"
							value={profile.century21_url || ''}
							onChange={(v) => updateField('century21_url', v)}
							placeholder="https://www.century21.com/real-estate-agent/..."
						/>
						<TextControl
							label={__('Zillow Profile', 'frs-users')}
							type="url"
							value={profile.zillow_url || ''}
							onChange={(v) => updateField('zillow_url', v)}
							placeholder="https://www.zillow.com/profile/..."
						/>
					</div>
				)}

				{activeTab === 'settings' && (
					<div className="frs-profile-detail__fields">
						<ToggleControl
							label={__('Active', 'frs-users')}
							help={__('Show in public directories', 'frs-users')}
							checked={profile.is_active}
							onChange={(v) => updateField('is_active', v)}
						/>
						<SelectControl
							label={__('Profile Type', 'frs-users')}
							value={profile.select_person_type || ''}
							options={ROLE_OPTIONS}
							onChange={(v) => updateField('select_person_type', v)}
						/>
						<TextControl
							label={__('Profile Slug', 'frs-users')}
							value={profile.profile_slug || ''}
							onChange={(v) => updateField('profile_slug', v)}
							help={__('URL identifier', 'frs-users')}
						/>
						<TextControl
							label={__('Apply Now URL', 'frs-users')}
							type="url"
							value={profile.arrive || ''}
							onChange={(v) => updateField('arrive', v)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default ProfileDetail;
