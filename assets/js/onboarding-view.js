/**
 * Onboarding Wizard - Interactivity API Store
 *
 * Handles step navigation, template selection, calendar creation, and OAuth flow.
 *
 * @package FRSUsers
 */

import { store, getContext } from '@wordpress/interactivity';

const { state, actions, callbacks } = store('frs-users/onboarding', {
	state: {
		// Step checks
		get isStep1() {
			return getContext().currentStep === 1;
		},
		get isStep2() {
			return getContext().currentStep === 2;
		},
		get isStep3() {
			return getContext().currentStep === 3;
		},
		get isStep4() {
			return getContext().currentStep === 4;
		},
		get isStep1OrBeyond() {
			return getContext().currentStep >= 1;
		},
		get isStep2OrBeyond() {
			return getContext().currentStep >= 2;
		},
		get isStep3OrBeyond() {
			return getContext().currentStep >= 3;
		},

		// Progress
		get progressWidth() {
			const ctx = getContext();
			const pct = ((ctx.currentStep - 1) / (ctx.totalSteps - 1)) * 100;
			return pct + '%';
		},

		// Validation
		get canProceedStep1() {
			const ctx = getContext();
			return ctx.firstName && ctx.firstName.trim().length > 0 &&
				ctx.lastName && ctx.lastName.trim().length > 0;
		},
		get canProceedStep3() {
			const ctx = getContext();
			return !!ctx.selectedTemplate && !ctx.isProcessing;
		},

		// Template selection checks
		get isTemplate_consultation() {
			return getContext().selectedTemplate === 'consultation';
		},
		get isTemplate_preapproval() {
			return getContext().selectedTemplate === 'preapproval';
		},
		get isTemplate_quick_call() {
			return getContext().selectedTemplate === 'quick_call';
		},

		// Message
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
	},

	actions: {
		updateField(event) {
			const field = event.target.dataset.field;
			if (field) {
				getContext()[field] = event.target.value;
			}
		},

		selectTemplate(event) {
			const card = event.target.closest('[data-template]');
			if (card) {
				getContext().selectedTemplate = card.dataset.template;
			}
		},

		async nextStep() {
			const ctx = getContext();

			if (ctx.currentStep === 1) {
				// Save name via WP REST API
				ctx.isProcessing = true;
				ctx.message = null;
				try {
					const res = await fetch(ctx.restUrl + 'wp/v2/users/me', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': ctx.restNonce,
						},
						body: JSON.stringify({
							first_name: ctx.firstName.trim(),
							last_name: ctx.lastName.trim(),
						}),
					});
					if (!res.ok) {
						throw new Error('Failed to save name');
					}
					ctx.currentStep = 2;
				} catch (e) {
					ctx.message = { type: 'error', text: e.message || 'Failed to save your name. Please try again.' };
				} finally {
					ctx.isProcessing = false;
				}
			} else if (ctx.currentStep === 2) {
				ctx.currentStep = 3;
			} else if (ctx.currentStep === 3) {
				// Create calendar via REST
				ctx.isProcessing = true;
				ctx.message = null;
				try {
					const res = await fetch(ctx.restUrl + 'frs-users/v1/onboarding/create-calendar', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': ctx.restNonce,
						},
						body: JSON.stringify({
							template: ctx.selectedTemplate,
						}),
					});
					const data = await res.json();
					if (!res.ok || !data.success) {
						throw new Error(data.message || 'Failed to create booking page');
					}
					ctx.bookingUrl = data.booking_url || '';
					ctx.calendarCreated = true;
					ctx.currentStep = 4;
				} catch (e) {
					ctx.message = { type: 'error', text: e.message || 'Failed to create booking page. Please try again.' };
				} finally {
					ctx.isProcessing = false;
				}
			}
		},

		prevStep() {
			const ctx = getContext();
			if (ctx.currentStep > 1) {
				ctx.currentStep--;
				ctx.message = null;
			}
		},

		skipCalendar() {
			const ctx = getContext();
			ctx.calendarSkipped = true;
			ctx.currentStep = 3;
		},

		connectOutlook() {
			const ctx = getContext();
			// Navigate to FluentBooking calendar settings page in admin
			// FluentBooking handles the OAuth flow from there
			window.location.href = ctx.adminUrl + 'admin.php?page=fluent-booking#/calendars/settings/calendar-connection';
		},

		async finishWizard() {
			const ctx = getContext();
			ctx.isProcessing = true;
			try {
				await fetch(ctx.restUrl + 'frs-users/v1/onboarding/complete', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
				});
			} catch (e) {
				// Non-fatal — still redirect
			}
			window.location.href = ctx.homeUrl;
		},

		copyBookingUrl() {
			const ctx = getContext();
			if (ctx.bookingUrl && navigator.clipboard) {
				navigator.clipboard.writeText(ctx.bookingUrl).then(() => {
					ctx.message = { type: 'success', text: 'Booking URL copied to clipboard!' };
					setTimeout(() => {
						ctx.message = null;
					}, 3000);
				});
			}
		},
	},

	callbacks: {
		onInit() {
			const ctx = getContext();

			// Check if returning from OAuth flow — poll calendar status
			const params = new URLSearchParams(window.location.search);
			if (params.has('calendar_connected') || params.has('oauth_return')) {
				ctx.currentStep = 2;
				actions.pollCalendarStatus();
			}
		},

		async pollCalendarStatus() {
			const ctx = getContext();
			try {
				const res = await fetch(ctx.restUrl + 'frs-users/v1/onboarding/calendar-status', {
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});
				const data = await res.json();
				if (data.connected) {
					ctx.calendarConnected = true;
				}
			} catch (e) {
				// Silently fail
			}
		},
	},
});

// Expose pollCalendarStatus as an action for the onInit callback
actions.pollCalendarStatus = callbacks.pollCalendarStatus;
