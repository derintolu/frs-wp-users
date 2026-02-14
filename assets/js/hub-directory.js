/**
 * Hub Employee Directory
 *
 * Vanilla JS — fetches from /frs-users/v1/profiles, renders cards,
 * handles search, alphabet filter, role filter, sort, view toggle,
 * load-more pagination, and slide-out profile panel.
 */
( function () {
	'use strict';

	/* ── Config from wp_localize_script ─────────────────────── */
	var cfg = window.frsDirectory || {};
	var REST  = cfg.restUrl || '/wp-json/frs-users/v1/';
	var NONCE = cfg.nonce   || '';
	var PLUGIN_URL = cfg.pluginUrl || '';

	/* ── State abbreviation maps for service area SVGs ──────── */
	var ABBR_TO_SLUG = {
		AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',
		CO:'colorado',CT:'connecticut',DE:'delaware',DC:'district-of-columbia',
		FL:'florida',GA:'georgia',HI:'hawaii',ID:'idaho',IL:'illinois',
		IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',LA:'louisiana',
		ME:'maine',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',
		MS:'mississippi',MO:'missouri',MT:'montana',NE:'nebraska',NV:'nevada',
		NH:'new-hampshire',NJ:'new-jersey',NM:'new-mexico',NY:'new-york',
		NC:'north-carolina',ND:'north-dakota',OH:'ohio',OK:'oklahoma',
		OR:'oregon',PA:'pennsylvania',RI:'rhode-island',SC:'south-carolina',
		SD:'south-dakota',TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',
		VA:'virginia',WA:'washington',WV:'west-virginia',WI:'wisconsin',WY:'wyoming'
	};

	var STATE_NAME_TO_ABBR = {
		'alabama':'AL','alaska':'AK','arizona':'AZ','arkansas':'AR','california':'CA',
		'colorado':'CO','connecticut':'CT','delaware':'DE','florida':'FL','georgia':'GA',
		'hawaii':'HI','idaho':'ID','illinois':'IL','indiana':'IN','iowa':'IA',
		'kansas':'KS','kentucky':'KY','louisiana':'LA','maine':'ME','maryland':'MD',
		'massachusetts':'MA','michigan':'MI','minnesota':'MN','mississippi':'MS',
		'missouri':'MO','montana':'MT','nebraska':'NE','nevada':'NV',
		'new hampshire':'NH','new jersey':'NJ','new mexico':'NM','new york':'NY',
		'north carolina':'NC','north dakota':'ND','ohio':'OH','oklahoma':'OK',
		'oregon':'OR','pennsylvania':'PA','rhode island':'RI','south carolina':'SC',
		'south dakota':'SD','tennessee':'TN','texas':'TX','utah':'UT','vermont':'VT',
		'virginia':'VA','washington':'WA','west virginia':'WV','wisconsin':'WI',
		'wyoming':'WY','district of columbia':'DC'
	};

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
		panelOpen:  false,
	};

	/* ── DOM refs ───────────────────────────────────────────── */
	var $grid       = document.getElementById( 'frs-directory-grid' );
	var $empty      = document.getElementById( 'frs-directory-empty' );
	var $loading    = document.getElementById( 'frs-directory-loading' );
	var $loadMore   = document.getElementById( 'frs-directory-load-more' );
	var $loadBtn    = document.getElementById( 'frs-directory-load-more-btn' );
	var $count      = document.getElementById( 'frs-directory-count' );
	var $search     = document.getElementById( 'frs-directory-search' );
	var $role       = document.getElementById( 'frs-directory-role' );
	var $sort       = document.getElementById( 'frs-directory-sort' );
	var $alphabet   = document.getElementById( 'frs-directory-alphabet' );
	var $panel      = document.getElementById( 'frs-panel' );
	var $backdrop   = document.getElementById( 'frs-panel-backdrop' );
	var $panelBody  = document.getElementById( 'frs-panel-body' );
	var $panelClose = document.getElementById( 'frs-panel-close' );

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
		var userId = p.user_id || p.id || '';

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

		return '<div class="frs-directory__card" data-user-id="' + esc( String( userId ) ) + '">'
			+ '<img class="frs-directory__card-avatar" src="' + esc( avatar ) + '" alt="' + name + '" loading="lazy" />'
			+ '<div class="frs-directory__card-info">'
			+ '<p class="frs-directory__card-name">' + name + '</p>'
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

	/* ── Slide-Out Profile Panel ────────────────────────────── */

	function openPanel( userId ) {
		state.panelOpen = true;
		$panelBody.innerHTML = '<div class="frs-panel__loading"><div class="frs-directory__spinner"></div></div>';
		$panel.classList.add( 'is-open' );
		$panel.setAttribute( 'aria-hidden', 'false' );
		$backdrop.hidden = false;
		// Force reflow before adding class for transition
		void $backdrop.offsetHeight;
		$backdrop.classList.add( 'is-open' );
		// Lock scroll on the workspace content container (or body fallback)
		var scrollContainer = document.querySelector( '.overflow-y-auto' ) || document.documentElement;
		scrollContainer.dataset.frsScrollLock = scrollContainer.style.overflowY || '';
		scrollContainer.style.overflowY = 'hidden';

		// Fetch full profile
		var url = REST + 'profiles/' + encodeURIComponent( userId );
		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', url );
		if ( NONCE ) xhr.setRequestHeader( 'X-WP-Nonce', NONCE );

		xhr.onload = function () {
			if ( ! state.panelOpen ) return; // Panel was closed before response
			if ( xhr.status !== 200 ) {
				$panelBody.innerHTML = '<p style="padding:2rem;text-align:center;color:#94a3b8;">Could not load profile.</p>';
				return;
			}
			var json = JSON.parse( xhr.responseText );
			var profile = json.data || {};
			renderPanelContent( profile );
		};

		xhr.onerror = function () {
			if ( ! state.panelOpen ) return;
			$panelBody.innerHTML = '<p style="padding:2rem;text-align:center;color:#94a3b8;">Could not load profile.</p>';
		};

		xhr.send();
	}

	function closePanel() {
		state.panelOpen = false;
		$panel.classList.remove( 'is-open' );
		$panel.setAttribute( 'aria-hidden', 'true' );
		$backdrop.classList.remove( 'is-open' );
		// Restore scroll on workspace content container
		var scrollContainer = document.querySelector( '.overflow-y-auto' ) || document.documentElement;
		scrollContainer.style.overflowY = scrollContainer.dataset.frsScrollLock || '';
		delete scrollContainer.dataset.frsScrollLock;
		setTimeout( function () {
			if ( ! state.panelOpen ) {
				$backdrop.hidden = true;
				$panelBody.innerHTML = '';
			}
		}, 350 );
	}

	function renderPanelContent( p ) {
		var firstName = p.first_name || '';
		var lastName  = p.last_name || '';
		var fullName  = ( firstName + ' ' + lastName ).trim() || p.display_name || '';
		var inits     = initials( firstName, lastName );
		var jobTitle  = p.job_title || '';
		var rawNmls   = p.nmls || '';
		// Hide fake placeholder NMLS (1994xxx range)
		var nmls      = /^1994\d{3}$/.test( rawNmls ) ? '' : rawNmls;
		var email     = p.email || '';
		var phone     = p.phone_number || p.mobile_number || '';
		var location  = p.city_state || '';
		var bio       = p.biography || '';
		var avatar    = p.avatar_url || p.headshot_url || '';
		var profileUrl = p.profile_url || '';
		var applyUrl  = p.arrive || '';
		var website   = p.website || p.company_website || '';
		var facebook  = p.facebook_url || '';
		var instagram = p.instagram_url || '';
		var linkedin  = p.linkedin_url || '';
		var twitter   = p.twitter_url || '';
		var specialties = p.specialties_lo || p.specialties || [];
		var certs     = p.namb_certifications || [];
		var areas     = p.service_areas || [];
		var customLinks = p.custom_links || [];

		if ( ! Array.isArray( specialties ) ) specialties = [];
		if ( ! Array.isArray( certs ) ) certs = [];
		if ( ! Array.isArray( areas ) ) areas = [];
		if ( ! Array.isArray( customLinks ) ) customLinks = [];

		var html = '';

		// Hero + Avatar
		html += '<div class="frs-panel__hero"></div>';
		if ( avatar ) {
			html += '<img class="frs-panel__avatar" src="' + esc( avatar ) + '" alt="' + esc( fullName ) + '">';
		} else {
			html += '<div class="frs-panel__avatar-placeholder">' + esc( inits ) + '</div>';
		}

		// Identity
		html += '<div class="frs-panel__identity">';
		html += '<h2 class="frs-panel__name">' + esc( fullName ) + '</h2>';
		var titleNmls = jobTitle;
		if ( nmls ) titleNmls += ( titleNmls ? ' | ' : '' ) + 'NMLS# ' + esc( nmls );
		if ( titleNmls ) html += '<p class="frs-panel__title-nmls">' + esc( titleNmls ) + '</p>';
		if ( location ) {
			html += '<p class="frs-panel__location">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
				+ esc( location ) + '</p>';
		}
		html += '</div>';

		// Contact section
		if ( email || phone ) {
			html += '<div class="frs-panel__section">';
			if ( email ) {
				html += '<a class="frs-panel__contact-item" href="mailto:' + esc( email ) + '">'
					+ '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
					+ esc( email ) + '</a>';
			}
			if ( phone ) {
				var cleanPhone = phone.replace( /[^\d+]/g, '' );
				html += '<a class="frs-panel__contact-item" href="tel:' + esc( cleanPhone ) + '">'
					+ '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'
					+ esc( phone ) + '</a>';
			}
			html += '</div>';
		}

		// Action buttons
		html += '<div class="frs-panel__actions">';
		if ( phone ) {
			var cleanPhone2 = phone.replace( /[^\d+]/g, '' );
			html += '<a class="frs-panel__action-btn" href="tel:' + esc( cleanPhone2 ) + '">'
				+ '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'
				+ 'Call ' + esc( firstName || 'Them' ) + '</a>';
		}
		if ( email ) {
			html += '<a class="frs-panel__action-btn" href="mailto:' + esc( email ) + '">'
				+ '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
				+ 'Email ' + esc( firstName || 'Them' ) + '</a>';
		}
		if ( applyUrl ) {
			html += '<a class="frs-panel__action-btn frs-panel__action-btn--primary" href="' + esc( applyUrl ) + '" target="_blank" rel="noopener">'
				+ 'Apply Now</a>';
		}
		html += '</div>';

		// Service Areas
		if ( areas.length > 0 ) {
			html += '<div class="frs-panel__section">';
			html += '<h3 class="frs-panel__section-title">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
				+ 'Service Areas</h3>';
			html += '<div class="frs-panel__states-grid">';
			for ( var a = 0; a < areas.length; a++ ) {
				var area = areas[a];
				var areaLower = ( area || '' ).toLowerCase().trim();
				var abbr = STATE_NAME_TO_ABBR[ areaLower ] || ( areaLower.length === 2 ? areaLower.toUpperCase() : null );
				if ( abbr && ABBR_TO_SLUG[ abbr ] ) {
					var slug = ABBR_TO_SLUG[ abbr ];
					var svgUrl = PLUGIN_URL + 'assets/images/states/' + slug + '.svg';
					html += '<div class="frs-panel__state-card">'
						+ '<img class="frs-panel__state-svg" src="' + esc( svgUrl ) + '" alt="' + esc( abbr ) + '">'
						+ '<span class="frs-panel__state-abbr">' + esc( abbr ) + '</span></div>';
				} else {
					html += '<div class="frs-panel__state-card">'
						+ '<span class="frs-panel__state-abbr">' + esc( area ) + '</span></div>';
				}
			}
			html += '</div></div>';
		}

		// Biography
		if ( bio ) {
			html += '<div class="frs-panel__section">';
			html += '<h3 class="frs-panel__section-title">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
				+ 'Biography</h3>';
			html += '<div class="frs-panel__bio-content">' + bio + '</div>';
			html += '</div>';
		}

		// Specialties
		if ( specialties.length > 0 || certs.length > 0 ) {
			html += '<div class="frs-panel__section">';
			html += '<h3 class="frs-panel__section-title">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>'
				+ 'Specialties</h3>';
			if ( specialties.length > 0 ) {
				html += '<div class="frs-panel__badges">';
				for ( var s = 0; s < specialties.length; s++ ) {
					html += '<span class="frs-panel__badge">' + esc( specialties[s] ) + '</span>';
				}
				html += '</div>';
			}
			if ( certs.length > 0 ) {
				html += '<div class="frs-panel__badges" style="margin-top:0.5rem">';
				for ( var c = 0; c < certs.length; c++ ) {
					html += '<span class="frs-panel__badge frs-panel__badge--cert">' + esc( certs[c] ) + '</span>';
				}
				html += '</div>';
			}
			html += '</div>';
		}

		// Custom Links
		if ( customLinks.length > 0 ) {
			html += '<div class="frs-panel__section">';
			html += '<h3 class="frs-panel__section-title">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
				+ 'Links</h3>';
			for ( var cl = 0; cl < customLinks.length; cl++ ) {
				var link = customLinks[cl];
				if ( link && link.url ) {
					html += '<a class="frs-panel__link-item" href="' + esc( link.url ) + '" target="_blank" rel="noopener">'
						+ '<span class="frs-panel__link-title">' + esc( link.title || 'Link' ) + '</span>'
						+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
						+ '</a>';
				}
			}
			html += '</div>';
		}

		// Social links
		var socials = [];
		if ( website )   socials.push( { url: website, label: 'Website', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' } );
		if ( linkedin )  socials.push( { url: linkedin, label: 'LinkedIn', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>' } );
		if ( facebook )  socials.push( { url: facebook, label: 'Facebook', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>' } );
		if ( instagram ) socials.push( { url: instagram, label: 'Instagram', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' } );
		if ( twitter )   socials.push( { url: twitter, label: 'X/Twitter', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' } );

		if ( socials.length > 0 ) {
			html += '<div class="frs-panel__section">';
			html += '<h3 class="frs-panel__section-title">'
				+ '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'
				+ 'Connect</h3>';
			html += '<div class="frs-panel__social-row">';
			for ( var si = 0; si < socials.length; si++ ) {
				html += '<a class="frs-panel__social-link" href="' + esc( socials[si].url ) + '" target="_blank" rel="noopener">'
					+ socials[si].icon + ' ' + esc( socials[si].label ) + '</a>';
			}
			html += '</div></div>';
		}

		$panelBody.innerHTML = html;
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

	// Card click → open profile panel (but not for action buttons)
	$grid.addEventListener( 'click', function ( e ) {
		// Don't intercept clicks on action links (tel:, mailto:)
		if ( e.target.closest( '.frs-directory__card-action' ) ) return;
		// Don't intercept clicks on email/phone links inside card info
		if ( e.target.closest( '.frs-directory__card-contact a' ) ) return;

		var card = e.target.closest( '.frs-directory__card' );
		if ( ! card ) return;

		var userId = card.getAttribute( 'data-user-id' );
		if ( userId ) {
			e.preventDefault();
			openPanel( userId );
		}
	} );

	// Panel close triggers
	$panelClose.addEventListener( 'click', closePanel );
	$backdrop.addEventListener( 'click', closePanel );
	document.addEventListener( 'keydown', function ( e ) {
		if ( e.key === 'Escape' && state.panelOpen ) {
			closePanel();
		}
	} );

	/* ── Init ───────────────────────────────────────────────── */
	fetchProfiles( false );

} )();
