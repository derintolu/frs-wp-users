<?php
/**
 * Greenshift Integration - User Meta Sync
 *
 * Syncs FRS profile data to WordPress user meta for GreenshiftWP dynamic data compatibility.
 *
 * @package FRSUsers\Integrations
 */

namespace FRSUsers\Integrations;

use FRSUsers\Traits\Base;
use FRSUsers\Models\Profile;

/**
 * Greenshift Sync Integration
 *
 * Since GreenshiftWP only supports WordPress meta tables (postmeta, usermeta, options)
 * for dynamic data, this integration mirrors profile data from the custom wp_frs_profiles
 * table to WordPress user meta, making it accessible through Greenshift's Meta Getter block.
 */
class GreenshiftSync {
    use Base;

    /**
     * Meta key prefix for all synced fields
     */
    private const META_PREFIX = 'frs_';

    /**
     * Scalar fields to sync directly to user meta
     *
     * @var array<string, string> Field name => Meta key suffix
     */
    private const SCALAR_FIELDS = [
        'email'            => 'email',
        'first_name'       => 'first_name',
        'last_name'        => 'last_name',
        'display_name'     => 'display_name',
        'phone_number'     => 'phone_number',
        'mobile_number'    => 'mobile_number',
        'office'           => 'office',
        'job_title'        => 'job_title',
        'biography'        => 'biography',
        'select_person_type' => 'person_type',
        'nmls_number'      => 'nmls_number',
        'license_number'   => 'license_number',
        'dre_license'      => 'dre_license',
        'brand'            => 'brand',
        'city_state'       => 'city_state',
        'region'           => 'region',
        'profile_slug'     => 'profile_slug',
        'profile_headline' => 'profile_headline',
        'facebook_url'     => 'facebook_url',
        'instagram_url'    => 'instagram_url',
        'linkedin_url'     => 'linkedin_url',
        'twitter_url'      => 'twitter_url',
        'youtube_url'      => 'youtube_url',
        'tiktok_url'       => 'tiktok_url',
        'headshot_id'      => 'headshot_id',
    ];

    /**
     * JSON array fields to sync in dual format (JSON + comma-separated)
     *
     * @var array<string>
     */
    private const JSON_FIELDS = [
        'languages',
        'specialties',
        'specialties_lo',
        'awards',
        'nar_designations',
        'namb_certifications',
        'service_areas',
    ];

    /**
     * Initialize hooks
     */
    public function init(): void {
        // Hook into FRS profile updates (from REST API and admin)
        add_action('frs_profile_saved', [$this, 'sync_to_user_meta'], 10, 2);

        // Hook into profile deletion to clean up meta
        add_action('frs_profile_deleted', [$this, 'cleanup_user_meta'], 10, 2);
    }

    /**
     * Sync profile data to WordPress user meta
     *
     * @param int   $profile_id   Profile ID
     * @param array $profile_data Profile data that was saved
     */
    public function sync_to_user_meta(int $profile_id, array $profile_data): void {
        $profile = Profile::find($profile_id);

        if (!$profile || !$profile->user_id) {
            // Can't sync guest profiles to user meta - they have no user_id
            return;
        }

        $user_id = $profile->user_id;

        // Sync scalar fields
        foreach (self::SCALAR_FIELDS as $profile_field => $meta_suffix) {
            $value = $profile->$profile_field;

            // Convert null to empty string for consistency
            if ($value === null) {
                $value = '';
            }

            update_user_meta($user_id, self::META_PREFIX . $meta_suffix, $value);
        }

        // Sync JSON array fields in dual format
        foreach (self::JSON_FIELDS as $field) {
            $this->sync_json_field($user_id, $profile, $field);
        }

        /**
         * Fires after profile data is synced to user meta
         *
         * @param int     $user_id    WordPress user ID
         * @param int     $profile_id FRS profile ID
         * @param Profile $profile    Profile model instance
         */
        do_action('frs_greenshift_synced', $user_id, $profile_id, $profile);
    }

    /**
     * Sync a JSON array field in dual format (raw JSON + comma-separated list)
     *
     * @param int     $user_id WordPress user ID
     * @param Profile $profile Profile model instance
     * @param string  $field   Field name
     */
    private function sync_json_field(int $user_id, Profile $profile, string $field): void {
        $value = $profile->$field;

        // Handle various input formats
        if (is_string($value) && !empty($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $value = $decoded;
            } else {
                // Not valid JSON, treat as empty
                $value = [];
            }
        } elseif (!is_array($value)) {
            $value = [];
        }

        // Store as JSON for programmatic access
        $json_value = !empty($value) ? wp_json_encode($value) : '';
        update_user_meta($user_id, self::META_PREFIX . $field, $json_value);

        // Store as comma-separated list for Greenshift display
        $list_value = !empty($value) ? implode(', ', array_filter($value)) : '';
        update_user_meta($user_id, self::META_PREFIX . $field . '_list', $list_value);
    }

    /**
     * Clean up user meta when a profile is deleted
     *
     * @param int      $profile_id Profile ID
     * @param int|null $user_id    WordPress user ID (if available)
     */
    public function cleanup_user_meta(int $profile_id, ?int $user_id): void {
        if (!$user_id) {
            return;
        }

        // Delete scalar field meta
        foreach (self::SCALAR_FIELDS as $profile_field => $meta_suffix) {
            delete_user_meta($user_id, self::META_PREFIX . $meta_suffix);
        }

        // Delete JSON field meta (both formats)
        foreach (self::JSON_FIELDS as $field) {
            delete_user_meta($user_id, self::META_PREFIX . $field);
            delete_user_meta($user_id, self::META_PREFIX . $field . '_list');
        }

        /**
         * Fires after user meta is cleaned up for a deleted profile
         *
         * @param int $user_id    WordPress user ID
         * @param int $profile_id FRS profile ID that was deleted
         */
        do_action('frs_greenshift_meta_cleaned', $user_id, $profile_id);
    }

    /**
     * Get all syncable field names
     *
     * @return array<string> List of field names
     */
    public function get_syncable_fields(): array {
        return array_merge(
            array_keys(self::SCALAR_FIELDS),
            self::JSON_FIELDS
        );
    }

    /**
     * Get all user meta keys that this integration creates
     *
     * @return array<string> List of meta keys
     */
    public function get_meta_keys(): array {
        $keys = [];

        // Scalar field meta keys
        foreach (self::SCALAR_FIELDS as $profile_field => $meta_suffix) {
            $keys[] = self::META_PREFIX . $meta_suffix;
        }

        // JSON field meta keys (both formats)
        foreach (self::JSON_FIELDS as $field) {
            $keys[] = self::META_PREFIX . $field;
            $keys[] = self::META_PREFIX . $field . '_list';
        }

        return $keys;
    }

    /**
     * Force sync all profiles to user meta
     *
     * Useful for initial setup or when fields are added.
     *
     * @return array{synced: int, skipped: int} Sync statistics
     */
    public function sync_all_profiles(): array {
        $stats = [
            'synced'  => 0,
            'skipped' => 0,
        ];

        $profiles = Profile::whereNotNull('user_id')->get();

        foreach ($profiles as $profile) {
            if ($profile->user_id) {
                $this->sync_to_user_meta($profile->id, $profile->toArray());
                $stats['synced']++;
            } else {
                $stats['skipped']++;
            }
        }

        return $stats;
    }
}
