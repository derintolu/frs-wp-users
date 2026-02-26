/**
 * Network Sync Control Panel
 *
 * Network-level admin panel for managing Twenty CRM sync across all subsites.
 */
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Spinner,
	ToggleControl,
	TextControl,
	CheckboxControl,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';

// Get localized data from PHP
const { sites = [], twentyCRM = {}, availableRoles = {} } = window.frsNetworkSync || {};

function NetworkSyncPanel() {
	const [networkSettings, setNetworkSettings] = useState({
		enabled: twentyCRM.enabled || false,
		api_url: twentyCRM.api_url || 'https://data.c21frs.com',
		api_key: '',
		webhook_secret: '',
		sync_roles: twentyCRM.sync_roles || ['loan_originator'],
	});
	const [stats, setStats] = useState(null);
	const [syncedUsers, setSyncedUsers] = useState([]);
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

	useEffect(() => {
		loadAllData();
	}, []);

	const loadAllData = async () => {
		setIsLoading(true);
		try {
			await Promise.all([loadSettings(), loadStats(), loadSyncedUsers()]);
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadSettings = async () => {
		try {
			const response = await apiFetch({ path: '/frs-users/v1/network/sync/settings' });
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
			const response = await apiFetch({ path: '/frs-users/v1/network/sync/stats' });
			setStats(response);
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	};

	const loadSyncedUsers = async () => {
		try {
			const response = await apiFetch({ path: '/frs-users/v1/network/sync/users?per_page=1000' });
			setSyncedUsers(response.users || []);
		} catch (error) {
			console.error('Failed to load users:', error);
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
			setNotice({ type: 'success', message: __('Settings saved.', 'frs-users') });
			await loadStats();
		} catch (error) {
			setNotice({ type: 'error', message: error.message || __('Failed to save.', 'frs-users') });
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
				data: { api_url: networkSettings.api_url, api_key: networkSettings.api_key },
			});
			setNotice({ type: 'success', message: response.message || __('Connection successful!', 'frs-users') });
		} catch (error) {
			setNotice({ type: 'error', message: error.message || __('Connection failed.', 'frs-users') });
		} finally {
			setIsTesting(false);
		}
	};

	const handleBulkSync = async () => {
		if (!confirm(__('Sync all eligible users to Twenty CRM?', 'frs-users'))) return;
		setIsSyncing(true);
		setNotice(null);
		try {
			const response = await apiFetch({ path: '/frs-users/v1/network/sync/bulk', method: 'POST' });
			setNotice({ type: 'success', message: response.message });
			await Promise.all([loadStats(), loadSyncedUsers()]);
		} catch (error) {
			setNotice({ type: 'error', message: error.message || __('Bulk sync failed.', 'frs-users') });
		} finally {
			setIsSyncing(false);
		}
	};

	const handleSyncUser = async (userId) => {
		try {
			const response = await apiFetch({ path: `/frs-users/v1/network/sync/user/${userId}`, method: 'POST' });
			setNotice({ type: 'success', message: response.message });
			await loadSyncedUsers();
		} catch (error) {
			setNotice({ type: 'error', message: error.message || __('Sync failed.', 'frs-users') });
		}
	};

	const handleToggleSiteSync = useCallback(async (siteId, enabled) => {
		try {
			await apiFetch({
				path: `/frs-users/v1/network/sync/site/${siteId}`,
				method: 'POST',
				data: { enabled },
			});
			setSitesData((prev) => prev.map((site) => (site.id === siteId ? { ...site, sync_enabled: enabled } : site)));
			await loadStats();
		} catch (error) {
			setNotice({ type: 'error', message: error.message });
		}
	}, []);

	const updateSetting = (field, value) => {
		setNetworkSettings((prev) => ({ ...prev, [field]: value }));
	};

	const toggleRole = (roleSlug) => {
		setNetworkSettings((prev) => {
			const roles = prev.sync_roles || [];
			const newRoles = roles.includes(roleSlug) ? roles.filter((r) => r !== roleSlug) : [...roles, roleSlug];
			return { ...prev, sync_roles: newRoles };
		});
	};

	// Users fields
	const usersFields = useMemo(
		() => [
			{
				id: 'display_name',
				header: __('Name', 'frs-users'),
				getValue: ({ item }) => item.display_name,
				render: ({ item }) => <strong>{item.display_name}</strong>,
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
				header: __('Role', 'frs-users'),
				getValue: ({ item }) => item.company_role || '',
				render: ({ item }) => (item.company_role ? <span className="frs-role-badge frs-role-badge--small">{item.company_role}</span> : <span className="frs-empty">—</span>),
				enableSorting: true,
			},
			{
				id: 'twenty_crm_id',
				header: __('CRM ID', 'frs-users'),
				getValue: ({ item }) => item.twenty_crm_id || '',
				render: ({ item }) => (item.twenty_crm_id ? <code style={{ fontSize: '11px' }}>{item.twenty_crm_id.substring(0, 8)}...</code> : <span className="frs-empty">—</span>),
				enableSorting: false,
			},
			{
				id: 'last_sync',
				header: __('Last Sync', 'frs-users'),
				getValue: ({ item }) => item.last_sync || '',
				render: ({ item }) => item.last_sync || <span className="frs-empty">{__('Never', 'frs-users')}</span>,
				enableSorting: true,
			},
		],
		[]
	);

	// Users actions
	const usersActions = useMemo(
		() => [
			{
				id: 'sync',
				label: __('Sync Now', 'frs-users'),
				callback: async ([item]) => {
					await handleSyncUser(item.ID);
				},
			},
		],
		[]
	);

	// Sites fields
	const sitesFields = useMemo(
		() => [
			{
				id: 'name',
				header: __('Site', 'frs-users'),
				getValue: ({ item }) => item.name,
				render: ({ item }) => (
					<>
						<strong>{item.name}</strong>
						{item.id === 1 && <span className="frs-role-badge frs-role-badge--small" style={{ marginLeft: '8px' }}>{__('Main', 'frs-users')}</span>}
					</>
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
				header: __('Sync Enabled', 'frs-users'),
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
		],
		[handleToggleSiteSync]
	);

	const getItemId = useCallback((item) => item.ID || item.id, []);

	if (isLoading) {
		return (
			<div className="frs-network-sync">
				<div className="frs-network-sync__loading">
					<Spinner />
					<p>{__('Loading...', 'frs-users')}</p>
				</div>
			</div>
		);
	}

	const webhookUrl = `${window.location.origin}/wp-json/frs-users/v1/webhook/twenty-crm`;

	const tabs = [
		{ name: 'users', title: __('Synced Users', 'frs-users') },
		{ name: 'sites', title: __('Sites', 'frs-users') },
		{ name: 'settings', title: __('Settings', 'frs-users') },
	];

	return (
		<div className="frs-network-sync">
			<div className="frs-network-sync__header">
				<h1>{__('Network User Sync', 'frs-users')}</h1>
				{stats && (
					<p className="frs-network-sync__subtitle">
						{stats.total_synced} {__('synced', 'frs-users')} / {stats.eligible_count} {__('eligible users', 'frs-users')}
					</p>
				)}
			</div>

			{notice && (
				<div className={`notice notice-${notice.type} is-dismissible`}>
					<p>{notice.message}</p>
					<button type="button" className="notice-dismiss" onClick={() => setNotice(null)}>
						<span className="screen-reader-text">{__('Dismiss', 'frs-users')}</span>
					</button>
				</div>
			)}

			<TabPanel
				className="frs-network-sync__tabs"
				tabs={tabs}
				initialTabName="users"
			>
				{(tab) => (
					<div className="frs-network-sync__content">
						{tab.name === 'users' && (
							<>
								<div className="frs-network-sync__toolbar">
									<Button
										variant="primary"
										onClick={handleBulkSync}
										isBusy={isSyncing}
										disabled={isSyncing || !stats?.sync_enabled}
									>
										{isSyncing ? __('Syncing...', 'frs-users') : __('Sync All Eligible', 'frs-users')}
									</Button>
								</div>
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
									getItemId={getItemId}
								/>
							</>
						)}

						{tab.name === 'sites' && (
							<DataViews
								data={sitesData}
								fields={sitesFields}
								view={sitesView}
								onChangeView={setSitesView}
								paginationInfo={{
									totalItems: sitesData.length,
									totalPages: Math.ceil(sitesData.length / sitesView.perPage),
								}}
								getItemId={getItemId}
							/>
						)}

						{tab.name === 'settings' && (
							<div className="frs-network-sync__settings">
								<div className="frs-network-sync__settings-section">
									<h2>{__('Connection', 'frs-users')}</h2>
									<ToggleControl
										label={__('Enable Network Sync', 'frs-users')}
										help={networkSettings.enabled ? __('Sync is active', 'frs-users') : __('Sync is disabled', 'frs-users')}
										checked={networkSettings.enabled}
										onChange={(v) => updateSetting('enabled', v)}
									/>
									<TextControl
										label={__('Twenty CRM URL', 'frs-users')}
										value={networkSettings.api_url}
										onChange={(v) => updateSetting('api_url', v)}
										placeholder="https://data.c21frs.com"
									/>
									<TextControl
										label={__('API Key', 'frs-users')}
										type="password"
										value={networkSettings.api_key}
										onChange={(v) => updateSetting('api_key', v)}
										help={__('Leave blank to keep existing', 'frs-users')}
									/>
									<TextControl
										label={__('Webhook Secret', 'frs-users')}
										type="password"
										value={networkSettings.webhook_secret}
										onChange={(v) => updateSetting('webhook_secret', v)}
									/>
								</div>

								<div className="frs-network-sync__settings-section">
									<h2>{__('Sync Roles', 'frs-users')}</h2>
									<p className="frs-network-sync__description">{__('Select roles to sync with Twenty CRM:', 'frs-users')}</p>
									<div className="frs-network-sync__roles">
										{Object.entries(availableRoles).map(([slug, label]) => (
											<CheckboxControl
												key={slug}
												label={label}
												checked={(networkSettings.sync_roles || []).includes(slug)}
												onChange={() => toggleRole(slug)}
												__nextHasNoMarginBottom
											/>
										))}
									</div>
								</div>

								<div className="frs-network-sync__settings-section">
									<h2>{__('Webhook URL', 'frs-users')}</h2>
									<p className="frs-network-sync__description">{__('Add this URL to Twenty CRM:', 'frs-users')}</p>
									<div className="frs-network-sync__webhook">
										<code>{webhookUrl}</code>
										<Button variant="secondary" size="small" onClick={() => navigator.clipboard.writeText(webhookUrl)}>
											{__('Copy', 'frs-users')}
										</Button>
									</div>
								</div>

								<div className="frs-network-sync__actions">
									<Button variant="primary" onClick={handleSaveSettings} isBusy={isSaving} disabled={isSaving}>
										{__('Save Settings', 'frs-users')}
									</Button>
									<Button variant="secondary" onClick={handleTestConnection} isBusy={isTesting} disabled={isTesting}>
										{__('Test Connection', 'frs-users')}
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</TabPanel>
		</div>
	);
}

export default NetworkSyncPanel;
