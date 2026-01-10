/**
 * FRS Users Admin JavaScript
 *
 * Handles admin interface interactions for profile management.
 *
 * @package FRSUsers
 * @since 1.0.0
 */

(function($) {
	'use strict';

	/**
	 * Handle Create User Account button clicks
	 */
	function handleCreateUserAccount() {
		$('.create-user-btn').on('click', function(e) {
			e.preventDefault();

			const $button = $(this);
			const profileId = $button.data('profile-id');
			const nonce = $button.data('nonce');

			// Confirm action
			if (!confirm(frsUsersAdmin.strings.confirmCreate)) {
				return;
			}

			// Disable button and show loading state
			$button.prop('disabled', true).text(frsUsersAdmin.strings.creating);

			// Send AJAX request
			$.ajax({
				url: frsUsersAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'frs_create_user_account',
					profile_id: profileId,
					nonce: nonce
				},
				success: function(response) {
					if (response.success) {
						// Show success message
						$button
							.removeClass('button-primary')
							.addClass('button-disabled')
							.text('✓ ' + response.data.username)
							.prop('disabled', true);

						// Show success notice
						showNotice(response.data.message, 'success');

						// Reload page after 2 seconds
						setTimeout(function() {
							window.location.reload();
						}, 2000);
					} else {
						// Show error message
						showNotice(response.data.message || frsUsersAdmin.strings.error, 'error');
						$button.prop('disabled', false).text(frsUsersAdmin.strings.createUserAccount);
					}
				},
				error: function(xhr, status, error) {
					showNotice(frsUsersAdmin.strings.error + ' ' + error, 'error');
					$button.prop('disabled', false).text(frsUsersAdmin.strings.createUserAccount);
				}
			});
		});
	}

	/**
	 * Handle Delete Profile link clicks
	 */
	function handleDeleteProfile() {
		$('.delete-profile').on('click', function(e) {
			if (!confirm(frsUsersAdmin.strings.confirmDelete)) {
				e.preventDefault();
				return false;
			}
		});
	}

	/**
	 * Show admin notice
	 *
	 * @param {string} message - Notice message
	 * @param {string} type - Notice type (success, error, warning, info)
	 */
	function showNotice(message, type) {
		type = type || 'info';

		const $notice = $('<div>')
			.addClass('notice notice-' + type + ' is-dismissible')
			.html('<p>' + message + '</p>')
			.hide();

		$('.wrap h1').after($notice);
		$notice.slideDown();

		// Auto-dismiss after 5 seconds
		setTimeout(function() {
			$notice.slideUp(function() {
				$(this).remove();
			});
		}, 5000);

		// Handle manual dismiss
		$notice.on('click', '.notice-dismiss', function() {
			$notice.slideUp(function() {
				$(this).remove();
			});
		});
	}

	/**
	 * Initialize on document ready
	 */
	$(document).ready(function() {
		handleCreateUserAccount();
		handleDeleteProfile();
	});

})(jQuery);
