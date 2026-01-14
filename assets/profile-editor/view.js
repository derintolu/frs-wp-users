/**
 * Profile Editor - WordPress Interactivity API Store
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

const { state, actions } = store('frs/profile-editor', {
    state: {
        get previewWidth() {
            const ctx = getContext();
            switch (ctx.previewDevice) {
                case 'tablet': return '768px';
                case 'mobile': return '375px';
                default: return '100%';
            }
        }
    },
    actions: {
        toggleEdit() {
            const ctx = getContext();
            ctx.isEditMode = !ctx.isEditMode;
            document.body.classList.toggle('frs-edit-mode', ctx.isEditMode);

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('frs:editModeChanged', {
                detail: { isEditMode: ctx.isEditMode }
            }));
        },

        cancelEdit() {
            const ctx = getContext();
            ctx.isEditMode = false;
            document.body.classList.remove('frs-edit-mode');

            // Reset form fields to original values
            document.querySelectorAll('[data-frs-field]').forEach(field => {
                if (field.dataset.frsOriginal !== undefined) {
                    field.value = field.dataset.frsOriginal;
                }
            });

            window.dispatchEvent(new CustomEvent('frs:editModeChanged', {
                detail: { isEditMode: false }
            }));
        },

        setDesktop() {
            const ctx = getContext();
            ctx.previewDevice = 'desktop';
            actions.applyPreview();
        },

        setTablet() {
            const ctx = getContext();
            ctx.previewDevice = 'tablet';
            actions.applyPreview();
        },

        setMobile() {
            const ctx = getContext();
            ctx.previewDevice = 'mobile';
            actions.applyPreview();
        },

        applyPreview() {
            const ctx = getContext();
            const profileContent = document.querySelector('.frs-profile-content');
            if (!profileContent) return;

            profileContent.style.transition = 'max-width 0.3s ease';

            switch (ctx.previewDevice) {
                case 'tablet':
                    profileContent.style.maxWidth = '768px';
                    profileContent.style.margin = '0 auto';
                    break;
                case 'mobile':
                    profileContent.style.maxWidth = '375px';
                    profileContent.style.margin = '0 auto';
                    break;
                default:
                    profileContent.style.maxWidth = '';
                    profileContent.style.margin = '';
            }
        },

        async saveProfile() {
            const ctx = getContext();
            ctx.isSaving = true;

            // Collect all field values
            const formData = {};
            document.querySelectorAll('[data-frs-field]').forEach(field => {
                const key = field.dataset.frsField;
                formData[key] = field.value;
            });

            try {
                const response = await fetch('/wp-json/frs-users/v1/profiles/user/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.frsProfileEditor?.nonce || ''
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Failed to save profile');
                }

                // Update original values
                document.querySelectorAll('[data-frs-field]').forEach(field => {
                    field.dataset.frsOriginal = field.value;
                });

                // Exit edit mode
                ctx.isEditMode = false;
                document.body.classList.remove('frs-edit-mode');

                window.dispatchEvent(new CustomEvent('frs:profileSaved', {
                    detail: { success: true }
                }));

            } catch (error) {
                console.error('Save failed:', error);
                window.dispatchEvent(new CustomEvent('frs:profileSaved', {
                    detail: { success: false, error: error.message }
                }));
            } finally {
                ctx.isSaving = false;
            }
        },

        updateField(event) {
            const field = event.target;
            const key = field.dataset.frsField;

            // Store original value on first edit
            if (field.dataset.frsOriginal === undefined) {
                field.dataset.frsOriginal = field.defaultValue || '';
            }
        }
    },
    callbacks: {
        initField() {
            const { ref } = getElement();
            if (ref.dataset.frsField) {
                ref.dataset.frsOriginal = ref.value || '';
            }
        }
    }
});
