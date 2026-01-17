/**
 * Profile Editor - WordPress Interactivity API Store
 *
 * Handles edit mode toggle, field updates, responsive preview, and profile saving.
 */
import { store, getContext } from '@wordpress/interactivity';

store( 'frs/profile-editor', {
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
	},
	actions: {
		/**
		 * Toggle avatar/QR code flip
		 */
		flip() {
			const ctx = getContext();
			ctx.isFlipped = ! ctx.isFlipped;
		},

		/**
		 * Toggle edit mode on/off
		 */
		toggleEdit() {
			const ctx = getContext();
			ctx.isEditing = ! ctx.isEditing;

			// If canceling, restore original values
			if ( ! ctx.isEditing && ctx.originalProfile ) {
				ctx.profile = JSON.parse( JSON.stringify( ctx.originalProfile ) );
			}

			// If entering edit mode, store original values
			if ( ctx.isEditing ) {
				ctx.originalProfile = JSON.parse( JSON.stringify( ctx.profile ) );
			}
		},

		/**
		 * Update a text field in the profile context
		 */
		updateField( event ) {
			const ctx = getContext();
			const field = event.target.dataset.field;
			const value = event.target.value;

			if ( field && ctx.profile ) {
				ctx.profile[ field ] = value;
			}
		},

		/**
		 * Toggle a specialty checkbox
		 */
		toggleSpecialty( event ) {
			const ctx = getContext();
			const value = event.target.value;
			const checked = event.target.checked;

			if ( ! ctx.profile.specialties_lo ) {
				ctx.profile.specialties_lo = [];
			}

			if ( checked ) {
				if ( ! ctx.profile.specialties_lo.includes( value ) ) {
					ctx.profile.specialties_lo = [ ...ctx.profile.specialties_lo, value ];
				}
			} else {
				ctx.profile.specialties_lo = ctx.profile.specialties_lo.filter( ( s ) => s !== value );
			}
		},

		/**
		 * Toggle a certification checkbox
		 */
		toggleCertification( event ) {
			const ctx = getContext();
			const value = event.target.value;
			const checked = event.target.checked;

			if ( ! ctx.profile.namb_certifications ) {
				ctx.profile.namb_certifications = [];
			}

			if ( checked ) {
				if ( ! ctx.profile.namb_certifications.includes( value ) ) {
					ctx.profile.namb_certifications = [ ...ctx.profile.namb_certifications, value ];
				}
			} else {
				ctx.profile.namb_certifications = ctx.profile.namb_certifications.filter( ( c ) => c !== value );
			}
		},

		/**
		 * Toggle a service area checkbox
		 */
		toggleServiceArea( event ) {
			const ctx = getContext();
			const value = event.target.value;
			const checked = event.target.checked;

			if ( ! ctx.profile.service_areas ) {
				ctx.profile.service_areas = [];
			}

			if ( checked ) {
				if ( ! ctx.profile.service_areas.includes( value ) ) {
					ctx.profile.service_areas = [ ...ctx.profile.service_areas, value ];
				}
			} else {
				ctx.profile.service_areas = ctx.profile.service_areas.filter( ( s ) => s !== value );
			}
		},

		/**
		 * Update custom link title
		 */
		updateLinkTitle( event ) {
			const ctx = getContext();
			const index = parseInt( event.target.dataset.index, 10 );
			const value = event.target.value;

			if ( ! ctx.profile.custom_links ) {
				ctx.profile.custom_links = [];
			}

			if ( ctx.profile.custom_links[ index ] ) {
				ctx.profile.custom_links[ index ].title = value;
			}
		},

		/**
		 * Update custom link URL
		 */
		updateLinkUrl( event ) {
			const ctx = getContext();
			const index = parseInt( event.target.dataset.index, 10 );
			const value = event.target.value;

			if ( ! ctx.profile.custom_links ) {
				ctx.profile.custom_links = [];
			}

			if ( ctx.profile.custom_links[ index ] ) {
				ctx.profile.custom_links[ index ].url = value;
			}
		},

		/**
		 * Add a new custom link
		 */
		addLink() {
			const ctx = getContext();

			if ( ! ctx.profile.custom_links ) {
				ctx.profile.custom_links = [];
			}

			ctx.profile.custom_links = [
				...ctx.profile.custom_links,
				{ title: '', url: '' },
			];

			// Re-render the links edit list
			rerenderCustomLinks( ctx.profile.custom_links );
		},

		/**
		 * Remove a custom link
		 */
		removeLink( event ) {
			const ctx = getContext();
			const index = parseInt( event.target.closest( '[data-index]' ).dataset.index, 10 );

			if ( ctx.profile.custom_links && ctx.profile.custom_links[ index ] !== undefined ) {
				ctx.profile.custom_links = ctx.profile.custom_links.filter( ( _, i ) => i !== index );
				// Re-render the links edit list
				rerenderCustomLinks( ctx.profile.custom_links );
			}
		},

		/**
		 * Set preview to desktop width
		 */
		setDesktop() {
			const ctx = getContext();
			ctx.previewDevice = 'desktop';
		},

		/**
		 * Set preview to tablet width
		 */
		setTablet() {
			const ctx = getContext();
			ctx.previewDevice = 'tablet';
		},

		/**
		 * Set preview to mobile width
		 */
		setMobile() {
			const ctx = getContext();
			ctx.previewDevice = 'mobile';
		},

		/**
		 * Save profile via REST API
		 */
		async saveProfile() {
			const ctx = getContext();

			if ( ctx.isSaving ) {
				return;
			}

			ctx.isSaving = true;

			try {
				// Build form data from profile context
				const formData = {
					// Basic fields
					job_title: ctx.profile.job_title || '',
					city_state: ctx.profile.city_state || '',
					email: ctx.profile.email || '',
					phone_number: ctx.profile.phone_number || '',
					biography: ctx.profile.biography || '',
					// Social URLs
					website: ctx.profile.website || '',
					facebook_url: ctx.profile.facebook_url || '',
					instagram_url: ctx.profile.instagram_url || '',
					linkedin_url: ctx.profile.linkedin_url || '',
					twitter_url: ctx.profile.twitter_url || '',
					// Arrays
					specialties_lo: ctx.profile.specialties_lo || [],
					namb_certifications: ctx.profile.namb_certifications || [],
					service_areas: ctx.profile.service_areas || [],
					custom_links: ctx.profile.custom_links || [],
				};

			// Use the profile ID (which equals user ID for user-based profiles)
			const profileId = ctx.profile.id || ctx.userId;
			const response = await fetch( `/wp-json/frs-users/v1/profiles/${ profileId }`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.frsProfileEditor?.nonce || '',
				},
				body: JSON.stringify( formData ),
			} );

				if ( ! response.ok ) {
					const errorData = await response.json().catch( () => ( {} ) );
					throw new Error( errorData.message || 'Failed to save profile' );
				}

				// Update original profile to new values
				ctx.originalProfile = JSON.parse( JSON.stringify( ctx.profile ) );

				// Exit edit mode
				ctx.isEditing = false;

				// Dispatch success event
				window.dispatchEvent(
					new CustomEvent( 'frs:profileSaved', {
						detail: { success: true },
					} )
				);

				// Reload page to show updated data
				window.location.reload();
			} catch ( error ) {
				console.error( 'Save failed:', error );

				// Dispatch error event
				window.dispatchEvent(
					new CustomEvent( 'frs:profileSaved', {
						detail: { success: false, error: error.message },
					} )
				);

				// Show error to user
				alert( 'Failed to save profile: ' + error.message );
			} finally {
				ctx.isSaving = false;
			}
		},
	},
} );

