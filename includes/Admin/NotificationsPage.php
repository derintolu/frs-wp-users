<?php
/**
 * Notifications Settings Page
 *
 * Admin page for configuring automated email notifications via FluentCRM.
 *
 * @package FRSUsers
 * @subpackage Admin
 * @since 4.2.0
 */

namespace FRSUsers\Admin;

/**
 * Class NotificationsPage
 *
 * Registers the Notifications submenu and renders settings for
 * mapping FRS events to FluentCRM tags, lists, and admin email alerts.
 */
class NotificationsPage {

	/**
	 * Option key for notification settings.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'frs_notification_events';

	/**
	 * Available notification events.
	 *
	 * @var array
	 */
	private static array $events = array(
		'new_employee' => array(
			'label'       => 'New Employee Onboarded',
			'description' => 'Triggered when a new user is created with an FRS role.',
			'hook'        => 'user_register',
		),
		'profile_updated' => array(
			'label'       => 'Profile Updated',
			'description' => 'Triggered when an employee updates their profile.',
			'hook'        => 'frs_profile_saved',
		),
		'role_changed' => array(
			'label'       => 'Role Changed',
			'description' => 'Triggered when an employee\'s WordPress role changes.',
			'hook'        => 'set_user_role',
		),
		'status_active' => array(
			'label'       => 'Status Changed to Active',
			'description' => 'Triggered when an employee\'s profile is activated.',
			'hook'        => 'frs_profile_status_active',
		),
		'status_inactive' => array(
			'label'       => 'Status Changed to Inactive',
			'description' => 'Triggered when an employee\'s profile is deactivated.',
			'hook'        => 'frs_profile_status_inactive',
		),
	);

