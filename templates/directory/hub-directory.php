<?php
/**
 * Hub Employee Directory Template
 *
 * Renders the toolbar, alphabet bar, card grid, and load-more button.
 * JavaScript (hub-directory.js) handles fetching and rendering.
 *
 * @package FRSUsers
 */

defined( 'ABSPATH' ) || exit;

$active_roles = \FRSUsers\Core\Roles::get_active_company_roles();
?>
<div class="frs-directory" id="frs-directory">

	<div class="frs-directory__toolbar">
		<div class="frs-directory__search-wrap">
			<svg class="frs-directory__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
			<input
				type="text"
				class="frs-directory__search"
				id="frs-directory-search"
				placeholder="<?php esc_attr_e( 'Search people...', 'frs-users' ); ?>"
			/>
		</div>

		<select class="frs-directory__filter-role" id="frs-directory-role">
			<option value=""><?php esc_html_e( 'All Roles', 'frs-users' ); ?></option>
			<?php foreach ( $active_roles as $slug => $label ) : ?>
				<option value="<?php echo esc_attr( $slug ); ?>">
					<?php echo esc_html( $label ); ?>
				</option>
			<?php endforeach; ?>
		</select>

		<select class="frs-directory__sort" id="frs-directory-sort">
			<option value="last_name"><?php esc_html_e( 'Last Name', 'frs-users' ); ?></option>
			<option value="first_name"><?php esc_html_e( 'First Name', 'frs-users' ); ?></option>
			<option value="display_name"><?php esc_html_e( 'Display Name', 'frs-users' ); ?></option>
		</select>

		<div class="frs-directory__view-toggle">
			<button type="button" class="frs-directory__view-btn is-active" data-view="grid" aria-label="<?php esc_attr_e( 'Grid view', 'frs-users' ); ?>">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
			</button>
			<button type="button" class="frs-directory__view-btn" data-view="list" aria-label="<?php esc_attr_e( 'List view', 'frs-users' ); ?>">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10.5" width="18" height="3" rx="1"/><rect x="3" y="17" width="18" height="3" rx="1"/></svg>
			</button>
		</div>
	</div>

	<div class="frs-directory__alphabet" id="frs-directory-alphabet">
		<button type="button" class="frs-directory__letter is-active" data-letter="">
			<?php esc_html_e( 'ALL', 'frs-users' ); ?>
		</button>
		<?php foreach ( range( 'A', 'Z' ) as $char ) : ?>
			<button type="button" class="frs-directory__letter" data-letter="<?php echo esc_attr( $char ); ?>">
				<?php echo esc_html( $char ); ?>
			</button>
		<?php endforeach; ?>
	</div>

	<div class="frs-directory__count" id="frs-directory-count"></div>

	<div class="frs-directory__grid" id="frs-directory-grid"></div>

	<div class="frs-directory__empty" id="frs-directory-empty" hidden>
		<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
		<p><?php esc_html_e( 'No people found matching your filters.', 'frs-users' ); ?></p>
	</div>

	<div class="frs-directory__loading" id="frs-directory-loading" hidden>
		<div class="frs-directory__spinner"></div>
	</div>

	<div class="frs-directory__load-more" id="frs-directory-load-more" hidden>
		<button type="button" class="frs-directory__load-more-btn" id="frs-directory-load-more-btn">
			<?php esc_html_e( 'Load More', 'frs-users' ); ?>
		</button>
	</div>

</div>

