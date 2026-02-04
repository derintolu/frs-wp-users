/**
 * Profile Editor - WordPress Interactivity API Store
 *
 * Handles all interactive functionality for the profile editor block:
 * - Edit mode toggle
 * - Avatar/QR flip
 * - Responsive preview
 * - Field updates (text, checkboxes, arrays)
 * - Custom links management
 * - Profile save via REST API
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

// Store original profile for cancel functionality
let originalProfile = null;

const { state, actions } = store('frs/profile-editor', {
    state: {
        get isDesktop() {
            return getContext().previewDevice === 'desktop';
        },
        get isTablet() {
            return getContext().previewDevice === 'tablet';
        },
        get isMobile() {
            return getContext().previewDevice === 'mobile';
        },
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
        /**
         * Toggle edit mode on/off
         */
        toggleEdit() {
            const ctx = getContext();

            // Store original profile when entering edit mode
            if (!ctx.isEditing) {
                originalProfile = JSON.parse(JSON.stringify(ctx.profile));
            }

            ctx.isEditing = !ctx.isEditing;
            document.body.classList.toggle('frs-edit-mode', ctx.isEditing);

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('frs:editModeChanged', {
                detail: { isEditing: ctx.isEditing }
            }));
        },

        /**
         * Cancel edit and restore original values
         */
        cancelEdit() {
            const ctx = getContext();

            // Restore original profile
            if (originalProfile) {
                ctx.profile = JSON.parse(JSON.stringify(originalProfile));
            }

            ctx.isEditing = false;
            document.body.classList.remove('frs-edit-mode');

            window.dispatchEvent(new CustomEvent('frs:editModeChanged', {
                detail: { isEditing: false }
            }));
        },

        /**
         * Flip avatar/QR code
         */
        flip() {
            const ctx = getContext();
            ctx.isFlipped = !ctx.isFlipped;
        },

        /**
         * Set preview to desktop
         */
        setDesktop() {
            const ctx = getContext();
            ctx.previewDevice = 'desktop';
            actions.applyPreview();
        },

        /**
         * Set preview to tablet
         */
        setTablet() {
            const ctx = getContext();
            ctx.previewDevice = 'tablet';
            actions.applyPreview();
        },

        /**
         * Set preview to mobile
         */
        setMobile() {
            const ctx = getContext();
            ctx.previewDevice = 'mobile';
            actions.applyPreview();
        },

        /**
         * Apply preview width to content
         */
        applyPreview() {
            const ctx = getContext();
            const profileContent = document.querySelector('.frs-profile__preview-content');
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

        /**
         * Update a text field in the profile
         */
        updateField(event) {
            const ctx = getContext();
            const field = event.target;
            const fieldName = field.dataset.field;

            if (fieldName && ctx.profile) {
                ctx.profile[fieldName] = field.value;
            }
        },

        /**
         * Toggle a service area checkbox
         */
        toggleServiceArea(event) {
            const ctx = getContext();
            const checkbox = event.target;
            const value = checkbox.value;

            if (!ctx.profile.service_areas) {
                ctx.profile.service_areas = [];
            }

            const index = ctx.profile.service_areas.indexOf(value);
            if (checkbox.checked && index === -1) {
                ctx.profile.service_areas = [...ctx.profile.service_areas, value];
            } else if (!checkbox.checked && index > -1) {
                ctx.profile.service_areas = ctx.profile.service_areas.filter(s => s !== value);
            }
        },

        /**
         * Toggle a specialty checkbox
         */
        toggleSpecialty(event) {
            const ctx = getContext();
            const checkbox = event.target;
            const value = checkbox.value;

            if (!ctx.profile.specialties_lo) {
                ctx.profile.specialties_lo = [];
            }

            const index = ctx.profile.specialties_lo.indexOf(value);
            if (checkbox.checked && index === -1) {
                ctx.profile.specialties_lo = [...ctx.profile.specialties_lo, value];
            } else if (!checkbox.checked && index > -1) {
                ctx.profile.specialties_lo = ctx.profile.specialties_lo.filter(s => s !== value);
            }
        },

        /**
         * Toggle a certification checkbox
         */
        toggleCertification(event) {
            const ctx = getContext();
            const checkbox = event.target;
            const value = checkbox.value;

            if (!ctx.profile.namb_certifications) {
                ctx.profile.namb_certifications = [];
            }

            const index = ctx.profile.namb_certifications.indexOf(value);
            if (checkbox.checked && index === -1) {
                ctx.profile.namb_certifications = [...ctx.profile.namb_certifications, value];
            } else if (!checkbox.checked && index > -1) {
                ctx.profile.namb_certifications = ctx.profile.namb_certifications.filter(c => c !== value);
            }
        },

        /**
         * Update a custom link title
         */
        updateLinkTitle(event) {
            const ctx = getContext();
            const input = event.target;
            const index = parseInt(input.dataset.index, 10);

            if (!ctx.profile.custom_links) {
                ctx.profile.custom_links = [];
            }

            if (ctx.profile.custom_links[index]) {
                // Create new array to trigger reactivity
                const links = [...ctx.profile.custom_links];
                links[index] = { ...links[index], title: input.value };
                ctx.profile.custom_links = links;
            }
        },

        /**
         * Update a custom link URL
         */
        updateLinkUrl(event) {
            const ctx = getContext();
            const input = event.target;
            const index = parseInt(input.dataset.index, 10);

            if (!ctx.profile.custom_links) {
                ctx.profile.custom_links = [];
            }

            if (ctx.profile.custom_links[index]) {
                // Create new array to trigger reactivity
                const links = [...ctx.profile.custom_links];
                links[index] = { ...links[index], url: input.value };
                ctx.profile.custom_links = links;
            }
        },

        /**
         * Add a new custom link
         */
        addLink() {
            const ctx = getContext();

            if (!ctx.profile.custom_links) {
                ctx.profile.custom_links = [];
            }

            // Create new array with new link to trigger reactivity
            ctx.profile.custom_links = [
                ...ctx.profile.custom_links,
                { title: '', url: '' }
            ];

            // Re-render the links list in edit mode
            const linksList = document.querySelector('.frs-profile__links-edit-list');
            if (linksList) {
                const index = ctx.profile.custom_links.length - 1;
                const newItem = document.createElement('div');
                newItem.className = 'frs-profile__link-edit-item';
                newItem.dataset.index = index;
                newItem.innerHTML = `
                    <input
                        type="text"
                        class="frs-profile__edit-input"
                        data-wp-on--input="actions.updateLinkTitle"
                        data-index="${index}"
                        placeholder="Link Title"
                    >
                    <input
                        type="url"
                        class="frs-profile__edit-input"
                        data-wp-on--input="actions.updateLinkUrl"
                        data-index="${index}"
                        placeholder="https://example.com"
                    >
                    <button
                        type="button"
                        class="frs-profile__link-remove-btn"
                        data-wp-on--click="actions.removeLink"
                        data-index="${index}"
                        title="Remove link"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;
                linksList.appendChild(newItem);

                // Manually bind events for new elements
                const titleInput = newItem.querySelector('input[data-wp-on--input="actions.updateLinkTitle"]');
                const urlInput = newItem.querySelector('input[data-wp-on--input="actions.updateLinkUrl"]');
                const removeBtn = newItem.querySelector('button[data-wp-on--click="actions.removeLink"]');

                if (titleInput) {
                    titleInput.addEventListener('input', actions.updateLinkTitle);
                }
                if (urlInput) {
                    urlInput.addEventListener('input', actions.updateLinkUrl);
                }
                if (removeBtn) {
                    removeBtn.addEventListener('click', actions.removeLink);
                }
            }
        },

        /**
         * Remove a custom link
         */
        removeLink(event) {
            const ctx = getContext();
            const button = event.target.closest('button') || event.target;
            const index = parseInt(button.dataset.index, 10);

            if (!ctx.profile.custom_links) return;

            // Remove from array
            ctx.profile.custom_links = ctx.profile.custom_links.filter((_, i) => i !== index);

            // Remove DOM element
            const item = button.closest('.frs-profile__link-edit-item');
            if (item) {
                item.remove();
            }

            // Update indices of remaining items
            const linksList = document.querySelector('.frs-profile__links-edit-list');
            if (linksList) {
                const items = linksList.querySelectorAll('.frs-profile__link-edit-item');
                items.forEach((item, i) => {
                    item.dataset.index = i;
                    item.querySelectorAll('[data-index]').forEach(el => {
                        el.dataset.index = i;
                    });
                });
            }
        },

        /**
         * Save profile via REST API
         */
        async saveProfile() {
            const ctx = getContext();
            ctx.isSaving = true;

            // Collect profile data from context
            const profileData = {
                job_title: ctx.profile.job_title,
                city_state: ctx.profile.city_state,
                email: ctx.profile.email,
                phone_number: ctx.profile.phone_number,
                biography: ctx.profile.biography,
                website: ctx.profile.website,
                facebook_url: ctx.profile.facebook_url,
                instagram_url: ctx.profile.instagram_url,
                linkedin_url: ctx.profile.linkedin_url,
                twitter_url: ctx.profile.twitter_url,
                specialties_lo: ctx.profile.specialties_lo || [],
                namb_certifications: ctx.profile.namb_certifications || [],
                service_areas: ctx.profile.service_areas || [],
                custom_links: ctx.profile.custom_links || [],
            };

            try {
                const response = await fetch('/wp-json/frs-users/v1/profiles/user/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': window.frsProfileEditor?.nonce || ''
                    },
                    body: JSON.stringify(profileData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to save profile');
                }

                // Update original profile reference
                originalProfile = JSON.parse(JSON.stringify(ctx.profile));

                // Exit edit mode
                ctx.isEditing = false;
                document.body.classList.remove('frs-edit-mode');

                window.dispatchEvent(new CustomEvent('frs:profileSaved', {
                    detail: { success: true }
                }));

            } catch (error) {
                console.error('Save failed:', error);
                window.dispatchEvent(new CustomEvent('frs:profileSaved', {
                    detail: { success: false, error: error.message }
                }));

                // Show error to user
                alert('Failed to save profile: ' + error.message);
            } finally {
                ctx.isSaving = false;
            }
        }
    },
    callbacks: {
        /**
         * Initialize field with original value tracking
         */
        initField() {
            const { ref } = getElement();
            if (ref && ref.dataset.field) {
                ref.dataset.frsOriginal = ref.value || '';
            }
        }
    }
});
