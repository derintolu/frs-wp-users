/**
 * Network Sync Control Panel
 *
 * Network-level admin panel for managing Twenty CRM sync across all subsites.
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
	FlexItem,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Spinner,
	TabPanel,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { Icon, check, close, update, people, settings, listView } from '@wordpress/icons';

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
	const [usersPage, setUsersPage] = useState(1);
	const [usersTotalPages, setUsersTotalPages] = useState(1);

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

	const loadSyncedUsers = async (page = 1) => {
		try {
			const response = await apiFetch({
				path: `/frs-users/v1/network/sync/users?page=${page}&per_page=25`,
			});
			setSyncedUsers(response.users || []);
			setUsersPage(response.page);
			setUsersTotalPages(response.total_pages);
		} catch (error) {
			console.error('Failed to load users:', error);
		}
	};

	const loadSyncLog = async () => {
		try {
			const response = await apiFetch({
				path: '/frs-users/v1/network/sync/log?limit=50',
			});
			setSyncLog(response.log || []);
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
			await loadSyncedUsers(usersPage);
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

	if (isLoading) {
		return (
			<div style={{ padding: '40px', textAlign: 'center' }}>
				<Spinner />
				<p>{__('Loading network sync data...', 'frs-users')}</p>
			</div>
		);
	}

	const tabs = [
		{
			name: 'overview',
			title: __('Overview', 'frs-users'),
			icon: listView,
		},
		{
			name: 'users',
			title: __('Synced Users', 'frs-users'),
			icon: people,
		},
		{
			name: 'sites',
			title: __('Sites', 'frs-users'),
			icon: update,
		},
		{
			name: 'settings',
			title: __('Settings', 'frs-users'),
			icon: settings,
		},
		{
			name: 'log',
			title: __('Activity Log', 'frs-users'),
			icon: listView,
		},
	];

	return (
		<div className="frs-network-sync-panel" style={{ maxWidth: '1200px' }}>
			{notice && (
				<Notice
					status={notice.status}
					isDismissible
					onRemove={() => setNotice(null)}
					style={{ marginBottom: '20px' }}
				>
					{notice.message}
				</Notice>
			)}

			<TabPanel
				tabs={tabs}
				onSelect={setActiveTab}
				initialTabName="overview"
			>
				{(tab) => {
					switch (tab.name) {
						case 'overview':
							return <OverviewTab stats={stats} onBulkSync={handleBulkSync} isSyncing={isSyncing} />;
						case 'users':
							return (
								<UsersTab
									users={syncedUsers}
									page={usersPage}
									totalPages={usersTotalPages}
									onPageChange={(p) => loadSyncedUsers(p)}
									onSyncUser={handleSyncUser}
								/>
							);
						case 'sites':
							return (
								<SitesTab
									sites={sitesData}
									onToggleSync={handleToggleSiteSync}
								/>
							);
						case 'settings':
							return (
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
							);
						case 'log':
							return (
								<LogTab
									log={syncLog}
									onClear={handleClearLog}
									onRefresh={loadSyncLog}
								/>
							);
						default:
							return null;
					}
				}}
			</TabPanel>
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
		<VStack spacing={6} style={{ padding: '20px 0' }}>
			<HStack spacing={4} wrap>
				<StatCard
					title={__('Synced Users', 'frs-users')}
					value={stats.total_synced}
					description={__('Users linked to Twenty CRM', 'frs-users')}
				/>
				<StatCard
					title={__('Eligible Users', 'frs-users')}
					value={stats.eligible_count}
					description={__('Users matching sync roles', 'frs-users')}
				/>
				<StatCard
					title={__('Recent Syncs', 'frs-users')}
					value={stats.recent_syncs}
					description={__('In the last 24 hours', 'frs-users')}
				/>
				<StatCard
					title={__('Sites with Sync', 'frs-users')}
					value={`${stats.sites_with_sync} / ${stats.total_sites}`}
					description={__('Subsites enabled', 'frs-users')}
				/>
			</HStack>

			<Card>
				<CardHeader>
					<Heading level={4}>{__('Quick Actions', 'frs-users')}</Heading>
				</CardHeader>
				<CardBody>
					<HStack spacing={4}>
						<Button
							variant="primary"
							onClick={onBulkSync}
							isBusy={isSyncing}
							disabled={isSyncing || !stats.sync_enabled}
						>
							{isSyncing ? __('Syncing...', 'frs-users') : __('Sync All Eligible Users', 'frs-users')}
						</Button>
						{!stats.sync_enabled && (
							<Text variant="muted">
								{__('Enable network sync in Settings to use bulk sync.', 'frs-users')}
							</Text>
						)}
					</HStack>
					{stats.last_bulk_sync && (
						<Text variant="muted" style={{ marginTop: '10px' }}>
							{__('Last bulk sync:', 'frs-users')} {stats.last_bulk_sync}
						</Text>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<Heading level={4}>{__('Sync Status', 'frs-users')}</Heading>
				</CardHeader>
				<CardBody>
					<HStack spacing={2}>
						<Icon
							icon={stats.sync_enabled ? check : close}
							style={{ fill: stats.sync_enabled ? '#00a32a' : '#d63638' }}
						/>
						<Text>
							{stats.sync_enabled
								? __('Network sync is enabled', 'frs-users')
								: __('Network sync is disabled', 'frs-users')}
						</Text>
					</HStack>
				</CardBody>
			</Card>
		</VStack>
	);
}

/**
 * Stat Card Component
 */
