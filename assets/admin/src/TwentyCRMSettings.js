/**
 * Twenty CRM Settings Component
 *
 * Settings page for configuring Twenty CRM integration
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Notice,
	TextControl,
	ToggleControl,
	CheckboxControl,
	Panel,
	PanelBody,
	PanelRow,
	Flex,
	FlexBlock,
	Card,
	CardHeader,
	CardBody,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { check, warning } from '@wordpress/icons';

function TwentyCRMSettings() {
	const [settings, setSettings] = useState({
		enabled: false,
		api_url: 'https://data.c21frs.com',
		api_key: '',
		webhook_secret: '',
		sync_roles: ['loan_originator'],
		available_roles: {},
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [notice, setNotice] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState(null);

	// Get WordPress webhook URL
	const webhookUrl = `${window.location.origin}/wp-json/frs-users/v1/webhook/twenty-crm`;

	// Load settings on mount
	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/settings/twenty-crm',
			});
			setSettings(response);
		} catch (error) {
			setNotice({
				status: 'error',
				message: __('Failed to load settings.', 'frs-users'),
			});
		} finally {
			setIsLoading(false);
		}
	};

	const updateSetting = (field, value) => {
		setSettings((prev) => ({ ...prev, [field]: value }));
	};

	const toggleRole = (roleSlug) => {
		setSettings((prev) => {
			const currentRoles = prev.sync_roles || [];
			const newRoles = currentRoles.includes(roleSlug)
				? currentRoles.filter((r) => r !== roleSlug)
				: [...currentRoles, roleSlug];
			return { ...prev, sync_roles: newRoles };
		});
	};

	const handleSave = async () => {
		setIsSaving(true);
		setNotice(null);

		try {
			await apiFetch({
				path: '/frs-users/v1/settings/twenty-crm',
				method: 'POST',
				data: settings,
			});

			setNotice({
				status: 'success',
				message: __('Settings saved successfully!', 'frs-users'),
			});
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Failed to save settings.', 'frs-users'),
			});
		} finally {
			setIsSaving(false);
		}
	};

	const testConnection = async () => {
		setIsTesting(true);
		setConnectionStatus(null);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: '/frs-users/v1/settings/twenty-crm/test',
				method: 'POST',
				data: {
					api_url: settings.api_url,
					api_key: settings.api_key,
				},
			});

			setConnectionStatus({
				success: true,
				message: response.message || __('Connection successful!', 'frs-users'),
			});
		} catch (error) {
			setConnectionStatus({
				success: false,
				message: error.message || __('Connection failed. Please check your API URL and key.', 'frs-users'),
			});
		} finally {
			setIsTesting(false);
		}
	};

	const copyWebhookUrl = () => {
		navigator.clipboard.writeText(webhookUrl);
		setNotice({
			status: 'success',
			message: __('Webhook URL copied to clipboard!', 'frs-users'),
			isDismissible: true,
		});
	};

	if (isLoading) {
		return (
			<div style={{ padding: '20px', textAlign: 'center' }}>
				<Spinner />
			</div>
		);
	}

	return (
		<div className="frs-twenty-crm-settings" style={{ maxWidth: '800px', padding: '20px' }}>
			<h1>{__('Twenty CRM Integration', 'frs-users')}</h1>
			<p className="description">
				{__('Configure bidirectional synchronization between WordPress and Twenty CRM.', 'frs-users')}
			</p>

			{notice && (
				<Notice
					status={notice.status}
					isDismissible={notice.isDismissible !== false}
					onRemove={() => setNotice(null)}
				>
					{notice.message}
				</Notice>
			)}

			<Panel>
				<PanelBody title={__('Connection Settings', 'frs-users')} initialOpen={true}>
					<PanelRow>
						<ToggleControl
							label={__('Enable Twenty CRM Sync', 'frs-users')}
							help={
								settings.enabled
									? __('Profile updates will be synced to Twenty CRM', 'frs-users')
									: __('Enable to start syncing profiles', 'frs-users')
							}
							checked={settings.enabled}
							onChange={(value) => updateSetting('enabled', value)}
						/>
					</PanelRow>

					<PanelRow>
						<div style={{ width: '100%' }}>
							<strong>{__('Sync Company Roles', 'frs-users')}</strong>
							<p className="description" style={{ marginTop: '8px', marginBottom: '12px' }}>
								{__('Select which company roles should be synced with Twenty CRM', 'frs-users')}
							</p>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
								{Object.entries(settings.available_roles || {}).map(([slug, label]) => (
									<CheckboxControl
										key={slug}
										label={label}
										checked={(settings.sync_roles || []).includes(slug)}
										onChange={() => toggleRole(slug)}
									/>
								))}
							</div>
						</div>
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('Twenty CRM API URL', 'frs-users')}
							value={settings.api_url}
							onChange={(value) => updateSetting('api_url', value)}
							help={__('Your Twenty CRM instance URL', 'frs-users')}
							placeholder="https://data.c21frs.com"
						/>
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('API Key', 'frs-users')}
							type="password"
							value={settings.api_key}
							onChange={(value) => updateSetting('api_key', value)}
							help={
								<>
									{__('Get your API key from ', 'frs-users')}
									<ExternalLink href={`${settings.api_url}/settings/developers`}>
										{__('Twenty CRM → Settings → API & Webhooks', 'frs-users')}
									</ExternalLink>
								</>
							}
							placeholder={__('Enter your Twenty CRM API key...', 'frs-users')}
						/>
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('Webhook Secret', 'frs-users')}
							type="password"
							value={settings.webhook_secret}
							onChange={(value) => updateSetting('webhook_secret', value)}
							help={__('Shared secret for HMAC signing. Use the same value in your Twenty CRM app.', 'frs-users')}
							placeholder={__('Enter a secure secret key...', 'frs-users')}
						/>
					</PanelRow>

					<PanelRow>
						<Flex>
							<FlexBlock>
								<Button
									variant="primary"
									onClick={handleSave}
									isBusy={isSaving}
									disabled={isSaving}
								>
									{__('Save Settings', 'frs-users')}
								</Button>
							</FlexBlock>
							<FlexBlock>
								<Button
									variant="secondary"
									onClick={testConnection}
									isBusy={isTesting}
									disabled={isTesting || !settings.api_url || !settings.api_key}
								>
									{__('Test Connection', 'frs-users')}
								</Button>
							</FlexBlock>
						</Flex>
					</PanelRow>

					{connectionStatus && (
						<PanelRow>
							<Notice
								status={connectionStatus.success ? 'success' : 'error'}
								isDismissible={false}
							>
								{connectionStatus.message}
							</Notice>
						</PanelRow>
					)}
				</PanelBody>

				<PanelBody title={__('Webhook Configuration', 'frs-users')} initialOpen={false}>
					<Card>
						<CardHeader>
							<strong>{__('WordPress Webhook URL', 'frs-users')}</strong>
						</CardHeader>
						<CardBody>
							<p className="description">
								{__('Configure this URL in your Twenty CRM app to receive updates from Twenty CRM:', 'frs-users')}
							</p>
							<Flex align="center" gap={2} style={{ marginTop: '10px' }}>
								<FlexBlock>
									<code style={{
										display: 'block',
										padding: '10px',
										background: '#f0f0f1',
										borderRadius: '4px',
										fontSize: '13px',
										wordBreak: 'break-all',
									}}>
										{webhookUrl}
									</code>
								</FlexBlock>
								<Button
									variant="secondary"
									onClick={copyWebhookUrl}
									size="small"
								>
									{__('Copy', 'frs-users')}
								</Button>
							</Flex>
						</CardBody>
					</Card>

					<div style={{ marginTop: '20px' }}>
						<h4>{__('Setup Instructions', 'frs-users')}</h4>
						<ol style={{ lineHeight: '1.8' }}>
							<li>
								{__('Create a shared webhook secret and enter it above', 'frs-users')}
							</li>
							<li>
								{__('In your Twenty CRM app, set the WP_WEBHOOK_SECRET environment variable to the same secret', 'frs-users')}
							</li>
							<li>
								{__('Copy the WordPress webhook URL above', 'frs-users')}
							</li>
							<li>
								{__('Configure your Twenty CRM app to send webhooks to that URL', 'frs-users')}
							</li>
							<li>
								{__('Test the connection using the button above', 'frs-users')}
							</li>
						</ol>
					</div>
				</PanelBody>

				<PanelBody title={__('Sync Status', 'frs-users')} initialOpen={false}>
					<Card>
						<CardBody>
							<Flex direction="column" gap={4}>
								<div>
									<strong>{__('Sync Direction:', 'frs-users')}</strong>
									<p className="description">
										{__('Bidirectional - WordPress ↔ Twenty CRM', 'frs-users')}
									</p>
								</div>
								<div>
									<strong>{__('WordPress → Twenty CRM:', 'frs-users')}</strong>
									<p className="description">
										{__('Profile updates in WordPress are sent to Twenty CRM', 'frs-users')}
									</p>
								</div>
								<div>
									<strong>{__('Twenty CRM → WordPress:', 'frs-users')}</strong>
									<p className="description">
										{__('Person record updates in Twenty CRM are synced to WordPress', 'frs-users')}
									</p>
								</div>
							</Flex>
						</CardBody>
					</Card>
				</PanelBody>
			</Panel>
		</div>
	);
}

export default TwentyCRMSettings;
