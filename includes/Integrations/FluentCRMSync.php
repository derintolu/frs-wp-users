<?php
/**
 * FluentCRM Integration - Real-time user sync
 *
 * @package FRSUsers\Integrations
 */

namespace FRSUsers\Integrations;

use FRSUsers\Core\Roles;
use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

/**
 * FluentCRM Sync Integration
 * Syncs users to FluentCRM immediately when created/updated
 *
 * In multisite, FluentCRM runs on the main site only.
 * This class switches to the main site to perform sync operations.
 */
class FluentCRMSync {
    use Base;

    /**
     * Main site ID where FluentCRM is active
     * Can be overridden with FRS_FLUENTCRM_SITE_ID constant
     *
     * @var int
     */
    private int $main_site_id;

    /**
     * Initialize hooks
     */
    public function init(): void {
        // Set main site ID (can be overridden in wp-config.php)
        $this->main_site_id = defined('FRS_FLUENTCRM_SITE_ID')
            ? FRS_FLUENTCRM_SITE_ID
            : get_main_site_id();
        // Hook into user registration
        add_action('user_register', [$this, 'sync_new_user'], 10, 1);

        // Hook into profile updates
        add_action('profile_update', [$this, 'sync_updated_user'], 10, 2);

        // Hook into role changes
        add_action('set_user_role', [$this, 'sync_role_change'], 10, 3);

        // Hook into FRS profile updates (from REST API)
        add_action('frs_profile_saved', [$this, 'sync_profile_update'], 10, 2);
    }

    /**
     * Sync newly registered user to FluentCRM
     *
     * @param int $user_id User ID
     */
    public function sync_new_user(int $user_id): void {
        if (!$this->should_sync_user($user_id)) {
            return;
        }

        $this->perform_sync($user_id, 'new_user');
    }

    /**
     * Sync user profile update to FluentCRM (only if changed)
     *
     * @param int      $user_id      User ID
     * @param \WP_User $old_user_data Old user data
     */
    public function sync_updated_user(int $user_id, \WP_User $old_user_data): void {
        if (!$this->should_sync_user($user_id)) {
            return;
        }

        // Check if relevant data actually changed
        $new_user = get_user_by('ID', $user_id);
        if ($old_user_data->user_email === $new_user->user_email &&
            $old_user_data->first_name === $new_user->first_name &&
            $old_user_data->last_name === $new_user->last_name) {
            // No relevant changes, skip sync
            return;
        }

        $this->perform_sync($user_id, 'profile_update');
    }

    /**
     * Sync user role change to FluentCRM
     *
     * @param int    $user_id   User ID
     * @param string $role      New role
     * @param array  $old_roles Old roles
     */
    public function sync_role_change(int $user_id, string $role, array $old_roles): void {
        if (!$this->should_sync_user($user_id)) {
            return;
        }

        $this->perform_sync($user_id, 'role_change');
    }

    /**
     * Sync profile update to FluentCRM
     *
     * @param int   $profile_id Profile ID
     * @param array $profile_data Profile data that was saved
     */
    public function sync_profile_update(int $profile_id, array $profile_data): void {
        // Get the profile to find the user_id
        $profile = Profile::find($profile_id);
        if (!$profile || !$profile->user_id) {
            return;
        }

        if (!$this->should_sync_user($profile->user_id)) {
            return;
        }

        // Check if this is actually a profile change by checking last modified time
        $last_sync = get_user_meta($profile->user_id, '_frs_last_fluentcrm_sync', true);
        $current_time = current_time('timestamp');

        // Only sync if more than 5 seconds have passed since last sync
        // This prevents duplicate syncs from rapid saves
        if ($last_sync && ($current_time - $last_sync) < 5) {
            return;
        }

        $this->perform_sync($profile->user_id, 'profile_update');
        update_user_meta($profile->user_id, '_frs_last_fluentcrm_sync', $current_time);
    }

    /**
     * Check if user should be synced to FluentCRM
     *
     * @param int $user_id User ID
     * @return bool
     */
    private function should_sync_user(int $user_id): bool {
        // In multisite, check FluentCRM on main site
        $switched = false;
        if (is_multisite() && get_current_blog_id() !== $this->main_site_id) {
            switch_to_blog($this->main_site_id);
            $switched = true;
        }

        // Don't sync if FluentCRM is not active on main site
        $has_fluentcrm = function_exists('FluentCrmApi');

        if ($switched) {
            restore_current_blog();
        }

        if (!$has_fluentcrm) {
            return false;
        }

        $user = get_user_by('ID', $user_id);
        if (!$user) {
            return false;
        }

        // Only sync FRS personnel (use centralized Roles class)
        $sync_roles = Roles::get_wp_role_slugs();
        // Also sync administrators
        $sync_roles[] = 'administrator';
        $user_roles = (array) $user->roles;

        return !empty(array_intersect($sync_roles, $user_roles));
    }