/**
 * Re-render custom links edit list after add/remove
 * @param {Array} links - The updated links array
 */
function rerenderCustomLinks( links ) {
	const listEl = document.querySelector( '.frs-profile__links-edit-list' );
	if ( ! listEl ) {
		return;
	}

	listEl.innerHTML = links
		.map(
			( link, index ) => `
		<div class="frs-profile__link-edit-item" data-index="${ index }">
			<input 
				type="text" 
				class="frs-profile__edit-input" 
				value="${ escapeHtml( link.title || '' ) }"
				data-wp-on--input="actions.updateLinkTitle"
				data-index="${ index }"
				placeholder="Link Title"
			>
			<input 
				type="url" 
				class="frs-profile__edit-input" 
				value="${ escapeHtml( link.url || '' ) }"
				data-wp-on--input="actions.updateLinkUrl"
				data-index="${ index }"
				placeholder="https://example.com"
			>
			<button 
				type="button" 
				class="frs-profile__link-remove-btn"
				data-wp-on--click="actions.removeLink"
				data-index="${ index }"
				title="Remove link"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	`
		)
		.join( '' );
}

/**
 * Escape HTML for safe insertion
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml( str ) {
	const div = document.createElement( 'div' );
	div.textContent = str;
	return div.innerHTML;
}