	/**
	 * Initialize the page.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ), 20 );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	/**
	 * Register admin submenu.
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_submenu_page(
			'frs-profiles',
			__( 'Email Notifications', 'frs-users' ),
			__( 'Notifications', 'frs-users' ),
			'manage_options',
			'frs-notifications',
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Register settings.
	 *
	 * @return void
	 */
	public static function register_settings() {
		register_setting(
			'frs_notifications_settings',
			self::OPTION_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize notification settings.
	 *
	 * @param array $input Raw input.
	 * @return array Sanitized settings.
	 */
	public static function sanitize_settings( $input ): array {
		if ( ! is_array( $input ) ) {
			return array();
		}

		$clean = array();
		foreach ( self::$events as $event_key => $event_config ) {
			if ( ! isset( $input[ $event_key ] ) ) {
				continue;
			}

			$raw = $input[ $event_key ];
			$clean[ $event_key ] = array(
				'enabled'      => ! empty( $raw['enabled'] ),
				'tags'         => isset( $raw['tags'] ) ? array_map( 'absint', (array) $raw['tags'] ) : array(),
				'lists'        => isset( $raw['lists'] ) ? array_map( 'absint', (array) $raw['lists'] ) : array(),
				'admin_notify' => ! empty( $raw['admin_notify'] ),
				'admin_emails' => isset( $raw['admin_emails'] ) ? sanitize_text_field( $raw['admin_emails'] ) : '',
			);
		}

		return $clean;
	}

	/**
	 * Get all configured events with their settings.
	 *
	 * @return array
	 */
	public static function get_settings(): array {
		return get_option( self::OPTION_KEY, array() );
	}

	/**
	 * Get settings for a specific event.
	 *
	 * @param string $event_key Event key.
	 * @return array|null Event settings or null if not configured.
	 */
	public static function get_event_settings( string $event_key ): ?array {
		$settings = self::get_settings();
		return $settings[ $event_key ] ?? null;
	}

	/**
	 * Get event definitions.
	 *
	 * @return array
	 */
	public static function get_events(): array {
		return self::$events;
	}

	/**
	 * Fetch FluentCRM tags.
	 *
	 * @return array Array of [ id => title ].
	 */
	private static function get_fluentcrm_tags(): array {
		if ( ! function_exists( 'FluentCrmApi' ) ) {
			return array();
		}

		try {
			$tags   = FluentCrmApi( 'tags' )->all();
			$result = array();
			foreach ( $tags as $tag ) {
				$result[ $tag->id ] = $tag->title;
			}
			return $result;
		} catch ( \Exception $e ) {
			return array();
		}
	}

	/**
	 * Fetch FluentCRM lists.
	 *
	 * @return array Array of [ id => title ].
	 */
	private static function get_fluentcrm_lists(): array {
		if ( ! function_exists( 'FluentCrmApi' ) ) {
			return array();
		}

		try {
			$lists  = FluentCrmApi( 'lists' )->all();
			$result = array();
			foreach ( $lists as $list ) {
				$result[ $list->id ] = $list->title;
			}
			return $result;
		} catch ( \Exception $e ) {
			return array();
		}
	}

	/**
	 * Render the settings page.
	 *
	 * @return void
	 */
	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'frs-users' ) );
		}

		$fluentcrm_active = function_exists( 'FluentCrmApi' );
		$settings         = self::get_settings();
		$tags             = self::get_fluentcrm_tags();
		$lists            = self::get_fluentcrm_lists();

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Email Notifications', 'frs-users' ); ?></h1>
			<p class="description"><?php esc_html_e( 'Configure automated notifications triggered by employee events. Tags and lists are applied in FluentCRM — set up automations in FluentCRM to send the actual emails.', 'frs-users' ); ?></p>

			<?php if ( ! $fluentcrm_active ) : ?>
				<div class="notice notice-error">
					<p><?php esc_html_e( 'FluentCRM is not active. Install and activate FluentCRM to use email notifications.', 'frs-users' ); ?></p>
				</div>
				<?php return; ?>
			<?php endif; ?>

			<?php if ( empty( $tags ) && empty( $lists ) ) : ?>
				<div class="notice notice-warning">
					<p><?php esc_html_e( 'No FluentCRM tags or lists found. Create tags and lists in FluentCRM first, then configure notifications here.', 'frs-users' ); ?></p>
				</div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields( 'frs_notifications_settings' ); ?>

				<table class="widefat striped" style="max-width: 1100px;">
					<thead>
						<tr>
							<th style="width: 30px;"></th>
							<th><?php esc_html_e( 'Event', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Apply Tags', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Add to Lists', 'frs-users' ); ?></th>
							<th><?php esc_html_e( 'Admin Email', 'frs-users' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( self::$events as $key => $event ) : ?>
							<?php
							$evt = $settings[ $key ] ?? array();
							$enabled      = ! empty( $evt['enabled'] );
							$sel_tags     = $evt['tags'] ?? array();
							$sel_lists    = $evt['lists'] ?? array();
							$admin_notify = ! empty( $evt['admin_notify'] );
							$admin_emails = $evt['admin_emails'] ?? '';
							$field_prefix = self::OPTION_KEY . '[' . $key . ']';
							?>
							<tr>
								<td style="vertical-align: top; padding-top: 14px;">
									<input type="checkbox"
										name="<?php echo esc_attr( $field_prefix . '[enabled]' ); ?>"
										value="1"
										<?php checked( $enabled ); ?>
									/>
								</td>
								<td style="vertical-align: top; padding-top: 10px;">
									<strong><?php echo esc_html( $event['label'] ); ?></strong><br>
									<span class="description"><?php echo esc_html( $event['description'] ); ?></span>
								</td>
								<td style="vertical-align: top;">
									<?php if ( ! empty( $tags ) ) : ?>
										<select name="<?php echo esc_attr( $field_prefix . '[tags][]' ); ?>" multiple style="min-width: 180px; min-height: 80px;">
											<?php foreach ( $tags as $tag_id => $tag_title ) : ?>
												<option value="<?php echo esc_attr( $tag_id ); ?>" <?php echo in_array( $tag_id, $sel_tags, true ) ? 'selected' : ''; ?>>
													<?php echo esc_html( $tag_title ); ?>
												</option>
											<?php endforeach; ?>
										</select>
									<?php else : ?>
										<em><?php esc_html_e( 'No tags', 'frs-users' ); ?></em>
									<?php endif; ?>
								</td>
								<td style="vertical-align: top;">
									<?php if ( ! empty( $lists ) ) : ?>
										<select name="<?php echo esc_attr( $field_prefix . '[lists][]' ); ?>" multiple style="min-width: 180px; min-height: 80px;">
											<?php foreach ( $lists as $list_id => $list_title ) : ?>
												<option value="<?php echo esc_attr( $list_id ); ?>" <?php echo in_array( $list_id, $sel_lists, true ) ? 'selected' : ''; ?>>
													<?php echo esc_html( $list_title ); ?>
												</option>
											<?php endforeach; ?>
										</select>
									<?php else : ?>
										<em><?php esc_html_e( 'No lists', 'frs-users' ); ?></em>
									<?php endif; ?>
								</td>
								<td style="vertical-align: top;">
									<label>
										<input type="checkbox"
											name="<?php echo esc_attr( $field_prefix . '[admin_notify]' ); ?>"
											value="1"
											<?php checked( $admin_notify ); ?>
										/>
										<?php esc_html_e( 'Notify admin', 'frs-users' ); ?>
									</label><br>
									<input type="text"
										name="<?php echo esc_attr( $field_prefix . '[admin_emails]' ); ?>"
										value="<?php echo esc_attr( $admin_emails ); ?>"
										placeholder="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>"
										class="regular-text"
										style="margin-top: 4px;"
									/>
									<p class="description"><?php esc_html_e( 'Comma-separated. Blank = site admin.', 'frs-users' ); ?></p>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<div style="margin-top: 16px;">
					<?php submit_button( __( 'Save Notification Settings', 'frs-users' ) ); ?>
				</div>
			</form>

			<hr>
			<h2><?php esc_html_e( 'How It Works', 'frs-users' ); ?></h2>
			<ol>
				<li><?php esc_html_e( 'Enable events above and assign FluentCRM tags/lists.', 'frs-users' ); ?></li>
				<li><?php esc_html_e( 'In FluentCRM, create Automations triggered by "Tag Applied" or "List Added".', 'frs-users' ); ?></li>
				<li><?php esc_html_e( 'Design your email templates and sequences in FluentCRM\'s visual editor.', 'frs-users' ); ?></li>
				<li><?php esc_html_e( 'When an FRS event fires, the configured tags/lists are applied and FluentCRM handles the rest.', 'frs-users' ); ?></li>
			</ol>
			<p class="description">
				<?php
				printf(
					/* translators: %s: FluentCRM automations URL */
					esc_html__( 'Manage automations: %s', 'frs-users' ),
					'<a href="' . esc_url( admin_url( 'admin.php?page=fluentcrm-admin#/funnels' ) ) . '" target="_blank">FluentCRM Automations</a>'
				);
				?>
			</p>
		</div>
		<?php
	}
}
