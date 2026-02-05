/**
 * Profile Editor - Vanilla JS Implementation
 * Handles edit mode toggle, QR flip, preview devices, and save functionality.
 */
(function() {
	'use strict';

	function initProfileEditor() {
		const container = document.getElementById('frs-profile');
		if (!container) return;

		// State
		let isEditing = false;
		let isFlipped = false;
		let previewDevice = 'desktop';
		let isSaving = false;

		// Elements
		const avatarInner = container.querySelector('.frs-profile__avatar-inner');
		const previewFrame = container.querySelector('.frs-profile__preview-frame');
		const previewContent = container.querySelector('.frs-profile__preview-content');
		const previewBtns = container.querySelectorAll('.frs-profile__preview-btn');
		const editBtn = container.querySelector('.frs-profile__bar-edit-btn');
		const cancelBtn = container.querySelector('.frs-profile__bar-cancel-btn');
		const saveBtn = container.querySelector('.frs-profile__bar-save-btn');
		const saveText = container.querySelector('.frs-profile__save-text');
		const flipBtns = container.querySelectorAll('.frs-profile__qr-toggle');
		const viewElements = container.querySelectorAll('[data-view-mode]');
		const editElements = container.querySelectorAll('[data-edit-mode]');
		const avatarUploadBtn = container.querySelector('#avatar-upload-trigger');
		const avatarFileInput = container.querySelector('#avatar-file-input');
		const avatarImg = container.querySelector('.frs-profile__avatar-front img');

		// Avatar Upload
		if (avatarUploadBtn && avatarFileInput) {
			avatarUploadBtn.addEventListener('click', function(e) {
				e.preventDefault();
				avatarFileInput.click();
			});

			avatarFileInput.addEventListener('change', async function(e) {
				const file = e.target.files[0];
				if (!file) return;

				// Validate file type
				if (!file.type.startsWith('image/')) {
					alert('Please select an image file');
					return;
				}

				// Validate file size (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					alert('Image must be less than 5MB');
					return;
				}

				const config = window.frsProfileEditor || {};
				const userId = config.userId;

				if (!userId) {
					alert('User ID not found');
					return;
				}

				// Show uploading state
				avatarUploadBtn.textContent = 'Uploading...';
				avatarUploadBtn.disabled = true;

				try {
					// Create FormData for file upload
					const formData = new FormData();
					formData.append('file', file);

					// Upload via WP REST API media endpoint
					const uploadResponse = await fetch('/wp-json/wp/v2/media', {
						method: 'POST',
						headers: {
							'X-WP-Nonce': config.nonce || ''
						},
						body: formData
					});

					if (!uploadResponse.ok) {
						throw new Error('Failed to upload image');
					}

					const mediaData = await uploadResponse.json();
					const attachmentId = mediaData.id;
					const imageUrl = mediaData.source_url;

					// Update user's headshot meta
					const updateResponse = await fetch('/wp-json/frs-users/v1/profiles/' + userId, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': config.nonce || ''
						},
						body: JSON.stringify({ headshot_id: attachmentId })
					});

					if (!updateResponse.ok) {
						throw new Error('Failed to update profile');
					}

					// Update avatar image on page
					if (avatarImg) {
						avatarImg.src = imageUrl;
					}

					// Reset button
					avatarUploadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Change Photo';
					avatarUploadBtn.disabled = false;

				} catch (err) {
					alert('Upload failed: ' + err.message);
					avatarUploadBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Change Photo';
					avatarUploadBtn.disabled = false;
				}

				// Clear file input
				avatarFileInput.value = '';
			});
		}

		// QR Flip
		flipBtns.forEach(function(btn) {
			btn.addEventListener('click', function(e) {
				e.preventDefault();
				isFlipped = !isFlipped;
				if (avatarInner) {
					avatarInner.classList.toggle('frs-profile__avatar-inner--flipped', isFlipped);
				}
			});
		});

		// Preview device buttons
		previewBtns.forEach(function(btn) {
			btn.addEventListener('click', function(e) {
				e.preventDefault();
				const span = this.querySelector('span');
				const device = span ? span.textContent.trim().toLowerCase() : 'desktop';
				previewDevice = device;

				// Update active states
				previewBtns.forEach(function(b) { b.classList.remove('active'); });
				this.classList.add('active');

				// Update frame classes
				if (previewFrame) {
					previewFrame.classList.remove('frs-profile__preview-frame--tablet', 'frs-profile__preview-frame--mobile');
				}
				if (previewContent) {
					previewContent.classList.remove('frs-profile__preview-content--tablet', 'frs-profile__preview-content--mobile');
				}

				if (device === 'tablet') {
					if (previewFrame) previewFrame.classList.add('frs-profile__preview-frame--tablet');
					if (previewContent) previewContent.classList.add('frs-profile__preview-content--tablet');
				} else if (device === 'mobile') {
					if (previewFrame) previewFrame.classList.add('frs-profile__preview-frame--mobile');
					if (previewContent) previewContent.classList.add('frs-profile__preview-content--mobile');
				}
			});
		});

		// Toggle edit mode
		function setEditMode(editing) {
			isEditing = editing;

			// Toggle buttons
			if (editBtn) editBtn.hidden = editing;
			if (cancelBtn) cancelBtn.hidden = !editing;
			if (saveBtn) saveBtn.hidden = !editing;

			// Toggle view/edit elements using hidden attribute
			viewElements.forEach(function(el) { el.hidden = editing; });
			editElements.forEach(function(el) { el.hidden = !editing; });

			// Add class to container for CSS hooks
			container.classList.toggle('is-editing', editing);
		}

		// Edit button
		if (editBtn) {
			editBtn.addEventListener('click', function(e) {
				e.preventDefault();
				setEditMode(true);
			});
		}

		// Cancel button
		if (cancelBtn) {
			cancelBtn.addEventListener('click', function(e) {
				e.preventDefault();
				setEditMode(false);
			});
		}

		// Save button
		if (saveBtn) {
			saveBtn.addEventListener('click', async function(e) {
				e.preventDefault();
				if (isSaving) return;

				isSaving = true;
				saveBtn.disabled = true;
				if (saveText) saveText.textContent = 'Saving...';

				try {
					// Gather form data from inputs
					const formData = {};
					container.querySelectorAll('[data-field]').forEach(function(input) {
						formData[input.dataset.field] = input.value;
					});

					// Gather checkboxes for arrays
					formData.specialties_lo = Array.from(container.querySelectorAll('[data-specialty]:checked')).map(function(cb) { return cb.value; });
					formData.namb_certifications = Array.from(container.querySelectorAll('[data-certification]:checked')).map(function(cb) { return cb.value; });
					formData.service_areas = Array.from(container.querySelectorAll('[data-service-area]:checked')).map(function(cb) { return cb.value; });

					const config = window.frsProfileEditor || {};
					const userId = config.userId;

					if (!userId) {
						throw new Error('User ID not found');
					}

					const response = await fetch('/wp-json/frs-users/v1/profiles/' + userId, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': config.nonce || ''
						},
						body: JSON.stringify(formData)
					});

					if (!response.ok) {
						const errorData = await response.json().catch(function() { return {}; });
						throw new Error(errorData.message || 'Failed to save profile');
					}

					// Reload to show updated data
					window.location.reload();
				} catch (err) {
					alert('Failed to save profile: ' + err.message);
					isSaving = false;
					saveBtn.disabled = false;
					if (saveText) saveText.textContent = 'Save Changes';
				}
			});
		}
	}

	// Run on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initProfileEditor);
	} else {
		initProfileEditor();
	}
})();
