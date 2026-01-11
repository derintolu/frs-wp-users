<?php
/**
 * Centralized Role Configuration
 *
 * Single source of truth for WordPress roles and FRS company roles.
 *
 * @package FRSUsers
 * @since 3.0.0
 */

namespace FRSUsers\Core;

/**
 * Class Roles
 *
 * Manages WordPress roles (capabilities) and FRS company roles (directory categorization).
 */
class Roles {

	/**
	 * WordPress roles (capabilities/permissions)
	 *
	 * These determine what users can DO - their permissions and tool access.
	 *
	 * @return array
	 */
	public static function get_wp_roles() {
		return array(
			'loan_officer'     => array(
				'label'      => __( 'Loan Officer', 'frs-users' ),
				'url_prefix' => 'lo',
				'public'     => true,
			),
			're_agent'         => array(
				'label'      => __( 'Real Estate Agent', 'frs-users' ),
				'url_prefix' => 'agent',
				'public'     => true,
			),
			'escrow_officer'   => array(
				'label'      => __( 'Escrow Officer', 'frs-users' ),
				'url_prefix' => 'escrow',
				'public'     => true,
			),
			'property_manager' => array(
				'label'      => __( 'Property Manager', 'frs-users' ),
				'url_prefix' => 'pm',
				'public'     => true,
			),
			'dual_license'     => array(
				'label'      => __( 'Dual License', 'frs-users' ),
				'url_prefix' => 'lo', // Default, context can override.
				'public'     => true,
			),
			'partner'          => array(
				'label'      => __( 'Partner', 'frs-users' ),
				'url_prefix' => null, // No public URL.
				'public'     => false,
			),
			'staff'            => array(
				'label'      => __( 'Staff', 'frs-users' ),
				'url_prefix' => 'staff',
				'public'     => true,
			),
			'leadership'       => array(
				'label'      => __( 'Leadership', 'frs-users' ),
				'url_prefix' => 'leader',
				'public'     => true,
			),
			'assistant'        => array(
				'label'      => __( 'Assistant', 'frs-users' ),
				'url_prefix' => 'staff',
				'public'     => true,
			),
		);
	}

	/**
	 * FRS company roles (directory categorization)
	 *
	 * These determine WHERE users appear in directories.
	 * Stored as multi-value `frs_company_role` user meta.
	 *
	 * @return array
	 */
	public static function get_company_roles() {
		return array(
			'loan_originator'  => __( 'Loan Originator', 'frs-users' ),
			'broker_associate' => __( 'Broker Associate', 'frs-users' ),
			'sales_associate'  => __( 'Sales Associate', 'frs-users' ),
			'escrow_officer'   => __( 'Escrow Officer', 'frs-users' ),
			'property_manager' => __( 'Property Manager', 'frs-users' ),
			'partner'          => __( 'Partner', 'frs-users' ),
			'leadership'       => __( 'Leadership', 'frs-users' ),
			'staff'            => __( 'Staff', 'frs-users' ),
		);
	}

	/**
	 * Get all WP role slugs for queries.
	 *
	 * @return array
	 */
	public static function get_wp_role_slugs() {
		return array_keys( self::get_wp_roles() );
	}

	/**
	 * Get URL prefix for a WordPress role.
	 *
	 * @param string $role WordPress role slug.
	 * @return string|null URL prefix or null if no public URL.
	 */
	public static function get_url_prefix( $role ) {
		$roles = self::get_wp_roles();
		return isset( $roles[ $role ]['url_prefix'] ) ? $roles[ $role ]['url_prefix'] : null;
	}

	/**
	 * Get role label.
	 *
	 * @param string $role Role slug (WP or company).
	 * @return string
	 */
	public static function get_role_label( $role ) {
		$wp_roles = self::get_wp_roles();
		if ( isset( $wp_roles[ $role ] ) ) {
			return $wp_roles[ $role ]['label'];
		}

		$company_roles = self::get_company_roles();
		if ( isset( $company_roles[ $role ] ) ) {
			return $company_roles[ $role ];
		}

		return $role;
	}

