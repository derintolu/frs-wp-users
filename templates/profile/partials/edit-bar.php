<?php
/**
 * Profile Edit Bar - Bottom fixed bar with responsive preview and edit toggle
 * Uses WordPress Interactivity API
 */

if (!defined('ABSPATH')) exit;

$user_id = get_current_user_id();
$can_edit = $user_id && (current_user_can('edit_users') || $user_id === ($profile->ID ?? 0));

if (!$can_edit) return;
?>

<div
    data-wp-interactive="frs/profile-editor"
    <?php echo wp_interactivity_data_wp_context([
        'isEditMode' => false,
        'previewDevice' => 'desktop',
        'isSaving' => false,
    ]); ?>
    class="frs-edit-bar"
    data-wp-class--edit-mode="context.isEditMode"
>
    <!-- Responsive Preview Buttons (left side) -->
    <div class="frs-edit-bar__preview" data-wp-class--visible="context.isEditMode">
        <button
            type="button"
            class="frs-edit-bar__preview-btn"
            data-wp-class--active="context.previewDevice === 'desktop'"
            data-wp-on--click="actions.setDesktop"
            title="Desktop preview"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>Desktop</span>
        </button>
        <button
            type="button"
            class="frs-edit-bar__preview-btn"
            data-wp-class--active="context.previewDevice === 'tablet'"
            data-wp-on--click="actions.setTablet"
            title="Tablet preview"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span>Tablet</span>
        </button>
        <button
            type="button"
            class="frs-edit-bar__preview-btn"
            data-wp-class--active="context.previewDevice === 'mobile'"
            data-wp-on--click="actions.setMobile"
            title="Mobile preview"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span>Mobile</span>
        </button>
    </div>

    <!-- Edit Button (right side) -->
    <div class="frs-edit-bar__actions">
        <button
            type="button"
            class="frs-edit-bar__cancel-btn"
            data-wp-class--visible="context.isEditMode"
            data-wp-on--click="actions.cancelEdit"
        >
            Cancel
        </button>
        <button
            type="button"
            class="frs-edit-bar__save-btn"
            data-wp-class--visible="context.isEditMode"
            data-wp-on--click="actions.saveProfile"
            data-wp-bind--disabled="context.isSaving"
        >
            <span data-wp-text="context.isSaving ? 'Saving...' : 'Save Changes'"></span>
        </button>
        <button
            type="button"
            class="frs-edit-bar__edit-btn"
            data-wp-class--hidden="context.isEditMode"
            data-wp-on--click="actions.toggleEdit"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profile
        </button>
    </div>
</div>

<style>
.frs-edit-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #fff;
    border-top: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 40;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.frs-edit-bar__preview {
    display: flex;
    gap: 8px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
}

.frs-edit-bar__preview.visible {
    opacity: 1;
    visibility: visible;
}

.frs-edit-bar__preview-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
    color: #6b7280;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
}

.frs-edit-bar__preview-btn:hover {
    border-color: #0ea5e9;
    color: #0ea5e9;
}

.frs-edit-bar__preview-btn.active {
    background: #0ea5e9;
    border-color: #0ea5e9;
    color: #fff;
}

.frs-edit-bar__actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.frs-edit-bar__edit-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
}

.frs-edit-bar__edit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.frs-edit-bar__edit-btn.hidden {
    display: none;
}

.frs-edit-bar__cancel-btn {
    padding: 10px 20px;
    background: #fff;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
}

.frs-edit-bar__cancel-btn.visible {
    opacity: 1;
    visibility: visible;
}

.frs-edit-bar__cancel-btn:hover {
    background: #f9fafb;
}

.frs-edit-bar__save-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
}

.frs-edit-bar__save-btn.visible {
    opacity: 1;
    visibility: visible;
}

.frs-edit-bar__save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Ensure bar is behind sidebar */
@media (min-width: 1024px) {
    .frs-edit-bar {
        left: 280px;
    }
}
</style>
