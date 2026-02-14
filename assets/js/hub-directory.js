/**
 * Hub Employee Directory
 *
 * Vanilla JS — fetches from /frs-users/v1/profiles, renders cards,
 * handles search, alphabet filter, role filter, sort, view toggle,
 * and load-more pagination.
 */
( function () {
	'use strict';

	/* ── Config from wp_localize_script ─────────────────────── */
	var cfg = window.frsDirectory || {};
	var REST  = cfg.restUrl || '/wp-json/frs-users/v1/';
	var NONCE = cfg.nonce   || '';

	/* ── State ──────────────────────────────────────────────── */
	var state = {
		profiles:   [],
		page:       1,
		totalPages: 1,
		total:      0,
		search:     '',
		letter:     '',
		role:       '',
		orderby:    'last_name',
		order:      'asc',
		view:       'grid',
		loading:    false,
		perPage:    48,
	};

	/* ── DOM refs ───────────────────────────────────────────── */
	var $grid      = document.getElementById( 'frs-directory-grid' );
	var $empty     = document.getElementById( 'frs-directory-empty' );
	var $loading   = document.getElementById( 'frs-directory-loading' );
	var $loadMore  = document.getElementById( 'frs-directory-load-more' );
	var $loadBtn   = document.getElementById( 'frs-directory-load-more-btn' );
	var $count     = document.getElementById( 'frs-directory-count' );
	var $search    = document.getElementById( 'frs-directory-search' );
	var $role      = document.getElementById( 'frs-directory-role' );
	var $sort      = document.getElementById( 'frs-directory-sort' );
	var $alphabet  = document.getElementById( 'frs-directory-alphabet' );

	/* ── Helpers ────────────────────────────────────────────── */
	function esc( str ) {
		var el = document.createElement( 'span' );
		el.textContent = str;
		return el.innerHTML;
	}

	function initials( first, last ) {
		var f = ( first || '' ).charAt( 0 ).toUpperCase();
		var l = ( last || '' ).charAt( 0 ).toUpperCase();
		return f + l || '?';
	}

	/* ── Fetch ──────────────────────────────────────────────── */
	function fetchProfiles( append ) {
		if ( state.loading ) return;
		state.loading = true;

		if ( ! append ) {
			$grid.innerHTML = '';
			state.profiles  = [];
			state.page      = 1;
		}

		showLoading( true );
		showEmpty( false );

		var url = REST + 'profiles?per_page=' + state.perPage + '&page=' + state.page;
		url += '&orderby=' + encodeURIComponent( state.orderby );
		url += '&order='   + encodeURIComponent( state.order );

		if ( state.search ) url += '&search=' + encodeURIComponent( state.search );
		if ( state.letter ) url += '&letter='  + encodeURIComponent( state.letter );
		if ( state.role )   url += '&company_role=' + encodeURIComponent( state.role );

		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );
		if ( NONCE ) xhr.setRequestHeader( 'X-WP-Nonce', NONCE );

		xhr.onload = function () {
			state.loading = false;
			showLoading( false );

			if ( xhr.status !== 200 ) {
				showEmpty( true );
				showLoadMore( false );
				updateCount( 0 );
				return;
			}

			var json = JSON.parse( xhr.responseText );
			var data = json.data || [];

			state.total      = json.total || 0;
			state.totalPages = json.pages || 1;

			if ( append ) {
				state.profiles = state.profiles.concat( data );
			} else {
				state.profiles = data;
			}

			renderCards( data, append );
			updateCount( state.total );
			showEmpty( state.profiles.length === 0 );
			showLoadMore( state.page < state.totalPages );
		};

		xhr.onerror = function () {
			state.loading = false;
			showLoading( false );
			showEmpty( true );
			showLoadMore( false );
		};

		xhr.send();
	}

	/* ── Render ─────────────────────────────────────────────── */
	function renderCards( profiles, append ) {
		var html = '';
		for ( var i = 0; i < profiles.length; i++ ) {
			html += renderCard( profiles[i] );
		}

		if ( append ) {
			$grid.insertAdjacentHTML( 'beforeend', html );
		} else {
			$grid.innerHTML = html;
		}
	}

	function renderCard( p ) {
		var avatar = p.avatar_url || p.headshot_url || '';
		var name   = esc( p.display_name || ( ( p.first_name || '' ) + ' ' + ( p.last_name || '' ) ).trim() );
		var title  = esc( p.job_title || '' );
		var email  = p.email || '';
		var phone  = p.phone_number || p.mobile_number || '';
		var office = esc( p.office || '' );
		var city   = esc( p.city_state || '' );
		var url    = p.profile_url || '';

		var nameHtml = url
			? '<a href="' + esc( url ) + '">' + name + '</a>'
			: name;

		var meta = [];
		if ( office ) meta.push( office );
		if ( city )   meta.push( city );

		var actions = '';

		if ( phone ) {
			var cleanPhone = phone.replace( /[^\d+]/g, '' );
			actions += '<a class="frs-directory__card-action" href="tel:' + esc( cleanPhone ) + '" title="Call">'
				+ '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'
				+ '</a>';
		}

		if ( email ) {
			actions += '<a class="frs-directory__card-action" href="mailto:' + esc( email ) + '" title="Email">'
				+ '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
				+ '</a>';
		}

		if ( url ) {
			actions += '<a class="frs-directory__card-action" href="' + esc( url ) + '" title="Profile">'
				+ '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
				+ '</a>';
		}

		return '<div class="frs-directory__card">'
			+ '<img class="frs-directory__card-avatar" src="' + esc( avatar ) + '" alt="' + name + '" loading="lazy" />'
			+ '<div class="frs-directory__card-info">'
			+ '<p class="frs-directory__card-name">' + nameHtml + '</p>'
			+ ( title ? '<p class="frs-directory__card-title">' + title + '</p>' : '' )
			+ ( email ? '<p class="frs-directory__card-contact"><a href="mailto:' + esc( email ) + '">' + esc( email ) + '</a></p>' : '' )
			+ ( phone ? '<p class="frs-directory__card-contact"><a href="tel:' + esc( phone.replace( /[^\d+]/g, '' ) ) + '">' + esc( phone ) + '</a></p>' : '' )
			+ ( meta.length ? '<p class="frs-directory__card-meta">' + meta.join( ' &middot; ' ) + '</p>' : '' )
			+ '</div>'
			+ ( actions ? '<div class="frs-directory__card-actions">' + actions + '</div>' : '' )
			+ '</div>';
	}

	/* ── UI helpers ─────────────────────────────────────────── */
	function showLoading( on ) {
		$loading.hidden = ! on;
	}

	function showEmpty( on ) {
		$empty.hidden = ! on;
	}

	function showLoadMore( on ) {
		$loadMore.hidden = ! on;
	}

	function updateCount( total ) {
		if ( total > 0 ) {
			$count.textContent = total + ( total === 1 ? ' person' : ' people' );
		} else {
			$count.textContent = '';
		}
	}

	function setActiveAlphabet( letter ) {
		var buttons = $alphabet.querySelectorAll( '.frs-directory__letter' );
		for ( var i = 0; i < buttons.length; i++ ) {
			var btn = buttons[i];
			if ( btn.getAttribute( 'data-letter' ) === letter ) {
				btn.classList.add( 'is-active' );
			} else {
				btn.classList.remove( 'is-active' );
			}
		}
	}

	function setActiveView( view ) {
		state.view = view;
		var buttons = document.querySelectorAll( '.frs-directory__view-btn' );
		for ( var i = 0; i < buttons.length; i++ ) {
			buttons[i].classList.toggle( 'is-active', buttons[i].getAttribute( 'data-view' ) === view );
		}
		$grid.classList.toggle( 'is-list', view === 'list' );
	}

	/* ── Debounce ───────────────────────────────────────────── */
	var searchTimer = null;
	function debounce( fn, ms ) {
		return function () {
			clearTimeout( searchTimer );
			searchTimer = setTimeout( fn, ms );
		};
	}

	/* ── Event handlers ─────────────────────────────────────── */
	$search.addEventListener( 'input', debounce( function () {
		state.search = $search.value.trim();
		fetchProfiles( false );
	}, 300 ) );

	$role.addEventListener( 'change', function () {
		state.role = $role.value;
		fetchProfiles( false );
	} );

	$sort.addEventListener( 'change', function () {
		state.orderby = $sort.value;
		fetchProfiles( false );
	} );

	$alphabet.addEventListener( 'click', function ( e ) {
		var btn = e.target.closest( '.frs-directory__letter' );
		if ( ! btn ) return;
		var letter = btn.getAttribute( 'data-letter' );
		state.letter = letter;
		setActiveAlphabet( letter );
		fetchProfiles( false );
	} );

	$loadBtn.addEventListener( 'click', function () {
		state.page++;
		fetchProfiles( true );
	} );

	document.querySelector( '.frs-directory__view-toggle' ).addEventListener( 'click', function ( e ) {
		var btn = e.target.closest( '.frs-directory__view-btn' );
		if ( ! btn ) return;
		setActiveView( btn.getAttribute( 'data-view' ) );
	} );

	/* ── Init ───────────────────────────────────────────────── */
	fetchProfiles( false );

} )();