	/**
	 * Check if a WordPress role has a public profile URL.
	 *
	 * @param string $role WordPress role slug.
	 * @return bool
	 */
	public static function is_public_role( $role ) {
		$roles = self::get_wp_roles();
		return isset( $roles[ $role ]['public'] ) && $roles[ $role ]['public'];
	}

	/**
	 * Get company roles for a specific site context.
	 *
	 * @param string $site_context Site context identifier.
	 * @return array
	 */
	public static function get_company_roles_for_site( $site_context ) {
		$all = self::get_company_roles();

		switch ( $site_context ) {
			case '21stcenturylending':
				return array_intersect_key(
					$all,
					array_flip( array( 'loan_originator', 'leadership' ) )
				);

			case 'c21masters':
				return array_intersect_key(
					$all,
					array_flip( array( 'broker_associate', 'sales_associate', 'leadership' ) )
				);

			case 'hub':
				// All except partner.
				unset( $all['partner'] );
				return $all;

			default:
				return $all;
		}
	}

	/**
	 * Get the default company role for a WordPress role.
	 *
	 * Used when creating new users or for fallback mapping.
	 *
	 * @param string $wp_role WordPress role slug.
	 * @return string|null Default company role or null.
	 */
	public static function get_default_company_role( $wp_role ) {
		$mapping = array(
			'loan_officer'     => 'loan_originator',
			're_agent'         => 'broker_associate',
			'escrow_officer'   => 'escrow_officer',
			'property_manager' => 'property_manager',
			'dual_license'     => 'loan_originator', // Default to LO.
			'partner'          => 'partner',
			'staff'            => 'staff',
			'leadership'       => 'leadership',
			'assistant'        => 'staff',
		);

		return isset( $mapping[ $wp_role ] ) ? $mapping[ $wp_role ] : null;
	}

	/**
	 * Get WordPress roles formatted for admin dropdown.
	 *
	 * @return array Role slug => label pairs.
	 */
	public static function get_wp_roles_for_dropdown() {
		$roles  = self::get_wp_roles();
		$result = array();

		foreach ( $roles as $slug => $config ) {
			$result[ $slug ] = $config['label'];
		}

		return $result;
	}

	/**
	 * Get WordPress roles with URL prefixes for admin localization.
	 *
	 * @return array Role configuration for JavaScript.
	 */
	public static function get_wp_roles_for_admin() {
		return self::get_wp_roles();
	}

	/**
	 * Available site contexts.
	 *
	 * @return array Context slug => configuration.
	 */
	public static function get_site_contexts() {
		return array(
			'development'        => array(
				'label'                  => __( 'Development (All Roles)', 'frs-users' ),
				'description'            => __( 'Shows all profiles and roles for testing.', 'frs-users' ),
				'company_roles'          => array_keys( self::get_company_roles() ),
				'profile_editing'        => true,
				'url_prefixes'           => array( 'lo', 'agent', 'escrow', 'pm', 'staff', 'leader' ),
			),
			'21stcenturylending' => array(
				'label'                  => __( '21st Century Lending (Marketing)', 'frs-users' ),
				'description'            => __( 'Loan officers and leadership only. Read-only.', 'frs-users' ),
				'company_roles'          => array( 'loan_originator', 'leadership' ),
				'profile_editing'        => false,
				'url_prefixes'           => array( 'lo', 'leader' ),
			),
			'c21masters'         => array(
				'label'                  => __( 'Century 21 Masters (Marketing)', 'frs-users' ),
				'description'            => __( 'Real estate agents and leadership only. Read-only.', 'frs-users' ),
				'company_roles'          => array( 'broker_associate', 'sales_associate', 'leadership' ),
				'profile_editing'        => false,
				'url_prefixes'           => array( 'agent', 'leader' ),
			),
			'hub'                => array(
				'label'                  => __( 'Hub / Intranet (myhub21.com)', 'frs-users' ),
				'description'            => __( 'All profiles including partners. Full editing enabled.', 'frs-users' ),
				'company_roles'          => array( 'loan_originator', 'broker_associate', 'sales_associate', 'escrow_officer', 'property_manager', 'partner', 'leadership', 'staff' ),
				'profile_editing'        => true,
				'url_prefixes'           => array( 'lo', 'agent', 'escrow', 'pm', 'staff', 'leader' ),
			),
		);
	}