<style>
/* ── Hub Directory ─────────────────────────────────────────── */
.frs-directory {
	max-width: 1400px;
	margin: 0 auto;
	padding: 0 1rem;
	font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Toolbar */
.frs-directory__toolbar {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
	margin-bottom: 1rem;
}

.frs-directory__search-wrap {
	position: relative;
	flex: 1 1 260px;
	min-width: 200px;
}

.frs-directory__search-icon {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: #94a3b8;
	pointer-events: none;
}

.frs-directory__search {
	width: 100%;
	padding: 10px 12px 10px 56px;
	border: 1px solid #e2e8f0;
	border-radius: 5px;
	font-size: 14px;
	background: #fff;
	transition: border-color 0.15s;
}

.frs-directory__search:focus {
	outline: none;
	border-color: var(--frs-blue, #2563eb);
	box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.frs-directory__filter-role,
.frs-directory__sort {
	padding: 10px 12px;
	border: 1px solid #e2e8f0;
	border-radius: 5px;
	font-size: 14px;
	background: #fff;
	cursor: pointer;
	min-width: 140px;
}

.frs-directory__filter-role:focus,
.frs-directory__sort:focus {
	outline: none;
	border-color: var(--frs-blue, #2563eb);
}

.frs-directory__view-toggle {
	display: flex;
	gap: 0;
	border: 1px solid #e2e8f0;
	border-radius: 5px;
	overflow: hidden;
}

.frs-directory__view-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	background: #fff;
	color: #94a3b8;
	cursor: pointer;
	transition: all 0.15s;
}

.frs-directory__view-btn + .frs-directory__view-btn {
	border-left: 1px solid #e2e8f0;
}

.frs-directory__view-btn.is-active {
	background: var(--frs-blue, #2563eb);
	color: #fff;
}

.frs-directory__view-btn:hover:not(.is-active) {
	background: #f8fafc;
	color: #64748b;
}

/* Alphabet bar */
.frs-directory__alphabet {
	display: flex;
	flex-wrap: nowrap;
	gap: 2px;
	padding: 0.5rem 0;
	margin-bottom: 0.75rem;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	scrollbar-width: thin;
}

.frs-directory__letter {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 36px;
	height: 36px;
	padding: 0 6px;
	border: 1px solid transparent;
	border-radius: 5px;
	background: none;
	color: #64748b;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s;
}

.frs-directory__letter:hover {
	background: #f1f5f9;
	color: #334155;
}

.frs-directory__letter.is-active {
	background: var(--frs-blue, #2563eb);
	color: #fff;
	border-color: var(--frs-blue, #2563eb);
}

/* Count */
.frs-directory__count {
	font-size: 13px;
	color: #64748b;
	margin-bottom: 1rem;
}

/* Grid view */
.frs-directory__grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 1rem;
}

.frs-directory__grid.is-list {
	grid-template-columns: 1fr;
	gap: 0;
}

/* Card */
.frs-directory__card {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 5px;
	text-align: center;
	padding: 1.5rem 1rem 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	transition: box-shadow 0.15s, transform 0.15s;
}

.frs-directory__card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

.frs-directory__card-avatar {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	object-fit: cover;
	margin-bottom: 0.75rem;
	background: #f1f5f9;
}

.frs-directory__card-name {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	margin: 0 0 0.25rem;
	line-height: 1.3;
}

.frs-directory__card-name a {
	color: inherit;
	text-decoration: none;
}

.frs-directory__card-name a:hover {
	color: var(--frs-blue, #2563eb);
}

.frs-directory__card-title {
	font-size: 13px;
	color: #64748b;
	margin: 0 0 0.5rem;
	line-height: 1.3;
}

.frs-directory__card-contact {
	font-size: 12px;
	color: #64748b;
	margin: 0 0 0.25rem;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.frs-directory__card-contact a {
	color: #64748b;
	text-decoration: none;
}

.frs-directory__card-contact a:hover {
	color: var(--frs-blue, #2563eb);
}

.frs-directory__card-meta {
	font-size: 12px;
	color: #94a3b8;
	margin: 0 0 0.75rem;
}

.frs-directory__card-actions {
	display: flex;
	width: calc(100% + 2rem);
	margin: auto 0 0;
	border-top: 1px solid #e2e8f0;
}

.frs-directory__card-action {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 10px 0;
	color: #64748b;
	text-decoration: none;
	transition: color 0.15s, background 0.15s;
	border: none;
	background: none;
	cursor: pointer;
	font-size: 14px;
}

.frs-directory__card-action + .frs-directory__card-action {
	border-left: 1px solid #e2e8f0;
}

.frs-directory__card-action:hover {
	color: var(--frs-blue, #2563eb);
	background: #f8fafc;
}

/* List view card overrides */
.frs-directory__grid.is-list .frs-directory__card {
	flex-direction: row;
	text-align: left;
	padding: 0.75rem 1rem;
	border-radius: 0;
	gap: 1rem;
}

.frs-directory__grid.is-list .frs-directory__card + .frs-directory__card {
	border-top: none;
}

.frs-directory__grid.is-list .frs-directory__card:first-child {
	border-radius: 5px 5px 0 0;
}

.frs-directory__grid.is-list .frs-directory__card:last-child {
	border-radius: 0 0 5px 5px;
}

.frs-directory__grid.is-list .frs-directory__card:only-child {
	border-radius: 5px;
}

.frs-directory__grid.is-list .frs-directory__card:hover {
	transform: none;
	box-shadow: none;
	background: #f8fafc;
}

.frs-directory__grid.is-list .frs-directory__card-avatar {
	width: 48px;
	height: 48px;
	margin-bottom: 0;
	flex-shrink: 0;
}

.frs-directory__grid.is-list .frs-directory__card-info {
	flex: 1;
	min-width: 0;
}

.frs-directory__grid.is-list .frs-directory__card-actions {
	width: auto;
	border-top: none;
	margin: 0;
	flex-shrink: 0;
	gap: 4px;
}

.frs-directory__grid.is-list .frs-directory__card-action + .frs-directory__card-action {
	border-left: none;
}

.frs-directory__grid.is-list .frs-directory__card-action {
	width: 36px;
	height: 36px;
	padding: 0;
	border-radius: 5px;
}

.frs-directory__grid.is-list .frs-directory__card-action:hover {
	background: #e2e8f0;
}

/* Empty state */
.frs-directory__empty {
	text-align: center;
	padding: 3rem 1rem;
	color: #94a3b8;
}

.frs-directory__empty svg {
	margin-bottom: 1rem;
}

.frs-directory__empty p {
	font-size: 15px;
	margin: 0;
}

/* Loading */
.frs-directory__loading {
	display: flex;
	justify-content: center;
	padding: 2rem;
}

.frs-directory__spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e2e8f0;
	border-top-color: var(--frs-blue, #2563eb);
	border-radius: 50%;
	animation: frs-spin 0.6s linear infinite;
}

@keyframes frs-spin {
	to { transform: rotate(360deg); }
}

/* Load more */
.frs-directory__load-more {
	text-align: center;
	padding: 2rem 0;
}

.frs-directory__load-more-btn {
	display: inline-block;
	padding: 10px 32px;
	background: linear-gradient(135deg, var(--frs-blue, #2563eb), var(--frs-cyan, #2dd4da));
	color: #fff;
	border: none;
	border-radius: 5px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.15s;
}

.frs-directory__load-more-btn:hover {
	opacity: 0.9;
}

.frs-directory__load-more-btn:disabled {
	opacity: 0.5;
	cursor: default;
}

/* Responsive */
@media (max-width: 1200px) {
	.frs-directory__grid {
		grid-template-columns: repeat(4, 1fr);
	}
}

@media (max-width: 900px) {
	.frs-directory__grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (max-width: 640px) {
	.frs-directory__grid {
		grid-template-columns: repeat(2, 1fr);
	}

	.frs-directory__toolbar {
		flex-direction: column;
		align-items: stretch;
	}

	.frs-directory__search-wrap {
		flex: 1 1 100%;
	}

	.frs-directory__filter-role,
	.frs-directory__sort {
		width: 100%;
	}

	.frs-directory__card {
		padding: 1rem 0.75rem 0;
	}

	.frs-directory__card-avatar {
		width: 60px;
		height: 60px;
	}

	.frs-directory__card-name {
		font-size: 13px;
	}
}
</style>
