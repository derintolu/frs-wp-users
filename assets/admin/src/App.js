/**
 * FRS Profiles Admin App
 *
 * Main admin interface using @wordpress/dataviews
 */
import { useState, useMemo } from '@wordpress/element';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useEffect } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';

const ROLE_LABELS = {
	loan_officer: __('Loan Officer', 'frs-users'),
	realtor_partner: __('Realtor Partner', 'frs-users'),
	staff: __('Staff', 'frs-users'),
	leadership: __('Leadership', 'frs-users'),
	assistant: __('Assistant', 'frs-users'),
};

function App() {
	const [profiles, setProfiles] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [view, setView] = useState({
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		search: '',
		filters: [],
	});

	// Fetch profiles from REST API
	useEffect(() => {
		setIsLoading(true);
		apiFetch({
			path: '/frs-users/v1/profiles',
		})
			.then((data) => {
				setProfiles(data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching profiles:', error);
				setIsLoading(false);
			});
	}, []);

	// Define fields for DataViews
	const fields = useMemo(
		() => [
			{
				id: 'name',
				header: __('Name', 'frs-users'),
				getValue: ({ item }) => item.display_name || `${item.first_name} ${item.last_name}`,
				render: ({ item }) => {
					const editUrl = `${window.frsProfilesAdmin.userEditUrl}${item.user_id}`;
					return (
						<strong>
							<a href={editUrl}>
								{item.display_name || `${item.first_name} ${item.last_name}`}
							</a>
						</strong>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'email',
				header: __('Email', 'frs-users'),
				getValue: ({ item }) => item.email,
				enableSorting: true,
			},
			{
				id: 'role',
				header: __('Role', 'frs-users'),
				getValue: ({ item }) => ROLE_LABELS[item.select_person_type] || item.select_person_type,
				elements: Object.keys(ROLE_LABELS).map((role) => ({
					value: role,
					label: ROLE_LABELS[role],
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
			},
			{
				id: 'status',
				header: __('Status', 'frs-users'),
				getValue: ({ item }) => (item.is_active ? __('Active', 'frs-users') : __('Inactive', 'frs-users')),
				render: ({ item }) => {
					return (
						<span
							style={{
								display: 'inline-block',
								padding: '2px 8px',
								borderRadius: '4px',
								fontSize: '12px',
								fontWeight: '500',
								backgroundColor: item.is_active ? '#e7f5e9' : '#f0f0f1',
								color: item.is_active ? '#1e7e34' : '#646970',
							}}
						>
							{item.is_active ? __('Active', 'frs-users') : __('Inactive', 'frs-users')}
						</span>
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
		[]
	);

	// Define actions
	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __('Edit', 'frs-users'),
				isPrimary: true,
				callback: (items) => {
					const item = items[0];
					window.location.href = `${window.frsProfilesAdmin.userEditUrl}${item.user_id}`;
				},
			},
			{
				id: 'view-profile',
				label: __('View Profile', 'frs-users'),
				callback: (items) => {
					const item = items[0];
					const role = window.frsProfilesAdmin.roles[item.select_person_type];
					if (role) {
						const slug = item.profile_slug || item.user_nicename;
						window.open(`/${role.url_prefix}/${slug}`, '_blank');
					}
				},
			},
		],
		[]
	);

	if (isLoading) {
		return (
			<div style={{ padding: '40px', textAlign: 'center' }}>
				<Spinner />
				<p>{__('Loading profiles...', 'frs-users')}</p>
			</div>
		);
	}

	return (
		<div className="frs-profiles-admin">
			<div className="frs-profiles-header" style={{ marginBottom: '20px' }}>
				<h1 className="wp-heading-inline">{__('FRS Profiles', 'frs-users')}</h1>
				<a href="/wp-admin/user-new.php" className="page-title-action">
					{__('Add New', 'frs-users')}
				</a>
				<p className="description">
					{__('Manage loan officers, agents, staff, and leadership profiles.', 'frs-users')}
				</p>
			</div>

			<DataViews
				data={profiles}
				fields={fields}
				view={view}
				onChangeView={setView}
				actions={actions}
				paginationInfo={{
					totalItems: profiles.length,
					totalPages: Math.ceil(profiles.length / view.perPage),
				}}
			/>
		</div>
	);
}

export default App;
