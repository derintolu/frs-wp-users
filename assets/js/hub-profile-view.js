/**
 * Hub Profile - Interactivity API Store
 *
 * Handles tab switching, checklist toggling, and admin task CRUD
 * for the hub profile page.
 *
 * @package FRSUsers
 * @since 3.1.0
 */

import { store, getContext } from '@wordpress/interactivity';

const { state } = store('frs-users/hub-profile', {
	state: {
		get isPublicTab() {
			return getContext().activeTab === 'public';
		},
		get isInternalTab() {
			return getContext().activeTab === 'internal';
		},
		get completionPercent() {
			const ctx = getContext();
			const tasks = ctx.tasks || [];
			if (!tasks.length) return 0;
			const done = tasks.filter((t) => t.is_completed).length;
			return Math.round((done / tasks.length) * 100);
		},
		get completionText() {
			const ctx = getContext();
			const tasks = ctx.tasks || [];
			const done = tasks.filter((t) => t.is_completed).length;
			return `${done} of ${tasks.length} complete`;
		},
		get autoTasks() {
			const ctx = getContext();
			return (ctx.tasks || []).filter((t) => t.type === 'auto');
		},
		get adminTasks() {
			const ctx = getContext();
			return (ctx.tasks || []).filter((t) => t.type === 'admin');
		},
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
		setTab(event) {
			const tab = event.target.closest('[data-tab]')?.dataset.tab;
			if (tab) {
				getContext().activeTab = tab;
				getContext().message = null;
			}
		},

		async toggleTask(event) {
			const ctx = getContext();
			const key = event.target.closest('[data-task-key]')?.dataset.taskKey;
			if (!key) return;

			const task = ctx.tasks.find((t) => t.key === key);
			if (!task) return;

			// Auto tasks can't be toggled via API — they reflect field state
			if (task.type === 'auto') return;

			const newCompleted = !task.is_completed;

			try {
				const response = await fetch(
					`${ctx.restBase}/profiles/${ctx.userId}/tasks/${task.id}`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': ctx.restNonce,
						},
						body: JSON.stringify({ is_completed: newCompleted }),
					},
				);

				if (!response.ok) throw new Error('Failed to update');

				const updated = await response.json();
				const idx = ctx.tasks.findIndex((t) => t.key === key);
				if (idx !== -1) {
					ctx.tasks[idx] = { ...ctx.tasks[idx], ...updated };
				}
			} catch (e) {
				ctx.message = { type: 'error', text: 'Failed to update task' };
			}
		},

		showAddTask() {
			const ctx = getContext();
			ctx.showAddForm = true;
			ctx.newTaskTitle = '';
			ctx.newTaskDueDate = '';
		},

		hideAddTask() {
			getContext().showAddForm = false;
		},

		updateTaskField(event) {
			const { field } = event.target.dataset;
			if (field) {
				getContext()[field] = event.target.value;
			}
		},

		async createTask() {
			const ctx = getContext();
			const title = ctx.newTaskTitle?.trim();
			if (!title) return;

			try {
				const response = await fetch(
					`${ctx.restBase}/profiles/${ctx.userId}/tasks`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': ctx.restNonce,
						},
						body: JSON.stringify({
							title,
							due_date: ctx.newTaskDueDate || null,
						}),
					},
				);

				if (!response.ok) throw new Error('Failed to create');

				const task = await response.json();
				ctx.tasks = [...ctx.tasks, task];
				ctx.showAddForm = false;
				ctx.newTaskTitle = '';
				ctx.newTaskDueDate = '';
				ctx.message = { type: 'success', text: 'Task added' };
				setTimeout(() => {
					ctx.message = null;
				}, 3000);
			} catch (e) {
				ctx.message = { type: 'error', text: 'Failed to create task' };
			}
		},

		async deleteTask(event) {
			const ctx = getContext();
			const key = event.target.closest('[data-task-key]')?.dataset.taskKey;
			if (!key) return;

			const task = ctx.tasks.find((t) => t.key === key);
			if (!task || task.type !== 'admin') return;

			try {
				const response = await fetch(
					`${ctx.restBase}/profiles/${ctx.userId}/tasks/${task.id}`,
					{
						method: 'DELETE',
						headers: {
							'X-WP-Nonce': ctx.restNonce,
						},
					},
				);

				if (!response.ok) throw new Error('Failed to delete');

				ctx.tasks = ctx.tasks.filter((t) => t.key !== key);
				ctx.message = { type: 'success', text: 'Task removed' };
				setTimeout(() => {
					ctx.message = null;
				}, 3000);
			} catch (e) {
				ctx.message = { type: 'error', text: 'Failed to delete task' };
			}
		},
	},

	callbacks: {
		async onInit() {
			const ctx = getContext();
			if (!ctx.userId) return;

			try {
				const response = await fetch(
					`${ctx.restBase}/profiles/${ctx.userId}/tasks`,
					{
						headers: {
							'X-WP-Nonce': ctx.restNonce,
						},
					},
				);

				if (response.ok) {
					ctx.tasks = await response.json();
				}
			} catch (e) {
				// Silently fail — tasks section will show empty
			} finally {
				ctx.tasksLoading = false;
			}
		},
	},
});
