/**
 * FRS Profile Add Component
 *
 * Form for creating new user profiles
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Notice,
	TextControl,
	SelectControl,
	Panel,
	PanelBody,
	PanelRow,
	Flex,
	FlexBlock,
} from '@wordpress/components';

const ROLE_OPTIONS = [
	{ value: '', label: __('Select...', 'frs-users') },
	{ value: 'broker_associate', label: __('Broker Associate', 'frs-users') },
	{ value: 'sales_associate', label: __('Sales Associate', 'frs-users') },
	{ value: 'dual_license', label: __('Dual License', 'frs-users') },
	{ value: 'loan_originator', label: __('Loan Originator', 'frs-users') },
	{ value: 'leadership', label: __('Leadership', 'frs-users') },
	{ value: 'staff', label: __('Staff', 'frs-users') },
];

function ProfileAdd() {
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		job_title: '',
		nmls: '',
		select_person_type: '',
	});
	const [isSaving, setIsSaving] = useState(false);
	const [notice, setNotice] = useState(null);

	const updateField = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Format phone number as (XXX) XXX-XXXX
	const formatPhoneNumber = (value) => {
		if (!value) return '';
		const digits = value.replace(/\D/g, '');
		if (digits.length <= 3) {
			return digits;
		} else if (digits.length <= 6) {
			return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		} else {
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
		}
	};

	const handlePhoneChange = (value) => {
		updateField('phone_number', formatPhoneNumber(value));
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.first_name || !formData.last_name || !formData.email) {
			setNotice({
				status: 'error',
				message: __('First name, last name, and email are required.', 'frs-users'),
			});
			return;
		}

		if (!formData.email.includes('@')) {
			setNotice({
				status: 'error',
				message: __('Please enter a valid email address.', 'frs-users'),
			});
			return;
		}

		setIsSaving(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: '/frs-users/v1/profiles',
				method: 'POST',
				data: {
					...formData,
					is_active: true,
				},
			});

			setNotice({
				status: 'success',
				message: __('Profile created successfully!', 'frs-users'),
			});

			// Redirect to edit page after short delay
			setTimeout(() => {
				const userId = response.data?.user_id || response.data?.id;
				if (userId) {
					window.location.href = `${window.frsProfileAdd.profileEditUrl}${userId}`;
				} else {
					window.location.href = window.frsProfileAdd.listUrl;
				}
			}, 1000);
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Failed to create profile.', 'frs-users'),
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="wrap frs-profile-add">
			<h1>{__('Add New Profile', 'frs-users')}</h1>

			{notice && (
				<Notice
					status={notice.status}
					onRemove={() => setNotice(null)}
					isDismissible
				>
					{notice.message}
				</Notice>
			)}

			<Panel>
				<PanelBody title={__('Basic Information', 'frs-users')} initialOpen={true}>
					<Flex gap={4} wrap>
						<FlexBlock>
							<TextControl
								label={__('First Name', 'frs-users')}
								value={formData.first_name}
								onChange={(v) => updateField('first_name', v)}
								required
							/>
						</FlexBlock>
						<FlexBlock>
							<TextControl
								label={__('Last Name', 'frs-users')}
								value={formData.last_name}
								onChange={(v) => updateField('last_name', v)}
								required
							/>
						</FlexBlock>
					</Flex>

					<TextControl
						label={__('Email', 'frs-users')}
						type="email"
						value={formData.email}
						onChange={(v) => updateField('email', v)}
						required
					/>

					<TextControl
						label={__('Phone', 'frs-users')}
						value={formData.phone_number}
						onChange={handlePhoneChange}
						placeholder="(555) 123-4567"
					/>
				</PanelBody>

				<PanelBody title={__('Professional Information', 'frs-users')} initialOpen={true}>
					<SelectControl
						label={__('Profile Type', 'frs-users')}
						value={formData.select_person_type}
						options={ROLE_OPTIONS}
						onChange={(v) => updateField('select_person_type', v)}
					/>

					<TextControl
						label={__('Job Title', 'frs-users')}
						value={formData.job_title}
						onChange={(v) => updateField('job_title', v)}
					/>

					<TextControl
						label={__('NMLS #', 'frs-users')}
						value={formData.nmls}
						onChange={(v) => updateField('nmls', v)}
					/>
				</PanelBody>
			</Panel>

			<div style={{ marginTop: '20px' }}>
				<Button
					variant="primary"
					onClick={handleSubmit}
					disabled={isSaving}
					isBusy={isSaving}
				>
					{isSaving ? __('Creating...', 'frs-users') : __('Create Profile', 'frs-users')}
				</Button>
				<Button
					variant="secondary"
					href={window.frsProfileAdd?.listUrl || '#'}
					style={{ marginLeft: '10px' }}
				>
					{__('Cancel', 'frs-users')}
				</Button>
			</div>
		</div>
	);
}

export default ProfileAdd;