function StatCard({ title, value, description }) {
	return (
		<Card style={{ flex: '1 1 200px', minWidth: '200px' }}>
			<CardBody>
				<VStack spacing={1}>
					<Text variant="muted" size="small">{title}</Text>
					<Heading level={2} style={{ margin: 0 }}>{value}</Heading>
					<Text variant="muted" size="small">{description}</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}

/**
 * Users Tab - List of synced users
 */
function UsersTab({ users, page, totalPages, onPageChange, onSyncUser }) {
	if (!users.length) {
		return (
			<Card style={{ marginTop: '20px' }}>
				<CardBody>
					<Text>{__('No synced users found.', 'frs-users')}</Text>
				</CardBody>
			</Card>
		);
	}

	return (
		<VStack spacing={4} style={{ padding: '20px 0' }}>
			<table className="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th>{__('User', 'frs-users')}</th>
						<th>{__('Email', 'frs-users')}</th>
						<th>{__('Company Role', 'frs-users')}</th>
						<th>{__('Twenty CRM ID', 'frs-users')}</th>
						<th>{__('Last Sync', 'frs-users')}</th>
						<th>{__('Actions', 'frs-users')}</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.ID}>
							<td>{user.display_name}</td>
							<td>{user.user_email}</td>
							<td>{user.company_role || '-'}</td>
							<td>
								<code style={{ fontSize: '11px' }}>
									{user.twenty_crm_id ? user.twenty_crm_id.substring(0, 12) + '...' : '-'}
								</code>
							</td>
							<td>{user.last_sync || __('Never', 'frs-users')}</td>
							<td>
								<Button
									variant="secondary"
									size="small"
									onClick={() => onSyncUser(user.ID)}
								>
									{__('Sync Now', 'frs-users')}
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{totalPages > 1 && (
				<HStack spacing={2} justify="center">
					<Button
						variant="secondary"
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
					>
						{__('Previous', 'frs-users')}
					</Button>
					<Text>
						{__('Page', 'frs-users')} {page} {__('of', 'frs-users')} {totalPages}
					</Text>
					<Button
						variant="secondary"
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
					>
						{__('Next', 'frs-users')}
					</Button>
				</HStack>
			)}
		</VStack>
	);
}

/**
 * Sites Tab - Manage sync per subsite
 */