	/**
	 * Get the current site context.
	 *
	 * Precedence: Constant → Filter → Option → Default
	 *
	 * @return string Site context slug.
	 */
	public static function get_site_context() {
		// 1. Check for constant (highest priority - locks production sites).
		if ( defined( 'FRS_SITE_CONTEXT' ) && FRS_SITE_CONTEXT ) {
			return FRS_SITE_CONTEXT;
		}

		// 2. Check for filter (allows runtime/programmatic override).
		$filtered = apply_filters( 'frs_site_context', null );
		if ( $filtered ) {
			return $filtered;
		}

		// 3. Check for option (admin-configurable).
		$option = get_option( 'frs_site_context', '' );
		if ( $option ) {
			return $option;
		}

		// 4. Default to development mode.
		return 'development';
	}

	/**
	 * Get configuration for the current site context.
	 *
	 * @param string|null $context Optional specific context. Uses current if null.
	 * @return array Site context configuration.
	 */
	public static function get_site_context_config( $context = null ) {
		if ( null === $context ) {
			$context = self::get_site_context();
		}

		$contexts = self::get_site_contexts();

		if ( isset( $contexts[ $context ] ) ) {
			return $contexts[ $context ];
		}

		// Fallback to development.
		return $contexts['development'];
	}

	/**
	 * Get company roles for the current site context.
	 *
	 * @return array Company role slug => label pairs.
	 */
	public static function get_active_company_roles() {
		$config    = self::get_site_context_config();
		$all_roles = self::get_company_roles();

		return array_intersect_key(
			$all_roles,
			array_flip( $config['company_roles'] )
		);
	}

	/**
	 * Get company role slugs for the current site context.
	 *
	 * @return array Company role slugs.
	 */
	public static function get_active_company_role_slugs() {
		$config = self::get_site_context_config();
		return $config['company_roles'];
	}

	/**
	 * Check if profile editing is enabled for the current site.
	 *
	 * @return bool
	 */
	public static function is_profile_editing_enabled() {
		$config = self::get_site_context_config();
		return ! empty( $config['profile_editing'] );
	}

	/**
	 * Get active URL prefixes for the current site context.
	 *
	 * @return array URL prefix strings.
	 */
	public static function get_active_url_prefixes() {
		$config = self::get_site_context_config();
		return $config['url_prefixes'];
	}

	/**
	 * Check if a company role is active for the current site context.
	 *
	 * @param string $company_role Company role slug.
	 * @return bool
	 */
	public static function is_company_role_active( $company_role ) {
		$config = self::get_site_context_config();
		return in_array( $company_role, $config['company_roles'], true );
	}

	/**
	 * Check if site context is locked by constant.
	 *
	 * @return bool True if FRS_SITE_CONTEXT constant is defined.
	 */
	public static function is_context_locked() {
		return defined( 'FRS_SITE_CONTEXT' ) && FRS_SITE_CONTEXT;
	}

	/**
	 * Get the WordPress role that corresponds to a company role.
	 *
	 * Used when syncing profiles to determine what WP role to assign.
	 *
	 * @param string $company_role Company role slug.
	 * @return string|null WordPress role slug or null.
	 */
	public static function get_wp_role_for_company_role( $company_role ) {
		$mapping = array(
			'loan_originator'  => 'loan_officer',
			'broker_associate' => 're_agent',
			'sales_associate'  => 're_agent',
			'escrow_officer'   => 'escrow_officer',
			'property_manager' => 'property_manager',
			'partner'          => 'partner',
			'leadership'       => 'leadership',
			'staff'            => 'staff',
		);

		return isset( $mapping[ $company_role ] ) ? $mapping[ $company_role ] : null;
	}
}
