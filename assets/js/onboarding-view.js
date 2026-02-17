/**
 * Onboarding Wizard — Interactivity API Store
 *
 * Namespace: frs-users/onboarding
 *
 * @package FRSUsers
 * @since 3.3.0
 */

import { store, getContext } from '@wordpress/interactivity';

const TOTAL_STEPS = 4;

const { state, actions, callbacks } = store('frs-users/onboarding', {
	state: {
		// ── Progress ring ──────────────────────────────────
		get ringOffset() {
			const ctx = getContext();
			const pct = ctx.totalCount ? ctx.completedCount / ctx.totalCount : 0;
			return 97.4 * (1 - pct);
		},
		get progressLabel() {
			const ctx = getContext();
			return `${ctx.completedCount} of ${ctx.totalCount} tasks done`;
		},

		// ── Bar visibility ────────────────────────────────
		get barHidden() {
			const ctx = getContext();
			if (!ctx.needsOnboarding && !ctx.needsTour) return true;
			if (ctx.dismissed) return true;
			return false;
		},

		// ── Step checks ───────────────────────────────────
		get isStep1() { return getContext().currentStep === 1; },
		get isStep2() { return getContext().currentStep === 2; },
		get isStep3() { return getContext().currentStep === 3; },
		get isStep4() { return getContext().currentStep === 4; },

		get isStepDone1() { return getContext().currentStep > 1; },
		get isStepDone2() { return getContext().currentStep > 2; },
		get isStepDone3() { return getContext().currentStep > 3; },
		get isStepDone4() { return false; },

		get stepLabel() {
			return `Step ${getContext().currentStep} of ${TOTAL_STEPS}`;
		},
		get nextButtonLabel() {
			const ctx = getContext();
			if (ctx.isSaving) return 'Saving...';
			if (ctx.currentStep === TOTAL_STEPS) return 'Complete';
			return 'Next';
		},

		// ── Bio character count ───────────────────────────
		get bioCharCount() {
			const bio = getContext().biography || '';
			return `${bio.length} characters`;
		},

		// ── Pills checks ─────────────────────────────────
		get hasServiceAreas() {
			return (getContext().serviceAreas || []).length > 0;
		},
		get hasSpecialties() {
			return (getContext().specialties || []).length > 0;
		},

		// ── Social link indicator ────────────────────────
		get hasSocialLink() {
			const ctx = getContext();
			return !!(
				ctx.facebookUrl || ctx.instagramUrl || ctx.linkedinUrl ||
				ctx.twitterUrl || ctx.youtubeUrl || ctx.tiktokUrl
			);
		},

		// ── Success panel ────────────────────────────────
		get showSuccess() {
			return getContext()._showSuccess || false;
		},
	},

	actions: {
		// ── Modal controls ───────────────────────────────
		openModal() {
			getContext().modalOpen = true;
			actions.lockScroll(true);
		},
		closeModal() {
			getContext().modalOpen = false;
			actions.lockScroll(false);
		},
		backdropClick(event) {
			if (event.target === event.currentTarget) {
				actions.closeModal();
			}
		},
		modalClick(event) {
			event.stopPropagation();
		},

		lockScroll(lock) {
			try {
				if (typeof lenis !== 'undefined') {
					lock ? lenis.stop() : lenis.start();
				}
			} catch (e) {
				// Lenis not loaded — no-op.
			}
			document.body.style.overflow = lock ? 'hidden' : '';
		},

		// ── Title bar ────────────────────────────────────
		async dismissBar() {
			const ctx = getContext();
			ctx.dismissed = true;
			try {
				await fetch(`${ctx.restUrl}frs-users/v1/onboarding/dismiss`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});
			} catch (e) {
				// Silent — already hidden locally.
			}
		},

		// ── Step navigation ──────────────────────────────
		async nextStep() {
			const ctx = getContext();
			if (ctx.isSaving) return;

			// Save current step data.
			await actions.saveCurrentStep();

			if (ctx.currentStep < TOTAL_STEPS) {
				ctx.currentStep++;
				actions.persistStep(ctx.currentStep);
			} else {
				// Final step — complete onboarding.
				await actions.completeOnboarding();
			}
		},

		prevStep() {
			const ctx = getContext();
			if (ctx.currentStep > 1) {
				ctx.currentStep--;
				actions.persistStep(ctx.currentStep);
			}
		},

		async skipStep() {
			const ctx = getContext();
			if (ctx.currentStep < TOTAL_STEPS) {
				ctx.currentStep++;
				actions.persistStep(ctx.currentStep);
			} else {
				await actions.skipOnboarding();
			}
		},

		async persistStep(step) {
			const ctx = getContext();
			try {
				await fetch(`${ctx.restUrl}frs-users/v1/onboarding/step`, {
					method: 'PUT',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({ step }),
				});
			} catch (e) {
				// Silent.
			}
		},

		// ── Save step data ───────────────────────────────
		async saveCurrentStep() {
			const ctx = getContext();
			ctx.isSaving = true;
			try {
				const step = ctx.currentStep;

				// Upload headshot if a file was selected in step 1.
				if (step === 1 && ctx._headshotFile) {
					await actions.uploadHeadshot();
				}

				// Build profile payload based on step.
				const payload = {};

				if (step === 1) {
					if (ctx.phoneNumber) payload.phone_number = ctx.phoneNumber;
					if (ctx.jobTitle) payload.job_title = ctx.jobTitle;
					if (ctx.biography) payload.biography = ctx.biography;
				}
				if (step === 2) {
					if (ctx.isLoanOfficer) {
						if (ctx.nmlsNumber) payload.nmls = ctx.nmlsNumber;
						if (ctx.arriveUrl) payload.arrive_url = ctx.arriveUrl;
					}
					if (ctx.isAgent && ctx.dreLicense) {
						payload.dre_license = ctx.dreLicense;
					}
					if (ctx.serviceAreas?.length) payload.service_areas = ctx.serviceAreas;
					if (ctx.specialties?.length) {
						payload[ctx.isLoanOfficer ? 'specialties_lo' : 'specialties'] = ctx.specialties;
					}
				}
				if (step === 3) {
					payload.facebook_url = ctx.facebookUrl || '';
					payload.instagram_url = ctx.instagramUrl || '';
					payload.linkedin_url = ctx.linkedinUrl || '';
					payload.twitter_url = ctx.twitterUrl || '';
					payload.youtube_url = ctx.youtubeUrl || '';
					payload.tiktok_url = ctx.tiktokUrl || '';
				}

				// Step 4 has individual actions — no bulk save needed.
				if (step !== 4 && Object.keys(payload).length > 0) {
					await fetch(`${ctx.restUrl}frs-users/v1/profiles/${ctx.profileId}`, {
						method: 'PUT',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': ctx.restNonce,
						},
						body: JSON.stringify(payload),
					});
				}

				// Refresh completion count.
				await actions.refreshStatus();
			} catch (e) {
				console.error('Save failed:', e);
			} finally {
				ctx.isSaving = false;
			}
		},

		async refreshStatus() {
			const ctx = getContext();
			try {
				const res = await fetch(`${ctx.restUrl}frs-users/v1/onboarding/status`, {
					credentials: 'include',
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});
				if (res.ok) {
					const data = await res.json();
					ctx.completedCount = data.completed;
					ctx.totalCount = data.total;
				}
			} catch (e) {
				// Silent.
			}
		},

		// ── Headshot upload ──────────────────────────────
		triggerUpload(event) {
			const input = event.currentTarget.querySelector('input[type="file"]');
			if (input && event.target !== input) {
				input.click();
			}
		},

		dragOver(event) {
			event.preventDefault();
			event.currentTarget.classList.add('dragover');
		},

		dragLeave(event) {
			event.currentTarget.classList.remove('dragover');
		},

		dropFile(event) {
			event.preventDefault();
			event.currentTarget.classList.remove('dragover');
			const file = event.dataTransfer?.files?.[0];
			if (file && file.type.startsWith('image/')) {
				actions.previewFile(file);
			}
		},

		fileSelected(event) {
			const file = event.target.files?.[0];
			if (file) {
				actions.previewFile(file);
			}
		},

		previewFile(file) {
			const ctx = getContext();
			ctx._headshotFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				ctx.headshotUrl = e.target.result;
			};
			reader.readAsDataURL(file);
		},

		async uploadHeadshot() {
			const ctx = getContext();
			if (!ctx._headshotFile) return;

			const formData = new FormData();
			formData.append('file', ctx._headshotFile);

			const res = await fetch(`${ctx.restUrl}frs-users/v1/onboarding/upload-headshot`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'X-WP-Nonce': ctx.restNonce },
				body: formData,
			});

			const data = await res.json();
			if (data.success) {
				ctx.headshotUrl = data.url;
				ctx._headshotFile = null;
			}
		},

		// ── Field updates ────────────────────────────────
		updateField(event) {
			const { field } = event.target.dataset;
			if (field) {
				getContext()[field] = event.target.value;
			}
		},

		// ── Service areas pills ──────────────────────────
		addServiceArea() {
			const ctx = getContext();
			const val = (ctx.newServiceArea || '').trim();
			if (val && !ctx.serviceAreas.includes(val)) {
				ctx.serviceAreas = [...ctx.serviceAreas, val];
			}
			ctx.newServiceArea = '';
		},
		addServiceAreaOnEnter(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				actions.addServiceArea();
			}
		},
		removeServiceArea() {
			const ctx = getContext();
			const item = ctx.item; // from data-wp-each
			ctx.serviceAreas = ctx.serviceAreas.filter(a => a !== item);
		},

		// ── Specialties pills ────────────────────────────
		addSpecialty() {
			const ctx = getContext();
			const val = (ctx.newSpecialty || '').trim();
			if (val && !ctx.specialties.includes(val)) {
				ctx.specialties = [...ctx.specialties, val];
			}
			ctx.newSpecialty = '';
		},
		addSpecialtyOnEnter(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				actions.addSpecialty();
			}
		},
		removeSpecialty() {
			const ctx = getContext();
			const item = ctx.item; // from data-wp-each
			ctx.specialties = ctx.specialties.filter(s => s !== item);
		},

		// ── Integration actions ──────────────────────────
		async connectCalendar() {
			const ctx = getContext();
			ctx.calendarLoading = true;
			ctx.loaderActive = true;
			ctx.loaderSteps = [
				{ label: 'Authenticating with Microsoft...', done: false, active: true },
				{ label: 'Fetching your calendars...', done: false, active: false },
				{ label: 'Connecting calendar...', done: false, active: false },
				{ label: 'Finalizing setup...', done: false, active: false },
			];

			// Animate loader steps.
			const advanceLoader = async (index) => {
				await new Promise(r => setTimeout(r, 800));
				if (index < ctx.loaderSteps.length) {
					ctx.loaderSteps = ctx.loaderSteps.map((s, i) => ({
						...s,
						done: i < index,
						active: i === index,
					}));
				}
			};

			try {
				await advanceLoader(1);
				await advanceLoader(2);

				const res = await fetch(`${ctx.restUrl}frs-users/v1/calendar/provision`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
				});

				const data = await res.json();
				await advanceLoader(3);

				if (res.ok && data.success) {
					// All done.
					ctx.loaderSteps = ctx.loaderSteps.map(s => ({ ...s, done: true, active: false }));
					await new Promise(r => setTimeout(r, 600));
					ctx.calendarConnected = true;
				} else {
					ctx.message = { type: 'error', text: data.message || 'Failed to connect calendar.' };
				}
			} catch (e) {
				ctx.message = { type: 'error', text: 'Calendar connection failed.' };
			} finally {
				ctx.calendarLoading = false;
				ctx.loaderActive = false;
			}
		},

		async connectFub() {
			const ctx = getContext();
			if (!ctx.fubApiKey?.trim()) return;

			ctx.isSaving = true;
			try {
				const res = await fetch(`${ctx.restUrl}frs-users/v1/profiles/me/integrations/followupboss`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': ctx.restNonce,
					},
					body: JSON.stringify({ api_key: ctx.fubApiKey }),
				});

				const data = await res.json();
				if (res.ok && data.success) {
					ctx.fubConnected = true;
					ctx.fubApiKey = '';
				} else {
					ctx.message = { type: 'error', text: data.message || 'Failed to connect FUB.' };
				}
			} catch (e) {
				ctx.message = { type: 'error', text: 'Connection failed.' };
			} finally {
				ctx.isSaving = false;
			}
		},

		// ── Completion ───────────────────────────────────
		async completeOnboarding() {
			const ctx = getContext();
			ctx.isSaving = true;
			try {
				// Save step 4 doesn't need a bulk profile save.
				await fetch(`${ctx.restUrl}frs-users/v1/onboarding/complete`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});

				ctx.needsOnboarding = false;
				ctx._showSuccess = true;

				// Brief pause to show success, then close and start tour.
				await new Promise(r => setTimeout(r, 1800));
				ctx._showSuccess = false;
				actions.closeModal();

				// Start Intro.js tour if available.
				if (ctx.needsTour) {
					setTimeout(() => actions.startTour(), 400);
				}
			} catch (e) {
				console.error('Complete failed:', e);
			} finally {
				ctx.isSaving = false;
			}
		},

		async skipOnboarding() {
			const ctx = getContext();
			ctx.isSaving = true;
			try {
				await fetch(`${ctx.restUrl}frs-users/v1/onboarding/skip`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});
				ctx.needsOnboarding = false;
				actions.closeModal();

				if (ctx.needsTour) {
					setTimeout(() => actions.startTour(), 400);
				}
			} catch (e) {
				console.error('Skip failed:', e);
			} finally {
				ctx.isSaving = false;
			}
		},

		// ── Intro.js tour ────────────────────────────────
		startTour() {
			const ctx = getContext();
			if (typeof introJs === 'undefined') {
				// Intro.js not loaded — mark tour complete anyway.
				actions.completeTour();
				return;
			}

			const tourSteps = (ctx.tourSteps || []).map(s => ({
				element: document.querySelector(s.element),
				title: s.title,
				intro: s.intro,
				position: s.position || 'bottom',
			})).filter(s => s.element);

			if (!tourSteps.length) {
				actions.completeTour();
				return;
			}

			introJs().setOptions({
				steps: tourSteps,
				showStepNumbers: false,
				showBullets: true,
				exitOnOverlayClick: true,
				doneLabel: 'Got it!',
				nextLabel: 'Next',
				prevLabel: 'Back',
			}).oncomplete(() => {
				actions.completeTour();
			}).onexit(() => {
				actions.completeTour();
			}).start();
		},

		async completeTour() {
			const ctx = getContext();
			ctx.needsTour = false;
			try {
				await fetch(`${ctx.restUrl}frs-users/v1/onboarding/tour-complete`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'X-WP-Nonce': ctx.restNonce },
				});
			} catch (e) {
				// Silent.
			}
		},
	},

	callbacks: {
		onInit() {
			const ctx = getContext();

			// If modal was force-opened via query param, lock scroll.
			if (ctx.modalOpen) {
				actions.lockScroll(true);
			}
		},
	},
});
