/**
 * Settings Page - Interactivity API Store
 *
 * Handles tab switching, form state, and REST API saves
 *
 * @package FRSUsers
 */

import { store, getContext } from '@wordpress/interactivity';

const { state, actions, callbacks } = store('frs-users/settings', {
	state: {
		get isAccountTab() {
			return getContext().activeTab === 'account';
		},
		get isNotificationsTab() {
			return getContext().activeTab === 'notifications';
		},
		get isIntegrationsTab() {
			return getContext().activeTab === 'integrations';
		},
		get canSavePassword() {
			const ctx = getContext();
			return ctx.newPassword && ctx.confirmPassword && ctx.newPassword === ctx.confirmPassword && ctx.newPassword.length >= 8;
		},
		// Message state getters
		get hasMessage() {
			return !!getContext().message;
		},
		get isSuccessMessage() {
			const msg = getContext().message;
			return msg && msg.type === 'success';
		},
		get isErrorMessage() {
			const msg = getContext().message;
			return msg && msg.type === 'error';
		},
		get messageText() {
			const msg = getContext().message;
			return msg ? msg.text : '';
		},
		// FUB state getters
		get showFubSkeleton() {
			return getContext().fubLoading;
		},
		get showFubConnected() {
			const ctx = getContext();
			return !ctx.fubLoading && ctx.fubConnected;
		},
		get showFubNotConnected() {
			const ctx = getContext();
			return !ctx.fubLoading && !ctx.fubConnected;
		},
	},

	actions: {
		setTab(event) {
			const tab = event.target.closest('[data-tab]')?.dataset.tab;
			if (tab) {
				getContext().activeTab = tab;
				// Clear any messages when switching tabs
				getContext().message = null;
			}
		},

		updateField(event) {
			const { field } = event.target.dataset;
			if (field) {
				getContext()[field] = event.target.value;
			}
		},

		toggleSwitch(event) {
			const { field } = event.target.dataset;
			if (field) {
				getContext()[field] = !getContext()[field];
			}
		},

		async saveAccount() {
			const ctx = getContext();
			ctx.isSaving = true;
			ctx.message = null;

			try {
				const response = await fetch('/wp-json/wp/v2/users/me', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({
						first_name: ctx.firstName,
						last_name: ctx.lastName,
						name: ctx.displayName,
						...(ctx.isMicrosoftUser ? {} : { email: ctx.email }),
					}),
				});

				if (response.ok) {
					ctx.message = { type: 'success', text: 'Account details updated successfully!' };
				} else {
					const error = await response.json();
					ctx.message = { type: 'error', text: error.message || 'Failed to update account details' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while saving' };
			} finally {
				ctx.isSaving = false;
			}
		},

		async savePassword() {
			const ctx = getContext();

			if (ctx.newPassword !== ctx.confirmPassword) {
				ctx.message = { type: 'error', text: 'Passwords do not match' };
				return;
			}

			if (ctx.newPassword.length < 8) {
				ctx.message = { type: 'error', text: 'Password must be at least 8 characters' };
				return;
			}

			ctx.isSaving = true;
			ctx.message = null;

			try {
				const response = await fetch('/wp-json/wp/v2/users/me', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({
						password: ctx.newPassword,
					}),
				});

				if (response.ok) {
					ctx.message = { type: 'success', text: 'Password updated successfully!' };
					ctx.newPassword = '';
					ctx.confirmPassword = '';
				} else {
					const error = await response.json();
					ctx.message = { type: 'error', text: error.message || 'Failed to update password' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while updating password' };
			} finally {
				ctx.isSaving = false;
			}
		},

		async saveNotifications() {
			const ctx = getContext();
			ctx.isSaving = true;
			ctx.message = null;

			try {
				const response = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/settings/notifications`, {
					method: 'PUT',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({
						lead_notifications: ctx.leadNotifications,
						meeting_notifications: ctx.meetingNotifications,
						marketing_emails: ctx.marketingEmails,
						system_updates: ctx.systemUpdates,
						weekly_digest: ctx.weeklyDigest,
					}),
				});

				if (response.ok) {
					ctx.message = { type: 'success', text: 'Notification settings saved!' };
				} else {
					ctx.message = { type: 'error', text: 'Failed to save notification settings' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while saving' };
			} finally {
				ctx.isSaving = false;
			}
		},

		async connectFub() {
			const ctx = getContext();
			if (!ctx.fubApiKey?.trim()) {
				ctx.message = { type: 'error', text: 'Please enter your Follow Up Boss API key' };
				return;
			}

			ctx.fubLoading = true;
			ctx.message = null;

			try {
				const response = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/integrations/followupboss`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({ api_key: ctx.fubApiKey }),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					ctx.message = { type: 'success', text: data.message || 'Connected to Follow Up Boss!' };
					ctx.fubConnected = true;
					ctx.fubAccountName = data.account_name || '';
					ctx.fubApiKey = '';
				} else {
					ctx.message = { type: 'error', text: data.message || 'Failed to connect' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while connecting' };
			} finally {
				ctx.fubLoading = false;
			}
		},

		async disconnectFub() {
			const ctx = getContext();
			ctx.fubLoading = true;
			ctx.message = null;

			try {
				const response = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/integrations/followupboss`, {
					method: 'DELETE',
					credentials: 'include',
					headers: {
						'X-WP-Nonce': ctx.restNonce,
					},
				});

				const data = await response.json();

				if (response.ok && data.success) {
					ctx.message = { type: 'success', text: 'Disconnected from Follow Up Boss' };
					ctx.fubConnected = false;
					ctx.fubAccountName = '';
				} else {
					ctx.message = { type: 'error', text: data.message || 'Failed to disconnect' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while disconnecting' };
			} finally {
				ctx.fubLoading = false;
			}
		},

		async testFub() {
			const ctx = getContext();
			ctx.fubLoading = true;
			ctx.message = null;

			try {
				const response = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/integrations/followupboss/test`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'X-WP-Nonce': ctx.restNonce,
					},
				});

				const data = await response.json();

				if (response.ok && data.success) {
					ctx.message = { type: 'success', text: 'Connection test successful!' };
				} else {
					ctx.message = { type: 'error', text: data.message || 'Connection test failed' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred during the test' };
			} finally {
				ctx.fubLoading = false;
			}
		},

		dismissMessage() {
			getContext().message = null;
		},

		async disconnectTelegram() {
			const ctx = getContext();
			ctx.isSaving = true;
			ctx.message = null;

			try {
				// Clear the wptelegram_user_id meta
				const response = await fetch('/wp-json/wp/v2/users/me', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({
						meta: { wptelegram_user_id: '' },
					}),
				});

				if (response.ok) {
					// Also clear telegram_username from frs profile
					if (ctx.profileId) {
						await fetch(`${ctx.restUrl}frs-users/v1/profiles/${ctx.profileId}`, {
							method: 'PUT',
							credentials: 'include',
							headers: {
								'Content-Type': 'application/json',
								'X-WP-Nonce': ctx.restNonce,
							},
							body: JSON.stringify({ telegram_username: '' }),
						});
					}

					ctx.telegramConnected = false;
					ctx.telegramUsername = '';
					ctx.telegramUserId = '';
					ctx.message = { type: 'success', text: 'Telegram disconnected successfully' };
				} else {
					ctx.message = { type: 'error', text: 'Failed to disconnect Telegram' };
				}
			} catch (error) {
				ctx.message = { type: 'error', text: 'An error occurred while disconnecting' };
			} finally {
				ctx.isSaving = false;
			}
		},
	},

	callbacks: {
		onInit() {
			const ctx = getContext();

			// Load additional user settings via REST API (non-blocking)
			if (ctx.restNonce) {
				callbacks.loadUserData().catch(() => {});
			}
		},

		async loadUserData() {
			const ctx = getContext();
			try {
				// Load WordPress user data to check for Microsoft auth
				const userResponse = await fetch('/wp-json/wp/v2/users/me?context=edit', {
					credentials: 'include',
					headers: {
						'X-WP-Nonce': ctx.restNonce,
					},
				});

				if (userResponse.ok) {
					const userData = await userResponse.json();
					if (userData.email) ctx.email = userData.email;
					if (userData.first_name) ctx.firstName = userData.first_name;
					if (userData.last_name) ctx.lastName = userData.last_name;
					if (userData.name) ctx.displayName = userData.name;
					if (userData.username) ctx.username = userData.username;

					// Check if Microsoft user
					const wpo365Meta = userData.meta?.wpo365_auth || userData.meta?.wpo365_upn || userData.meta?.wpo365_email;
					ctx.isMicrosoftUser = !!wpo365Meta;
				}

				// Load FUB status
				const fubResponse = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/integrations/followupboss`, {
					credentials: 'include',
					headers: {
						'X-WP-Nonce': ctx.restNonce,
					},
				});

				if (fubResponse.ok) {
					const fubData = await fubResponse.json();
					ctx.fubConnected = fubData.connected || false;
					ctx.fubAccountName = fubData.account_name || '';
					ctx.fubMaskedKey = fubData.masked_key || '';
				}
				ctx.fubLoading = false;
			} catch (error) {
				console.error('Failed to load user data:', error);
				ctx.fubLoading = false;
			}
		},
	},
});
