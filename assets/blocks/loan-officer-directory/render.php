<?php
/**
 * Loan Officer Directory Block - Dynamic Render
 *
 * Displays a filterable grid of loan officers with state dropdown filter.
 *
 * @package LendingResourceHub
 */

// Get block attributes
$show_filters = $attributes['showFilters'] ?? true;
$posts_per_page = $attributes['postsPerPage'] ?? 12;

// Query all loan officers
$args = array(
	'role'    => 'loan_officer',
	'orderby' => 'display_name',
	'order'   => 'ASC',
	'number'  => $posts_per_page,
);

$loan_officers = get_users( $args );

// Collect unique states from all loan officers
$all_states = array();
foreach ( $loan_officers as $officer ) {
	$location = get_user_meta( $officer->ID, 'location', true );
	if ( $location ) {
		// Extract state from location (assumes format like "City, ST")
		$parts = explode( ',', $location );
		if ( count( $parts ) >= 2 ) {
			$state = trim( end( $parts ) );
			if ( ! empty( $state ) && ! in_array( $state, $all_states ) ) {
				$all_states[] = $state;
			}
		}
	}
}
sort( $all_states );

// Generate unique block ID
$block_id = 'lrh-lo-directory-' . uniqid();
?>

<div id="<?php echo esc_attr( $block_id ); ?>" class="lrh-lo-directory">
	<style>
		#<?php echo esc_attr( $block_id ); ?> {
			max-width: 1200px;
			margin: 0 auto;
			padding: 40px 20px;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-directory-header {
			margin-bottom: 30px;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-directory-title {
			font-size: clamp(1.8rem, 4vw, 2.5rem);
			font-weight: 700;
			margin: 0 0 20px 0;
			color: #1e293b;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-directory-filters {
			display: flex;
			gap: 15px;
			margin-bottom: 30px;
			flex-wrap: wrap;
			align-items: center;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-filter-label {
			font-weight: 600;
			color: #64748b;
			font-size: 0.95rem;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-state-select {
			padding: 10px 40px 10px 15px;
			font-size: 1rem;
			border: 2px solid #e2e8f0;
			border-radius: 8px;
			background: white;
			color: #334155;
			cursor: pointer;
			transition: all 0.2s;
			min-width: 200px;
			appearance: none;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23334155' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right 15px center;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-state-select:hover {
			border-color: #0a6ff9;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-state-select:focus {
			outline: none;
			border-color: #0a6ff9;
			box-shadow: 0 0 0 3px rgba(10, 111, 249, 0.1);
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-directory-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: 25px;
			margin-bottom: 20px;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-card {
			background: white;
			border: 1px solid #e2e8f0;
			border-radius: 12px;
			padding: 25px;
			transition: all 0.3s ease;
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-card:hover {
			transform: translateY(-4px);
			box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
			border-color: #0a6ff9;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-card[style*="display: none"] {
			display: none !important;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-avatar {
			width: 120px;
			height: 120px;
			border-radius: 50%;
			overflow: hidden;
			margin-bottom: 15px;
			border: 3px solid #e2e8f0;
			background: #f1f5f9;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-avatar img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-name {
			font-size: 1.25rem;
			font-weight: 700;
			margin: 0 0 8px 0;
			color: #1e293b;
			background: linear-gradient(135deg, #0a6ff9, #00a1ff);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-title {
			font-size: 0.9rem;
			font-weight: 600;
			color: #64748b;
			margin: 0 0 8px 0;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-company {
			font-size: 0.85rem;
			color: #94a3b8;
			margin: 0 0 8px 0;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-location {
			font-size: 0.85rem;
			color: #64748b;
			margin: 0 0 15px 0;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 5px;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-officer-contact {
			display: flex;
			gap: 10px;
			margin-top: auto;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-contact-btn {
			padding: 8px 16px;
			border-radius: 6px;
			text-decoration: none;
			font-size: 0.85rem;
			font-weight: 600;
			transition: all 0.2s;
			display: inline-flex;
			align-items: center;
			gap: 5px;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-contact-btn-primary {
			background: #0a6ff9;
			color: white;
			border: none;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-contact-btn-primary:hover {
			background: #0856c7;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-contact-btn-secondary {
			background: white;
			color: #0a6ff9;
			border: 1px solid #0a6ff9;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-contact-btn-secondary:hover {
			background: #f1f5f9;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-no-results {
			text-align: center;
			padding: 60px 20px;
			color: #64748b;
			font-size: 1.1rem;
		}

		#<?php echo esc_attr( $block_id ); ?> .lrh-no-results-title {
			font-size: 1.5rem;
			font-weight: 700;
			margin: 0 0 10px 0;
			color: #1e293b;
		}

		@media (max-width: 768px) {
			#<?php echo esc_attr( $block_id ); ?> .lrh-directory-grid {
				grid-template-columns: 1fr;
			}
		}
	</style>

	<div class="lrh-directory-header">
		<h2 class="lrh-directory-title">Our Loan Officers</h2>

		<?php if ( $show_filters && ! empty( $all_states ) ) : ?>
		<div class="lrh-directory-filters">
			<label for="<?php echo esc_attr( $block_id ); ?>-state" class="lrh-filter-label">
				Filter by State:
			</label>
			<select
				id="<?php echo esc_attr( $block_id ); ?>-state"
				class="lrh-state-select"
				data-directory-id="<?php echo esc_attr( $block_id ); ?>"
			>
				<option value="">All States</option>
				<?php foreach ( $all_states as $state ) : ?>
					<option value="<?php echo esc_attr( $state ); ?>">
						<?php echo esc_html( $state ); ?>
					</option>
				<?php endforeach; ?>
			</select>
		</div>
		<?php endif; ?>
	</div>

	<div class="lrh-directory-grid">
		<?php if ( empty( $loan_officers ) ) : ?>
			<div class="lrh-no-results">
				<div class="lrh-no-results-title">No Loan Officers Found</div>
				<p>Please check back later or contact us for assistance.</p>
			</div>
		<?php else : ?>
			<?php foreach ( $loan_officers as $officer ) : ?>
				<?php
				$name = $officer->display_name;
				$job_title = get_user_meta( $officer->ID, 'title', true ) ?: get_user_meta( $officer->ID, 'job_title', true );
				$company = get_user_meta( $officer->ID, 'company', true );
				$phone = get_user_meta( $officer->ID, 'phone', true ) ?: get_user_meta( $officer->ID, 'phone_number', true );
				$email = $officer->user_email;
				$location = get_user_meta( $officer->ID, 'location', true );
				$avatar_url = get_avatar_url( $officer->ID, array( 'size' => 200 ) );

				// Extract state for filtering
				$state = '';
				if ( $location ) {
					$parts = explode( ',', $location );
					if ( count( $parts ) >= 2 ) {
						$state = trim( end( $parts ) );
					}
				}
				?>
				<div
					class="lrh-officer-card"
					data-state="<?php echo esc_attr( $state ); ?>"
				>
					<div class="lrh-officer-avatar">
						<img src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $name ); ?>" />
					</div>

					<h3 class="lrh-officer-name"><?php echo esc_html( $name ); ?></h3>

					<?php if ( $job_title ) : ?>
						<div class="lrh-officer-title"><?php echo esc_html( $job_title ); ?></div>
					<?php endif; ?>

					<?php if ( $company ) : ?>
						<div class="lrh-officer-company"><?php echo esc_html( $company ); ?></div>
					<?php endif; ?>

					<?php if ( $location ) : ?>
						<div class="lrh-officer-location">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
							</svg>
							<?php echo esc_html( $location ); ?>
						</div>
					<?php endif; ?>

					<div class="lrh-officer-contact">
						<?php if ( $email ) : ?>
							<a href="mailto:<?php echo esc_attr( $email ); ?>" class="lrh-contact-btn lrh-contact-btn-primary">
								Email
							</a>
						<?php endif; ?>

						<?php if ( $phone ) : ?>
							<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" class="lrh-contact-btn lrh-contact-btn-secondary">
								Call
							</a>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		<?php endif; ?>
	</div>

	<div id="<?php echo esc_attr( $block_id ); ?>-no-results" class="lrh-no-results" style="display: none;">
		<div class="lrh-no-results-title">No Loan Officers Found</div>
		<p>No loan officers found in the selected state. Please try another state or contact us at <a href="mailto:hello@21stcenturylending.com">hello@21stcenturylending.com</a> for assistance.</p>
	</div>

	<script>
	(function() {
		const blockId = '<?php echo esc_js( $block_id ); ?>';
		const select = document.querySelector('#' + blockId + '-state');

		if (!select) return;

		select.addEventListener('change', function() {
			const selectedState = this.value;
			const cards = document.querySelectorAll('#' + blockId + ' .lrh-officer-card');
			const noResults = document.querySelector('#' + blockId + '-no-results');
			let visibleCount = 0;

			cards.forEach(function(card) {
				const cardState = card.getAttribute('data-state');

				if (selectedState === '' || cardState === selectedState) {
					card.style.display = '';
					visibleCount++;
				} else {
					card.style.display = 'none';
				}
			});

			// Show/hide no results message
			if (visibleCount === 0) {
				noResults.style.display = 'block';
			} else {
				noResults.style.display = 'none';
			}
		});
	})();
	</script>
</div>