    /**
     * Perform the actual sync to FluentCRM
     *
     * In multisite, switches to main site where FluentCRM is active.
     *
     * @param int    $user_id User ID
     * @param string $context Sync context (new_user, profile_update, etc)
     */
    private function perform_sync(int $user_id, string $context): void {
        try {
            $user = get_user_by('ID', $user_id);
            if (!$user) {
                return;
            }

            // Get FRS profile data before switching sites
            $profile = Profile::get_by_user_id($user_id);

            // Prepare contact data
            $contact_data = [
                'email' => $user->user_email,
                'first_name' => $user->first_name ?: '',
                'last_name' => $user->last_name ?: '',
                'status' => 'subscribed',
            ];

            // Add custom fields from profile
            if ($profile) {
                $contact_data['custom_values'] = $this->map_profile_to_custom_fields($profile);
            }

            // Add tags based on role
            $tags = $this->get_tags_for_user($user);
            if (!empty($tags)) {
                $contact_data['tags'] = $tags;
            }

            // Switch to main site for FluentCRM API call
            $switched = false;
            if (is_multisite() && get_current_blog_id() !== $this->main_site_id) {
                switch_to_blog($this->main_site_id);
                $switched = true;
            }

            // Create or update contact in FluentCRM
            $api = FluentCrmApi('contacts');
            $contact = $api->createOrUpdate($contact_data);

            if ($switched) {
                restore_current_blog();
            }

            if ($contact) {
                error_log(sprintf(
                    'FRS Users: Synced user #%d (%s) to FluentCRM via %s',
                    $user_id,
                    $user->user_email,
                    $context
                ));
            }

        } catch (\Exception $e) {
            error_log(sprintf(
                'FRS Users: Failed to sync user #%d to FluentCRM: %s',
                $user_id,
                $e->getMessage()
            ));
        }
    }

    /**
     * Map FRS profile data to FluentCRM custom fields
     *
     * @param Profile $profile Profile model
     * @return array Custom field values
     */
    private function map_profile_to_custom_fields(Profile $profile): array {
        $custom_fields = [];

        // Map basic profile fields
        $field_map = [
            'phone' => 'phone',
            'nmls_id' => 'nmls_id',
            'license_number' => 'license_number',
            'office_address' => 'office_address',
            'city' => 'city',
            'state' => 'state',
            'zip_code' => 'zip_code',
            'bio' => 'bio',
            'select_person_type' => 'person_type',
        ];

        foreach ($field_map as $profile_field => $crm_field) {
            if (!empty($profile->$profile_field)) {
                $custom_fields[$crm_field] = $profile->$profile_field;
            }
        }

        // Handle JSON fields
        $json_fields = ['languages', 'specialties_lo', 'specialties', 'service_areas'];
        foreach ($json_fields as $field) {
            if (!empty($profile->$field)) {
                $decoded = is_string($profile->$field) ? json_decode($profile->$field, true) : $profile->$field;
                if (is_array($decoded)) {
                    $custom_fields[$field] = implode(', ', $decoded);
                }
            }
        }

        return $custom_fields;
    }

    /**
     * Get FluentCRM tags for user based on role
     *
     * @param \WP_User $user User object
     * @return array Tag names
     */
    private function get_tags_for_user(\WP_User $user): array {
        $tags = ['FRS Personnel'];

        // Map WordPress roles to FluentCRM tag names
        $role_tags = [
            'loan_officer'     => 'Loan Officer',
            're_agent'         => 'Real Estate Agent',
            'escrow_officer'   => 'Escrow Officer',
            'property_manager' => 'Property Manager',
            'dual_license'     => 'Dual License',
            'partner'          => 'Partner',
            'staff'            => 'Staff',
            'leadership'       => 'Leadership',
            'assistant'        => 'Assistant',
            'administrator'    => 'Administrator',
        ];

        foreach ($user->roles as $role) {
            if (isset($role_tags[$role])) {
                $tags[] = $role_tags[$role];
            }
        }

        return $tags;
    }
}
