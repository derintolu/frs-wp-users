/**
 * FRS Profiles Admin App
 *
 * Main admin interface using @wordpress/dataviews with split-view layout
 */
import { useState, useMemo, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Button, Spinner, ToggleControl } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import ProfileDetail from './ProfileDetail';

/**
 * FRS Company Role Labels
 *
 * These are company roles (directory categorization), NOT WordPress roles.
 * Company roles determine where users appear in directories.
 */
const COMPANY_ROLE_LABELS = {
	loan_originator: __('Loan Originator', 'frs-users'),
	broker_associate: __('Broker Associate', 'frs-users'),
	sales_associate: __('Sales Associate', 'frs-users'),
	escrow_officer: __('Escrow Officer', 'frs-users'),
	property_manager: __('Property Manager', 'frs-users'),
	partner: __('Partner', 'frs-users'),
	leadership: __('Leadership', 'frs-users'),
	staff: __('Staff', 'frs-users'),
};

function App() {
	const [profiles, setProfiles] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedProfile, setSelectedProfile] = useState(null);
	const [selection, setSelection] = useState([]);
	const [splitView, setSplitView] = useState(true);
	const [view, setView] = useState({
		type: 'list',
		perPage: 50,
		page: 1,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		search: '',
		filters: [],
		fields: ['avatar', 'name', 'role', 'status'],
	});

	// Fetch profiles from REST API
	useEffect(() => {
		setIsLoading(true);
		apiFetch({
			path: '/frs-users/v1/profiles?per_page=1000',
		})
			.then((response) => {
				const profilesData = response.data || response;
				setProfiles(Array.isArray(profilesData) ? profilesData : []);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching profiles:', error);
				setIsLoading(false);
			});
	}, []);


	// Define fields for DataViews - simplified for list view
	const fields = useMemo(
		() => [
			{
				id: 'avatar',
				header: '',
				getValue: ({ item }) => item.avatar_url || '',
				render: ({ item }) => {
					const avatarUrl = item.avatar_url || `https://www.gravatar.com/avatar/${item.email}?s=40&d=mp`;
					return (
						<div className="frs-avatar">
							<img src={avatarUrl} alt="" />
						</div>
					);
				},
				enableHiding: false,
				enableSorting: false,
				width: 50,
			},
			{
				id: 'name',
				header: __('Name', 'frs-users'),
				getValue: ({ item }) => item.display_name || `${item.first_name} ${item.last_name}`,
				render: ({ item }) => {
					const isSelected = selection.includes(String(item.user_id)) || selection.includes(item.user_id);
					return (
						<div className={`frs-list-item ${isSelected ? 'frs-list-item--selected' : ''}`}>
							<span className="frs-list-item__name">
								{item.display_name || `${item.first_name} ${item.last_name}`}
							</span>
							{item.job_title && (
								<span className="frs-list-item__subtitle">{item.job_title}</span>
							)}
						</div>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'email',
				header: __('Email', 'frs-users'),
				getValue: ({ item }) => item.email,
				render: ({ item }) => (
					<a href={`mailto:${item.email}`} className="frs-email-link">
						{item.email}
					</a>
				),
				enableSorting: true,
			},
			{
				id: 'role',
				header: __('Role', 'frs-users'),
				getValue: ({ item }) => COMPANY_ROLE_LABELS[item.select_person_type] || item.select_person_type,
				render: ({ item }) => {
					const roleLabel = COMPANY_ROLE_LABELS[item.select_person_type] || item.select_person_type;
					if (!roleLabel) return <span className="frs-empty">—</span>;
					return <span className="frs-role-badge frs-role-badge--small">{roleLabel}</span>;
				},
				elements: Object.keys(COMPANY_ROLE_LABELS).map((role) => ({
					value: role,
					label: COMPANY_ROLE_LABELS[role],
				})),
				filterBy: {
					operators: ['isAny'],
				},
				enableSorting: true,
			},
			{
				id: 'nmls',
				header: __('NMLS', 'frs-users'),
				getValue: ({ item }) => item.nmls || '—',
				enableSorting: true,
			},
			{
				id: 'dre_license',
				header: __('DRE License', 'frs-users'),
				getValue: ({ item }) => item.dre_license || '—',
				enableSorting: true,
			},
			{
				id: 'office',
				header: __('Office', 'frs-users'),
				getValue: ({ item }) => item.office || item.city_state || '—',
				enableSorting: true,
			},
			{
				id: 'phone',
				header: __('Phone', 'frs-users'),
				getValue: ({ item }) => item.phone_number || item.mobile_number || '—',
				render: ({ item }) => {
					const phone = item.phone_number || item.mobile_number;
					if (!phone) return <span className="frs-empty">—</span>;
					return (
						<a href={`tel:${phone}`} className="frs-phone-link">
							{phone}
						</a>
					);
				},
			},
			{
				id: 'branch',
				header: __('Branch/Region', 'frs-users'),
				getValue: ({ item }) => item.region || item.city_state || item.office || '—',
				render: ({ item }) => {
					const branch = item.region || item.city_state || item.office;
					if (!branch) return <span className="frs-empty">—</span>;
					return <span>{branch}</span>;
				},
				enableSorting: true,
			},
			{
				id: 'status',
				header: __('Status', 'frs-users'),
				getValue: ({ item }) => (item.is_active ? __('Active', 'frs-users') : __('Inactive', 'frs-users')),
				render: ({ item }) => {
					const statusClass = item.is_active ? 'frs-status-badge--active' : 'frs-status-badge--inactive';
					const role = window.frsProfilesAdmin.roles[item.select_person_type];
					const slug = item.profile_slug || item.user_nicename;
					const prefix = role ? role.url_prefix : 'lo';
					const companyRole = item.select_person_type || '';

					// Get site URLs
					const hubSiteUrl = window.frsProfilesAdmin.hubSiteUrl;
					const isRealEstateRole = ['broker_associate', 'sales_associate'].includes(companyRole);
					const marketingSiteUrl = isRealEstateRole
						? window.frsProfilesAdmin.realestateSiteUrl
						: window.frsProfilesAdmin.lendingSiteUrl;
					const localSiteUrl = window.frsProfilesAdmin.localSiteUrl;

					// Build URLs
					const hubUrl = hubSiteUrl ? `${hubSiteUrl}${prefix}/${slug}/` : null;
					const marketingUrl = marketingSiteUrl ? `${marketingSiteUrl}${prefix}/${slug}/` : null;
					const localUrl = `${localSiteUrl}${prefix}/${slug}/`;

					// Determine which buttons to show
					const hasHub = !!hubSiteUrl;
					const hasMarketing = !!marketingSiteUrl && marketingSiteUrl !== hubSiteUrl;

					return (
						<div className="frs-status-cell">
							<span className={`frs-status-badge frs-status-badge--small ${statusClass}`}>
								{item.is_active ? __('Active', 'frs-users') : __('Inactive', 'frs-users')}
							</span>
							{hasHub && (
								<Button
									variant="secondary"
									size="small"
									href={hubUrl}
									target="_blank"
									className="frs-view-profile-btn"
									title={__('View on hub site', 'frs-users')}
								>
									{__('Hub', 'frs-users')}
								</Button>
							)}
							{hasMarketing && (
								<Button
									variant={hasHub ? 'tertiary' : 'secondary'}
									size="small"
									href={marketingUrl}
									target="_blank"
									className="frs-view-profile-btn"
									title={isRealEstateRole ? 'c21masters.com' : '21stcenturylending.com'}
								>
									{__('Public', 'frs-users')}
								</Button>
							)}
							{!hasHub && !hasMarketing && (
								<Button
									variant="secondary"
									size="small"
									href={localUrl}
									target="_blank"
									className="frs-view-profile-btn"
								>
									{__('View', 'frs-users')}
								</Button>
							)}
						</div>
					);
				},
				elements: [
					{ value: 1, label: __('Active', 'frs-users') },
					{ value: 0, label: __('Inactive', 'frs-users') },
				],
				filterBy: {
					operators: ['is'],
				},
				enableSorting: true,
			},
		],
		[selection]
	);

	// Handle selection change from DataViews
	const onChangeSelection = useCallback(
		(newSelection) => {
			setSelection(newSelection);
			if (newSelection.length > 0) {
				const selectedId = newSelection[0];
				const profile = profiles.find((p) => String(p.user_id) === String(selectedId) || String(p.id) === String(selectedId));
				setSelectedProfile(profile || null);
			} else {
				setSelectedProfile(null);
			}
		},
		[profiles]
	);

	// Define actions - need supportsBulk for selection to work
	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __('Edit', 'frs-users'),
				isPrimary: true,
				supportsBulk: true,
				callback: (items) => {
					const item = items[0];
					window.location.href = `${window.frsProfilesAdmin.profileEditUrl}${item.user_id}`;
				},
			},
			{
				id: 'view-profile',
				label: __('View on Marketing Site', 'frs-users'),
				callback: (items) => {
					const item = items[0];
					const role = window.frsProfilesAdmin.roles[item.select_person_type];
					if (role) {
						const slug = item.profile_slug || item.user_nicename;
						const companyRole = item.select_person_type || '';
						const isRealEstateRole = ['broker_associate', 'sales_associate'].includes(companyRole);
						const siteUrl = isRealEstateRole
							? (window.frsProfilesAdmin.realestateSiteUrl || window.frsProfilesAdmin.localSiteUrl)
							: (window.frsProfilesAdmin.lendingSiteUrl || window.frsProfilesAdmin.localSiteUrl);
						window.open(`${siteUrl}${role.url_prefix}/${slug}/`, '_blank');
					}
				},
			},
		],
		[]
	);

	// Process data: filter, sort, paginate
	const processedData = useMemo(() => {
		let result = [...profiles];

		// Apply search filter
		if (view.search) {
			const searchLower = view.search.toLowerCase();
			result = result.filter((item) => {
				const name = (item.display_name || `${item.first_name} ${item.last_name}`).toLowerCase();
				const email = (item.email || '').toLowerCase();
				return name.includes(searchLower) || email.includes(searchLower);
			});
		}

		// Apply filters
		if (view.filters && view.filters.length > 0) {
			view.filters.forEach((filter) => {
				if (filter.field === 'role' && filter.value) {
					const values = Array.isArray(filter.value) ? filter.value : [filter.value];
					result = result.filter((item) => values.includes(item.select_person_type));
				}
				if (filter.field === 'status' && filter.value !== undefined) {
					const values = Array.isArray(filter.value) ? filter.value : [filter.value];
					result = result.filter((item) => values.includes(item.is_active ? 1 : 0));
				}
			});
		}

		// Apply sorting
		if (view.sort) {
			const { field, direction } = view.sort;
			result.sort((a, b) => {
				let aVal, bVal;
				switch (field) {
					case 'name':
						aVal = a.display_name || `${a.first_name} ${a.last_name}`;
						bVal = b.display_name || `${b.first_name} ${b.last_name}`;
						break;
					case 'email':
						aVal = a.email || '';
						bVal = b.email || '';
						break;
					case 'role':
						aVal = a.select_person_type || '';
						bVal = b.select_person_type || '';
						break;
					case 'status':
						aVal = a.is_active ? 1 : 0;
						bVal = b.is_active ? 1 : 0;
						break;
					default:
						aVal = a[field] || '';
						bVal = b[field] || '';
				}
				if (typeof aVal === 'string') {
					return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
				}
				return direction === 'asc' ? aVal - bVal : bVal - aVal;
			});
		}

		return result;
	}, [profiles, view.search, view.filters, view.sort]);

	// Paginate data
	const paginatedData = useMemo(() => {
		const start = (view.page - 1) * view.perPage;
		return processedData.slice(start, start + view.perPage);
	}, [processedData, view.page, view.perPage]);

	// Get item ID for DataViews
	const getItemId = useCallback((item) => item.user_id || item.id, []);

	if (isLoading) {
		return (
			<div style={{ padding: '40px', textAlign: 'center' }}>
				<Spinner />
				<p>{__('Loading profiles...', 'frs-users')}</p>
			</div>
		);
	}

	return (
		<div className={`frs-profiles-admin ${splitView ? 'frs-profiles-admin--split' : ''}`}>
			<div className="frs-profiles-header">
				<div className="frs-profiles-header__top">
					<h1 className="wp-heading-inline">{__('FRS Profiles', 'frs-users')}</h1>
					<span className="frs-profiles-count">{profiles.length} {__('total', 'frs-users')}</span>
					<a href={window.frsProfilesAdmin.addNewUrl} className="page-title-action">
						{__('Add New', 'frs-users')}
					</a>
				</div>
				<div className="frs-profiles-header__controls">
					<ToggleControl
						label={__('Split View', 'frs-users')}
						checked={splitView}
						onChange={setSplitView}
					/>
				</div>
			</div>

			<div className="frs-profiles-content">
				<div className="frs-profiles-list">
					<DataViews
						data={paginatedData}
						fields={fields}
						view={view}
						onChangeView={setView}
						actions={actions}
						paginationInfo={{
							totalItems: processedData.length,
							totalPages: Math.ceil(processedData.length / view.perPage),
						}}
						getItemId={getItemId}
						selection={selection}
						onChangeSelection={onChangeSelection}
						defaultLayouts={{
							list: {},
							table: {},
						}}
					/>
				</div>

				{splitView && (
					<div className="frs-profiles-detail">
						<ProfileDetail
							profile={selectedProfile}
							roles={window.frsProfilesAdmin.roles}
							editUrl={window.frsProfilesAdmin.profileEditUrl}
							onClose={() => setSelectedProfile(null)}
							onSave={(updatedProfile) => {
								// Update profile in list
								setProfiles((prev) =>
									prev.map((p) =>
										p.user_id === updatedProfile.user_id ? updatedProfile : p
									)
								);
								setSelectedProfile(updatedProfile);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
