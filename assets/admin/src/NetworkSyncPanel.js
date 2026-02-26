/**
 * Network Sync Control Panel
 *
 * Network-level admin panel for managing Twenty CRM sync across all subsites.
 * Uses @wordpress/dataviews for native WordPress admin appearance.
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Notice,
	TextControl,
	ToggleControl,
	CheckboxControl,
	Spinner,
	Card,
	CardHeader,
	CardBody,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { Icon, check, close, backup, people, cog } from '@wordpress/icons';
import './style.scss';

// Get localized data from PHP
const { sites = [], twentyCRM = {}, availableRoles = {}, restUrl, nonce } = window.frsNetworkSync || {};

function NetworkSyncPanel() {
	const [activeTab, setActiveTab] = useState('overview');
	const [networkSettings, setNetworkSettings] = useState({
		enabled: twentyCRM.enabled || false,
		api_url: twentyCRM.api_url || 'https://data.c21frs.com',
		api_key: '',
		webhook_secret: '',
		sync_roles: twentyCRM.sync_roles || ['loan_originator'],
	});
	const [stats, setStats] = useState(null);
	const [syncedUsers, setSyncedUsers] = useState([]);
	const [syncLog, setSyncLog] = useState([]);
	const [sitesData, setSitesData] = useState(sites);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const [notice, setNotice] = useState(null);

	// DataViews state for users
	const [usersView, setUsersView] = useState({
		type: 'table',
		perPage: 25,
		page: 1,
		sort: { field: 'display_name', direction: 'asc' },
		search: '',
		filters: [],
		fields: ['display_name', 'user_email', 'company_role', 'twenty_crm_id', 'last_sync'],
	});

	// DataViews state for sites
	const [sitesView, setSitesView] = useState({
		type: 'table',
		perPage: 50,
		page: 1,
		sort: { field: 'name', direction: 'asc' },
		search: '',
		filters: [],
		fields: ['name', 'url', 'user_count', 'sync_enabled'],
	});

	// DataViews state for log
	const [logView, setLogView] = useState({
		type: 'table',
		perPage: 50,
		page: 1,
		sort: { field: 'timestamp', direction: 'desc' },
		search: '',
		filters: [],
		fields: ['timestamp', 'action', 'status', 'user_name', 'details'],
	});

	// Load data on mount
	useEffect(() => {
		loadAllData();
	}, []);

	const loadAllData = async () => {
		setIsLoading(true);
		try {
			await Promise.all([
				loadSettings(),
				loadStats(),
				loadSyncedUsers(),
				loadSyncLog(),
			]);
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadSettings = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/settings',
			});
			setNetworkSettings((prev) => ({
				...prev,
				enabled: response.enabled,
				api_url: response.api_url || prev.api_url,
				api_key: response.api_key_set ? '********' : '',
				webhook_secret: response.webhook_secret || '',
				sync_roles: response.sync_roles || prev.sync_roles,
			}));
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	};

	const loadStats = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/stats',
			});
			setStats(response);
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	};

	const loadSyncedUsers = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/users?per_page=1000',
			});
			setSyncedUsers(response.users || []);
		} catch (error) {
			console.error('Failed to load users:', error);
		}
	};

	const loadSyncLog = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/log?limit=100',
			});
			setSyncLog((response.log || []).map((entry, index) => ({ ...entry, id: index })));
		} catch (error) {
			console.error('Failed to load sync log:', error);
		}
	};

	const handleSaveSettings = async () => {
		setIsSaving(true);
		setNotice(null);

		try {
			await apiFetch({
				path: '/frs-users/v1/network/sync/settings',
				method: 'POST',
				data: networkSettings,
			});

			setNotice({
				status: 'success',
				message: __('Network sync settings saved.', 'frs-users'),
			});
			await loadStats();
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Failed to save settings.', 'frs-users'),
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleTestConnection = async () => {
		setIsTesting(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/test',
				method: 'POST',
				data: {
					api_url: networkSettings.api_url,
					api_key: networkSettings.api_key,
				},
			});

			setNotice({
				status: 'success',
				message: response.message || __('Connection successful!', 'frs-users'),
			});
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Connection failed.', 'frs-users'),
			});
		} finally {
			setIsTesting(false);
		}
	};

	const handleBulkSync = async () => {
		if (!confirm(__('This will sync all eligible users to Twenty CRM. Continue?', 'frs-users'))) {
			return;
		}

		setIsSyncing(true);
		setNotice(null);

		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/bulk',
				method: 'POST',
			});

			setNotice({
				status: 'success',
				message: response.message,
			});
			await Promise.all([loadStats(), loadSyncedUsers(), loadSyncLog()]);
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Bulk sync failed.', 'frs-users'),
			});
		} finally {
			setIsSyncing(false);
		}
	};

	const handleSyncUser = async (userId) => {
		try {
			const response = await apiFetch({
				path: `/frs-users/v1/network/sync/user/${userId}`,
				method: 'POST',
			});

			setNotice({
				status: 'success',
				message: response.message,
			});
			await loadSyncedUsers();
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('User sync failed.', 'frs-users'),
			});
		}
	};

	const handleToggleSiteSync = async (siteId, enabled) => {
		try {
			await apiFetch({
				path: `/frs-users/v1/network/sync/site/${siteId}`,
				method: 'POST',
				data: { enabled },
			});

			setSitesData((prev) =>
				prev.map((site) =>
					site.id === siteId ? { ...site, sync_enabled: enabled } : site
				)
			);
			await loadStats();
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message || __('Failed to update site.', 'frs-users'),
			});
		}
	};

	const handleClearLog = async () => {
		if (!confirm(__('Clear the entire sync log?', 'frs-users'))) {
			return;
		}

		try {
			await apiFetch({
				path: '/frs-users/v1/network/sync/log/clear',
				method: 'POST',
			});
			setSyncLog([]);
			setNotice({
				status: 'success',
				message: __('Sync log cleared.', 'frs-users'),
			});
		} catch (error) {
			setNotice({
				status: 'error',
				message: error.message,
			});
		}
	};

	const updateSetting = (field, value) => {
		setNetworkSettings((prev) => ({ ...prev, [field]: value }));
	};

	const toggleRole = (roleSlug) => {
		setNetworkSettings((prev) => {
			const currentRoles = prev.sync_roles || [];
			const newRoles = currentRoles.includes(roleSlug)
				? currentRoles.filter((r) => r !== roleSlug)
				: [...currentRoles, roleSlug];
			return { ...prev, sync_roles: newRoles };
		});
	};

	// Users DataViews fields
	const usersFields = useMemo(() => [
		{
			id: 'display_name',
			header: __('User', 'frs-users'),
			getValue: ({ item }) => item.display_name,
			render: ({ item }) => (
				<strong>{item.display_name}</strong>
			),
			enableSorting: true,
		},
		{
			id: 'user_email',
			header: __('Email', 'frs-users'),
			getValue: ({ item }) => item.user_email,
			enableSorting: true,
		},
		{
			id: 'company_role',
			header: __('Company Role', 'frs-users'),
			getValue: ({ item }) => item.company_role || '',
			render: ({ item }) => item.company_role || '—',
			enableSorting: true,
		},
		{
			id: 'twenty_crm_id',
			header: __('CRM ID', 'frs-users'),
			getValue: ({ item }) => item.twenty_crm_id || '',
			render: ({ item }) => (
				item.twenty_crm_id ? (
					<code className="frs-crm-id">{item.twenty_crm_id.substring(0, 8)}...</code>
				) : '—'
			),
			enableSorting: false,
		},
		{
			id: 'last_sync',
			header: __('Last Sync', 'frs-users'),
			getValue: ({ item }) => item.last_sync || '',
			render: ({ item }) => item.last_sync || __('Never', 'frs-users'),
			enableSorting: true,
		},
	], []);

	// Users actions
	const usersActions = useMemo(() => [
		{
			id: 'sync',
			label: __('Sync Now', 'frs-users'),
			callback: async ([item]) => {
				await handleSyncUser(item.ID);
			},
		},
	], []);

	// Sites DataViews fields
	const sitesFields = useMemo(() => [
		{
			id: 'name',
			header: __('Site', 'frs-users'),
			getValue: ({ item }) => item.name,
			render: ({ item }) => (
				<span className="frs-site-name">
					<strong>{item.name}</strong>
					{item.id === 1 && (
						<span className="frs-badge frs-badge--primary">{__('Main', 'frs-users')}</span>
					)}
				</span>
			),
			enableSorting: true,
		},
		{
			id: 'url',
			header: __('URL', 'frs-users'),
			getValue: ({ item }) => item.path,
			render: ({ item }) => (
				<a href={item.url} target="_blank" rel="noopener noreferrer">
					{item.path}
				</a>
			),
			enableSorting: true,
		},
		{
			id: 'user_count',
			header: __('Users', 'frs-users'),
			getValue: ({ item }) => item.user_count,
			enableSorting: true,
		},
		{
			id: 'sync_enabled',
			header: __('Sync', 'frs-users'),
			getValue: ({ item }) => item.sync_enabled,
			render: ({ item }) => (
				<ToggleControl
					checked={item.sync_enabled}
					onChange={(enabled) => handleToggleSiteSync(item.id, enabled)}
					__nextHasNoMarginBottom
				/>
			),
			enableSorting: true,
		},
	], []);

	// Log DataViews fields
	const logFields = useMemo(() => [
		{
			id: 'timestamp',
			header: __('Time', 'frs-users'),
			getValue: ({ item }) => item.timestamp,
			enableSorting: true,
			width: 160,
		},
		{
			id: 'action',
			header: __('Action', 'frs-users'),
			getValue: ({ item }) => item.action,
			enableSorting: true,
			width: 120,
		},
		{
			id: 'status',
			header: __('Status', 'frs-users'),
			getValue: ({ item }) => item.status,
			render: ({ item }) => (
				<span className={`frs-status frs-status--${item.status}`}>
					<Icon
						icon={item.status === 'success' ? check : close}
						size={16}
					/>
					{item.status}
				</span>
			),
			enableSorting: true,
			width: 100,
		},
		{
			id: 'user_name',
			header: __('User', 'frs-users'),
			getValue: ({ item }) => item.user_name || '',
			render: ({ item }) => item.user_name || '—',
			enableSorting: true,
		},
		{
			id: 'details',
			header: __('Details', 'frs-users'),
			getValue: ({ item }) => typeof item.details === 'object' ? JSON.stringify(item.details) : item.details || '',
			render: ({ item }) => {
				const details = typeof item.details === 'object' ? JSON.stringify(item.details) : item.details;
				return details || '—';
			},
			enableSorting: false,
		},
	], []);

	if (isLoading) {
		return (
			<div className="frs-network-sync-loading">
				<Spinner />
				<p>{__('Loading network sync data...', 'frs-users')}</p>
			</div>
		);
	}

	const tabs = [
		{ name: 'overview', title: __('Overview', 'frs-users') },
		{ name: 'users', title: __('Synced Users', 'frs-users') },
		{ name: 'sites', title: __('Sites', 'frs-users') },
		{ name: 'settings', title: __('Settings', 'frs-users') },
		{ name: 'log', title: __('Activity Log', 'frs-users') },
	];

	return (
		<div className="wrap">
			<h1 className="wp-heading-inline">{__('User Sync Control', 'frs-users')}</h1>
			<hr className="wp-header-end" />

			{notice && (
				<Notice
					status={notice.status}
					isDismissible
					onRemove={() => setNotice(null)}
				>
					{notice.message}
				</Notice>
			)}

			<nav className="nav-tab-wrapper">
				{tabs.map((tab) => (
					<button
						key={tab.name}
						type="button"
						className={`nav-tab ${activeTab === tab.name ? 'nav-tab-active' : ''}`}
						onClick={() => setActiveTab(tab.name)}
					>
						{tab.title}
					</button>
				))}
			</nav>

			<div className="frs-network-sync-content">
				{activeTab === 'overview' && (
					<OverviewTab
						stats={stats}
						onBulkSync={handleBulkSync}
						isSyncing={isSyncing}
					/>
				)}

				{activeTab === 'users' && (
					<div className="frs-dataviews-container">
						<DataViews
							data={syncedUsers}
							fields={usersFields}
							view={usersView}
							onChangeView={setUsersView}
							actions={usersActions}
							paginationInfo={{
								totalItems: syncedUsers.length,
								totalPages: Math.ceil(syncedUsers.length / usersView.perPage),
							}}
							getItemId={(item) => item.ID}
						/>
					</div>
				)}

				{activeTab === 'sites' && (
					<div className="frs-dataviews-container">
						<DataViews
							data={sitesData}
							fields={sitesFields}
							view={sitesView}
							onChangeView={setSitesView}
							paginationInfo={{
								totalItems: sitesData.length,
								totalPages: Math.ceil(sitesData.length / sitesView.perPage),
							}}
							getItemId={(item) => item.id}
						/>
					</div>
				)}

				{activeTab === 'settings' && (
					<SettingsTab
						settings={networkSettings}
						availableRoles={availableRoles}
						onUpdateSetting={updateSetting}
						onToggleRole={toggleRole}
						onSave={handleSaveSettings}
						onTest={handleTestConnection}
						isSaving={isSaving}
						isTesting={isTesting}
					/>
				)}

				{activeTab === 'log' && (
					<div className="frs-dataviews-container">
						<div className="frs-log-actions">
							<Button variant="secondary" onClick={loadSyncLog}>
								{__('Refresh', 'frs-users')}
							</Button>
							<Button variant="tertiary" isDestructive onClick={handleClearLog}>
								{__('Clear Log', 'frs-users')}
							</Button>
						</div>
						<DataViews
							data={syncLog}
							fields={logFields}
							view={logView}
							onChangeView={setLogView}
							paginationInfo={{
								totalItems: syncLog.length,
								totalPages: Math.ceil(syncLog.length / logView.perPage),
							}}
							getItemId={(item) => item.id}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Overview Tab - Stats and quick actions
 */