function SitesTab({ sites, onToggleSync }) {
	return (
		<VStack spacing={4} style={{ padding: '20px 0' }}>
			<table className="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th>{__('Site', 'frs-users')}</th>
						<th>{__('URL', 'frs-users')}</th>
						<th>{__('Users', 'frs-users')}</th>
						<th>{__('Sync Enabled', 'frs-users')}</th>
					</tr>
				</thead>
				<tbody>
					{sites.map((site) => (
						<tr key={site.id}>
							<td>
								<strong>{site.name}</strong>
								{site.id === 1 && (
									<span className="dashicons dashicons-admin-home" title={__('Main Site', 'frs-users')} style={{ marginLeft: '5px' }} />
								)}
							</td>
							<td>
								<a href={site.url} target="_blank" rel="noopener noreferrer">
									{site.path}
								</a>
							</td>
							<td>{site.user_count}</td>
							<td>
								<ToggleControl
									checked={site.sync_enabled}
									onChange={(enabled) => onToggleSync(site.id, enabled)}
									__nextHasNoMarginBottom
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</VStack>
	);
}

/**
 * Settings Tab - Network-level configuration
 */
function SettingsTab({ settings, availableRoles, onUpdateSetting, onToggleRole, onSave, onTest, isSaving, isTesting }) {
	const webhookUrl = `${window.location.origin}/wp-json/frs-users/v1/webhook/twenty-crm`;

	return (
		<div style={{ padding: '20px 0', maxWidth: '700px' }}>
			<Panel>
				<PanelBody title={__('Network Sync Settings', 'frs-users')} initialOpen>
					<PanelRow>
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
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('Twenty CRM API URL', 'frs-users')}
							value={settings.api_url}
							onChange={(value) => onUpdateSetting('api_url', value)}
							placeholder="https://data.c21frs.com"
						/>
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('API Key', 'frs-users')}
							type="password"
							value={settings.api_key}
							onChange={(value) => onUpdateSetting('api_key', value)}
							help={__('Leave blank to keep existing key', 'frs-users')}
							placeholder="Enter API key..."
						/>
					</PanelRow>

					<PanelRow>
						<TextControl
							label={__('Webhook Secret', 'frs-users')}
							type="password"
							value={settings.webhook_secret}
							onChange={(value) => onUpdateSetting('webhook_secret', value)}
							help={__('Shared secret for webhook verification', 'frs-users')}
							placeholder="Enter webhook secret..."
						/>
					</PanelRow>
				</PanelBody>

				<PanelBody title={__('Sync Roles', 'frs-users')} initialOpen={false}>
					<PanelRow>
						<VStack spacing={2} style={{ width: '100%' }}>
							<Text>
								{__('Select which company roles should sync with Twenty CRM:', 'frs-users')}
							</Text>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
								{Object.entries(availableRoles).map(([slug, label]) => (
									<CheckboxControl
										key={slug}
										label={label}
										checked={(settings.sync_roles || []).includes(slug)}
										onChange={() => onToggleRole(slug)}
									/>
								))}
							</div>
						</VStack>
					</PanelRow>
				</PanelBody>

				<PanelBody title={__('Webhook URL', 'frs-users')} initialOpen={false}>
					<PanelRow>
						<VStack spacing={2} style={{ width: '100%' }}>
							<Text>{__('Configure this URL in Twenty CRM:', 'frs-users')}</Text>
							<code style={{
								display: 'block',
								padding: '10px',
								background: '#f0f0f1',
								borderRadius: '4px',
								fontSize: '12px',
								wordBreak: 'break-all',
							}}>
								{webhookUrl}
							</code>
							<Button
								variant="secondary"
								size="small"
								onClick={() => {
									navigator.clipboard.writeText(webhookUrl);
								}}
							>
								{__('Copy URL', 'frs-users')}
							</Button>
						</VStack>
					</PanelRow>
				</PanelBody>
			</Panel>

			<Spacer marginTop={4} />

			<HStack spacing={3}>
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
			</HStack>
		</div>
	);
}

/**
 * Log Tab - Activity log
 */
function LogTab({ log, onClear, onRefresh }) {
	return (
		<VStack spacing={4} style={{ padding: '20px 0' }}>
			<HStack spacing={2}>
				<Button variant="secondary" onClick={onRefresh}>
					{__('Refresh', 'frs-users')}
				</Button>
				<Button variant="tertiary" isDestructive onClick={onClear}>
					{__('Clear Log', 'frs-users')}
				</Button>
			</HStack>

			{!log.length ? (
				<Card>
					<CardBody>
						<Text>{__('No sync activity recorded.', 'frs-users')}</Text>
					</CardBody>
				</Card>
			) : (
				<table className="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th style={{ width: '150px' }}>{__('Time', 'frs-users')}</th>
							<th style={{ width: '120px' }}>{__('Action', 'frs-users')}</th>
							<th style={{ width: '80px' }}>{__('Status', 'frs-users')}</th>
							<th>{__('User', 'frs-users')}</th>
							<th>{__('Details', 'frs-users')}</th>
						</tr>
					</thead>
					<tbody>
						{log.map((entry, index) => (
							<tr key={index}>
								<td>{entry.timestamp}</td>
								<td>{entry.action}</td>
								<td>
									<span style={{
										color: entry.status === 'success' ? '#00a32a' : entry.status === 'failed' ? '#d63638' : '#666',
									}}>
										{entry.status}
									</span>
								</td>
								<td>{entry.user_name || '-'}</td>
								<td>
									{typeof entry.details === 'object'
										? JSON.stringify(entry.details)
										: entry.details || '-'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</VStack>
	);
}

export default NetworkSyncPanel;
