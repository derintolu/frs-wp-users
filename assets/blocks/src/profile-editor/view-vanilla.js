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

		// ============================================
		// TAB SWITCHING
		// ============================================
		let settingsLoaded = false;
		let activityLoaded = false;
		const config = window.frsProfileEditor || {};

		const tabs = container.querySelectorAll('.frs-profile__tab');
		const tabPanels = container.querySelectorAll('.frs-profile__tab-panel');

		tabs.forEach(function(tab) {
			tab.addEventListener('click', function(e) {
				e.preventDefault();
				const targetTab = this.dataset.tab;

				// Update tab active states
				tabs.forEach(function(t) { t.classList.remove('frs-profile__tab--active'); });
				this.classList.add('frs-profile__tab--active');

				// Show/hide panels
				tabPanels.forEach(function(panel) {
					if (panel.dataset.tabPanel === targetTab) {
						panel.hidden = false;
						panel.classList.add('frs-profile__tab-panel--active');
					} else {
						panel.hidden = true;
						panel.classList.remove('frs-profile__tab-panel--active');
					}
				});

				// Load activity feed on first visit
				if (targetTab === 'activity' && !activityLoaded) {
					loadActivityFeed();
				}

				// Load settings on first visit
				if (targetTab === 'settings' && !settingsLoaded) {
					loadSettings();
				}
			});
		});

		// ============================================
		// SETTINGS (auto-save on toggle)
		// ============================================
		const settingsToast = document.getElementById('frs-settings-toast');

		async function loadSettings() {
			try {
				const response = await fetch(config.restUrl + 'profiles/me/settings', {
					headers: { 'X-WP-Nonce': config.nonce || '' }
				});
				if (!response.ok) return;

				const result = await response.json();
				const data = result.data || {};

				// Set notification toggles
				if (data.notifications) {
					Object.entries(data.notifications).forEach(function([key, value]) {
						const input = container.querySelector('[data-setting="notifications"][data-key="' + key + '"]');
						if (input) input.checked = !!value;
					});
				}

				// Set privacy toggles
				if (data.privacy) {
					Object.entries(data.privacy).forEach(function([key, value]) {
						const input = container.querySelector('[data-setting="privacy"][data-key="' + key + '"]');
						if (input) input.checked = !!value;
					});
				}

				settingsLoaded = true;
			} catch (err) {
				console.error('Failed to load settings:', err);
			}
		}

		function showToast(message) {
			if (!settingsToast) return;
			settingsToast.textContent = message || 'Saved';
			settingsToast.hidden = false;
			clearTimeout(settingsToast._timeout);
			settingsToast._timeout = setTimeout(function() {
				settingsToast.hidden = true;
			}, 2000);
		}

		// Auto-save on toggle change
		container.querySelectorAll('[data-setting]').forEach(function(input) {
			input.addEventListener('change', async function() {
				const settingType = this.dataset.setting; // 'notifications' or 'privacy'
				const key = this.dataset.key;
				const value = this.checked;

				// Gather all values for this setting type
				const settings = {};
				container.querySelectorAll('[data-setting="' + settingType + '"]').forEach(function(inp) {
					settings[inp.dataset.key] = inp.checked;
				});

				try {
					const response = await fetch(config.restUrl + 'profiles/me/settings/' + settingType, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': config.nonce || ''
						},
						body: JSON.stringify(settings)
					});

					if (response.ok) {
						showToast('Saved');
					} else {
						showToast('Failed to save');
						// Revert toggle
						this.checked = !value;
					}
				} catch (err) {
					showToast('Failed to save');
					this.checked = !value;
				}
			});
		});

		// ============================================
		// ACTIVITY FEED
		// ============================================
		let activityPage = 1;
		let activityPages = 1;
		const activityFeed = document.getElementById('frs-activity-feed');
		const activityMore = document.getElementById('frs-activity-more');
		const loadMoreBtn = document.getElementById('frs-load-more-activity');

		const ACTION_ICONS = {
			profile_updated: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
			meeting_requested: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
			post_published: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
			lesson_completed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
			course_enrolled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
		};

		function renderActivityItem(item) {
			const icon = ACTION_ICONS[item.action] || ACTION_ICONS['profile_updated'];
			const actionClass = 'frs-profile__activity-icon--' + item.action.replace(/_/g, '-');

			return '<div class="frs-profile__activity-item">' +
				'<div class="frs-profile__activity-icon ' + actionClass + '">' + icon + '</div>' +
				'<div class="frs-profile__activity-body">' +
					'<p class="frs-profile__activity-summary">' + escapeHtml(item.summary) + '</p>' +
					'<span class="frs-profile__activity-time">' + escapeHtml(item.time_ago) + '</span>' +
				'</div>' +
			'</div>';
		}

		function escapeHtml(str) {
			const div = document.createElement('div');
			div.textContent = str;
			return div.innerHTML;
		}

		async function loadActivityFeed(append) {
			if (!activityFeed) return;

			if (!append) {
				activityFeed.innerHTML = '<div class="frs-profile__activity-loading">Loading activity...</div>';
			}

			try {
				const userId = config.userId;
				const response = await fetch(config.restUrl + 'profiles/' + userId + '/activity?page=' + activityPage + '&per_page=20', {
					headers: { 'X-WP-Nonce': config.nonce || '' }
				});

				if (!response.ok) throw new Error('Failed to load activity');

				const result = await response.json();
				activityPages = result.pages || 1;

				if (!append) {
					activityFeed.innerHTML = '';
				}

				if (result.data && result.data.length > 0) {
					result.data.forEach(function(item) {
						activityFeed.insertAdjacentHTML('beforeend', renderActivityItem(item));
					});
				} else if (!append) {
					activityFeed.innerHTML = '<p class="frs-profile__empty frs-profile__empty--center">No activity yet.</p>';
				}

				// Show/hide load more
				if (activityMore) {
					activityMore.hidden = activityPage >= activityPages;
				}

				activityLoaded = true;
			} catch (err) {
				if (!append) {
					activityFeed.innerHTML = '<p class="frs-profile__empty frs-profile__empty--center">Could not load activity.</p>';
				}
				console.error('Activity feed error:', err);
			}
		}

		if (loadMoreBtn) {
			loadMoreBtn.addEventListener('click', function(e) {
				e.preventDefault();
				activityPage++;
				loadActivityFeed(true);
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