function OverviewTab({ stats, onBulkSync, isSyncing }) {
	if (!stats) {
		return <Spinner />;
	}

	return (
		<div className="frs-overview">
			<div className="frs-stats-grid">
				<Card className="frs-stat-card">
					<CardBody>
						<div className="frs-stat-icon">
							<Icon icon={people} size={24} />
						</div>
						<div className="frs-stat-content">
							<span className="frs-stat-value">{stats.total_synced}</span>
							<span className="frs-stat-label">{__('Synced Users', 'frs-users')}</span>
						</div>
					</CardBody>
				</Card>

				<Card className="frs-stat-card">
					<CardBody>
						<div className="frs-stat-icon">
							<Icon icon={people} size={24} />
						</div>
						<div className="frs-stat-content">
							<span className="frs-stat-value">{stats.eligible_count}</span>
							<span className="frs-stat-label">{__('Eligible Users', 'frs-users')}</span>
						</div>
					</CardBody>
				</Card>

				<Card className="frs-stat-card">
					<CardBody>
						<div className="frs-stat-icon">
							<Icon icon={backup} size={24} />
						</div>
						<div className="frs-stat-content">
							<span className="frs-stat-value">{stats.recent_syncs}</span>
							<span className="frs-stat-label">{__('Recent Syncs (24h)', 'frs-users')}</span>
						</div>
					</CardBody>
				</Card>

				<Card className="frs-stat-card">
					<CardBody>
						<div className="frs-stat-icon">
							<Icon icon={cog} size={24} />
						</div>
						<div className="frs-stat-content">
							<span className="frs-stat-value">{stats.sites_with_sync} / {stats.total_sites}</span>
							<span className="frs-stat-label">{__('Sites Enabled', 'frs-users')}</span>
						</div>
					</CardBody>
				</Card>
			</div>

			<Card className="frs-actions-card">
				<CardHeader>
					<h3>{__('Quick Actions', 'frs-users')}</h3>
				</CardHeader>
				<CardBody>
					<div className="frs-actions-row">
						<Button
							variant="primary"
							onClick={onBulkSync}
							isBusy={isSyncing}
							disabled={isSyncing || !stats.sync_enabled}
						>
							{isSyncing ? __('Syncing...', 'frs-users') : __('Sync All Eligible Users', 'frs-users')}
						</Button>

						{!stats.sync_enabled && (
							<p className="frs-help-text">
								{__('Enable network sync in Settings to use bulk sync.', 'frs-users')}
							</p>
						)}
					</div>

					{stats.last_bulk_sync && (
						<p className="frs-meta-text">
							{__('Last bulk sync:', 'frs-users')} {stats.last_bulk_sync}
						</p>
					)}
				</CardBody>
			</Card>

			<Card className="frs-status-card">
				<CardHeader>
					<h3>{__('Sync Status', 'frs-users')}</h3>
				</CardHeader>
				<CardBody>
					<div className={`frs-status-indicator frs-status-indicator--${stats.sync_enabled ? 'enabled' : 'disabled'}`}>
						<Icon icon={stats.sync_enabled ? check : close} size={20} />
						<span>
							{stats.sync_enabled
								? __('Network sync is enabled', 'frs-users')
								: __('Network sync is disabled', 'frs-users')}
						</span>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}

/**
 * Settings Tab - Network-level configuration
 */
function SettingsTab({ settings, availableRoles, onUpdateSetting, onToggleRole, onSave, onTest, isSaving, isTesting }) {
	const webhookUrl = `${window.location.origin}/wp-json/frs-users/v1/webhook/twenty-crm`;

	return (
		<div className="frs-settings">
			<Card>
				<CardHeader>
					<h3>{__('Connection Settings', 'frs-users')}</h3>
				</CardHeader>
				<CardBody>
					<div className="frs-form-row">
						<ToggleControl
							label={__('Enable Network Sync', 'frs-users')}
							help={
								settings.enabled
									? __('Twenty CRM sync is active across the network', 'frs-users')
									: __('Enable to sync users with Twenty CRM', 'frs-users')
							}
							checked={settings.enabled}
							onChange={(value) => onUpdateSetting('enabled', value)}
						/>
					</div>

					<div className="frs-form-row">
						<TextControl
							label={__('Twenty CRM API URL', 'frs-users')}
							value={settings.api_url}
							onChange={(value) => onUpdateSetting('api_url', value)}
							placeholder="https://data.c21frs.com"
							__nextHasNoMarginBottom
						/>
					</div>

					<div className="frs-form-row">
						<TextControl
							label={__('API Key', 'frs-users')}
							type="password"
							value={settings.api_key}
							onChange={(value) => onUpdateSetting('api_key', value)}
							help={__('Leave blank to keep existing key', 'frs-users')}
							placeholder="Enter API key..."
							__nextHasNoMarginBottom
						/>
					</div>

					<div className="frs-form-row">
						<TextControl
							label={__('Webhook Secret', 'frs-users')}
							type="password"
							value={settings.webhook_secret}
							onChange={(value) => onUpdateSetting('webhook_secret', value)}
							help={__('Shared secret for webhook verification', 'frs-users')}
							placeholder="Enter webhook secret..."
							__nextHasNoMarginBottom
						/>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h3>{__('Sync Roles', 'frs-users')}</h3>
				</CardHeader>
				<CardBody>
					<p className="frs-help-text">
						{__('Select which company roles should sync with Twenty CRM:', 'frs-users')}
					</p>
					<div className="frs-checkbox-grid">
						{Object.entries(availableRoles).map(([slug, label]) => (
							<CheckboxControl
								key={slug}
								label={label}
								checked={(settings.sync_roles || []).includes(slug)}
								onChange={() => onToggleRole(slug)}
								__nextHasNoMarginBottom
							/>
						))}
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h3>{__('Webhook URL', 'frs-users')}</h3>
				</CardHeader>
				<CardBody>
					<p className="frs-help-text">
						{__('Configure this URL in Twenty CRM to receive updates:', 'frs-users')}
					</p>
					<div className="frs-webhook-url">
						<code>{webhookUrl}</code>
						<Button
							variant="secondary"
							size="small"
							onClick={() => navigator.clipboard.writeText(webhookUrl)}
						>
							{__('Copy', 'frs-users')}
						</Button>
					</div>
				</CardBody>
			</Card>

			<div className="frs-form-actions">
				<Button
					variant="primary"
					onClick={onSave}
					isBusy={isSaving}
					disabled={isSaving}
				>
					{__('Save Settings', 'frs-users')}
				</Button>
				<Button
					variant="secondary"
					onClick={onTest}
					isBusy={isTesting}
					disabled={isTesting}
				>
					{__('Test Connection', 'frs-users')}
				</Button>
			</div>
		</div>
	);
}

export default NetworkSyncPanel;
