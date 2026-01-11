/**
 * Loan Officer Directory - Frontend JavaScript
 *
 * Full directory with hero, sidebar filters, state chips, and QR modal.
 */
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('frs-directory');
    if (!container) return;

    const config = JSON.parse(container.dataset.config || '{}');

    // Hero elements
    const hero = document.getElementById('frs-hero');
    const heroSearch = document.getElementById('frs-hero-search');
    const heroSearchBtn = document.getElementById('frs-hero-search-btn');
    const scrollDownBtn = document.getElementById('frs-scroll-down');
    const directorySection = document.getElementById('frs-directory-section');
    const heroAvatars = document.getElementById('frs-hero-avatars');

    // Avatar positions - random scattered look
    const avatarPositions = [
        // Left side - scattered
        { left: 3, top: 6, size: 52 },
        { left: 10, top: 18, size: 68 },
        { left: 5, top: 35, size: 58 },
        { left: 14, top: 48, size: 64 },
        { left: 6, top: 62, size: 56 },
        { left: 11, top: 75, size: 62 },
        { left: 4, top: 88, size: 60 },
        // Right side - scattered
        { left: 92, top: 8, size: 60 },
        { left: 85, top: 22, size: 70 },
        { left: 90, top: 38, size: 56 },
        { left: 84, top: 52, size: 66 },
        { left: 91, top: 65, size: 58 },
        { left: 86, top: 78, size: 64 },
        { left: 93, top: 92, size: 68 },
        // Top center (above H1)
        { left: 25, top: 2, size: 56 },
        { left: 45, top: 3, size: 72 },
        { left: 65, top: 2, size: 70 },
        { left: 30, top: 11, size: 54 },
        { left: 40, top: 9, size: 62 },
        { left: 60, top: 8, size: 60 },
        { left: 70, top: 11, size: 56 },
        // Bottom center (below search)
        { left: 25, top: 78, size: 56 },
        { left: 38, top: 84, size: 64 },
        { left: 52, top: 80, size: 58 },
        { left: 66, top: 86, size: 62 },
        { left: 30, top: 92, size: 68 },
        { left: 45, top: 88, size: 54 },
        { left: 60, top: 94, size: 66 },
        { left: 75, top: 82, size: 60 },
    ];

    // Directory elements
    const loading = document.getElementById('frs-loading');
    const layout = document.getElementById('frs-layout');
    const error = document.getElementById('frs-error');
    const grid = document.getElementById('frs-grid');
    const countEl = document.getElementById('frs-count');
    const noResults = document.getElementById('frs-no-results');
    const loadMoreContainer = document.getElementById('frs-load-more');
    const loadMoreBtn = document.getElementById('frs-load-more-btn');

    // Filters
    const searchInput = document.getElementById('frs-search');
    const clearBtn = document.getElementById('frs-clear');
    const clearAltBtn = document.getElementById('frs-clear-alt');

    // State chips container
    const stateChipsContainer = document.getElementById('frs-state-chips');

    // All 50 US states
    const ALL_STATES = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    const STATE_NAMES = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };

    // State
    let profiles = [];
    let filteredProfiles = [];
    let displayedCount = 0;
    let searchQuery = '';
    let selectedServiceAreas = [];
    let allServiceAreas = [];
    let dataLoaded = false;
    let stateCounts = {};

    // Check URL params - if filters present, scroll to directory
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('search')) searchQuery = urlParams.get('search');
    if (urlParams.get('areas')) selectedServiceAreas = urlParams.get('areas').split(',');

    // If we have URL params, skip hero and go to directory
    if (searchQuery || selectedServiceAreas.length) {
        container.classList.add('scrolled');
    }

    // Load data immediately for hero avatars
    loadData();

    // Hero search functionality
    const heroSearchForm = document.getElementById('frs-hero-search-form');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performHeroSearch();
        });
    }

    function performHeroSearch() {
        if (!heroSearch) return;
        searchQuery = heroSearch.value.trim();
        if (searchInput) searchInput.value = searchQuery;
        container.classList.add('scrolled');

        // Show loading state briefly for smoother transition
        if (loading) loading.style.display = '';
        if (layout) layout.style.display = 'none';

        if (directorySection) {
            directorySection.scrollIntoView({ behavior: 'smooth' });
        }

        setTimeout(() => {
            if (!dataLoaded) {
                loadData();
            } else {
                applyFilters();
                updateURL();
            }
            if (loading) loading.style.display = 'none';
            if (layout) layout.style.display = '';
        }, 400);
    }

    // Scroll down button
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', () => {
            container.classList.add('scrolled');
            if (directorySection) {
                directorySection.scrollIntoView({ behavior: 'smooth' });
            }
            if (!dataLoaded) loadData();
        });
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
            updateURL();
        });
    }

    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (clearAltBtn) clearAltBtn.addEventListener('click', clearFilters);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);

    const retryBtn = document.getElementById('frs-retry');
    if (retryBtn) retryBtn.addEventListener('click', loadData);

    // State chips click handler
    if (stateChipsContainer) {
        stateChipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.frs-state-chip');
            if (chip) {
                const state = chip.dataset.state;
                if (selectedServiceAreas.includes(state)) {
                    selectedServiceAreas = selectedServiceAreas.filter(s => s !== state);
                    chip.classList.remove('frs-state-chip--selected');
                } else {
                    selectedServiceAreas.push(state);
                    chip.classList.add('frs-state-chip--selected');
                }
                applyFilters();
                updateURL();
            }
        });
    }

    // QR Popup
    const qrPopup = document.getElementById('frs-qr-popup');
    const qrImage = document.getElementById('frs-qr-image');
    const qrName = document.getElementById('frs-qr-name');
    const qrBackdrop = document.getElementById('frs-qr-backdrop');
    const qrClose = document.getElementById('frs-qr-close');

    function openQrPopup(qrData, name) {
        if (!qrPopup || !qrImage || !qrName) return;
        qrImage.src = qrData;
        qrName.textContent = name;
        qrPopup.classList.add('frs-qr-popup--open');
        document.body.style.overflow = 'hidden';
    }

    function closeQrPopup() {
        if (!qrPopup) return;
        qrPopup.classList.remove('frs-qr-popup--open');
        document.body.style.overflow = '';
    }

    if (qrBackdrop) qrBackdrop.addEventListener('click', closeQrPopup);
    if (qrClose) qrClose.addEventListener('click', closeQrPopup);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrPopup && qrPopup.classList.contains('frs-qr-popup--open')) {
            closeQrPopup();
        }
    });

    if (grid) {
        grid.addEventListener('click', function(e) {
            const qrBtn = e.target.closest('.frs-card__qr-btn');
            if (qrBtn) {
                const qrData = qrBtn.dataset.qr;
                const name = qrBtn.dataset.name;
                if (qrData) {
                    openQrPopup(qrData, name);
                }
            }
        });
    }

    function loadData() {
        // Use preloaded data from server
        const excludeNames = ['Blake Anthony Corkill', 'Matthew Thompson', 'Keith Thompson', 'Randy Keith Thompson'];

        // Deduplicate by email (keep first occurrence)
        const seen = new Set();
        profiles = (config.profiles || []).filter(p => {
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
            if (excludeNames.includes(fullName)) return false;

            const email = (p.email || '').toLowerCase();
            if (email && seen.has(email)) return false;
            if (email) seen.add(email);

            return true;
        });

        dataLoaded = true;
        extractFilters();
        populateFilters();
        if (heroAvatars && config.showHero !== false) {
            populateHeroAvatars();
        }

        if (searchQuery && searchInput) searchInput.value = searchQuery;

        filteredProfiles = [...profiles];
        if (loading) loading.style.display = 'none';
        if (layout) layout.style.display = '';
        applyFilters();
    }

    function getProfileImage(profile) {
        // Try headshot_url first, then avatar_url as fallback
        if (profile.headshot_url && profile.headshot_url.trim() !== '') {
            return profile.headshot_url;
        }
        if (profile.avatar_url && profile.avatar_url.trim() !== '' && !profile.avatar_url.includes('gravatar.com/avatar')) {
            return profile.avatar_url;
        }
        return '';
    }

    function populateHeroAvatars() {
        if (!heroAvatars) return;

        // Only use profiles with real images (headshot or avatar)
        const withImages = profiles.filter(p => getProfileImage(p) !== '');
        heroAvatars.innerHTML = '';

        // Only show as many avatars as we have real images (up to position count)
        const count = Math.min(withImages.length, avatarPositions.length);

        for (let i = 0; i < count; i++) {
            const p = withImages[i];
            const pos = avatarPositions[i];
            const imageUrl = getProfileImage(p);

            const div = document.createElement('div');
            div.className = 'frs-hero__avatar';

            // Add position-based classes for responsive layouts
            const isLeftEdge = pos.left <= 20;
            const isRightEdge = pos.left >= 80;
            const isTopArea = pos.top <= 25;
            const isBottomArea = pos.top >= 75;
            const isMiddleVertical = pos.top > 25 && pos.top < 75;

            // Priority: edges + top/bottom always, edge-middle on tablet, center-middle desktop only
            if ((isLeftEdge || isRightEdge) && (isTopArea || isBottomArea)) {
                div.classList.add('frs-hero__avatar--edge');
            } else if ((isLeftEdge || isRightEdge) && isMiddleVertical) {
                div.classList.add('frs-hero__avatar--edge-middle');
            } else if (isTopArea || isBottomArea) {
                div.classList.add('frs-hero__avatar--center-outer');
            } else if (isMiddleVertical) {
                div.classList.add('frs-hero__avatar--center-middle');
            }

            div.style.left = pos.left + '%';
            div.style.top = pos.top + '%';
            div.style.width = pos.size + 'px';
            div.style.height = pos.size + 'px';

            const firstName = p.first_name || '';
            const lastName = p.last_name || '';

            div.innerHTML = `<img src="${imageUrl}" alt="${firstName} ${lastName}" loading="lazy">`;
            heroAvatars.appendChild(div);
        }
    }

    function extractFilters() {
        // Count how many LOs are licensed in each state
        stateCounts = {};
        ALL_STATES.forEach(s => stateCounts[s] = 0);

        profiles.forEach(p => {
            if (p.service_areas && Array.isArray(p.service_areas)) {
                p.service_areas.forEach(area => {
                    const abbr = normalizeState(area);
                    if (stateCounts.hasOwnProperty(abbr)) {
                        stateCounts[abbr]++;
                    }
                });
            }
        });

        // Use all states, sorted alphabetically
        allServiceAreas = ALL_STATES;
    }

    function normalizeState(state) {
        const stateMap = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
            'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
            'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
            'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
            'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
            'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
            'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };
        return stateMap[state] || state.toUpperCase();
    }

    function populateFilters() {
        if (!stateChipsContainer) return;

        // Only show states that have LOs
        const statesWithData = allServiceAreas.filter(state => (stateCounts[state] || 0) > 0);

        statesWithData.forEach(state => {
            const chip = document.createElement('div');
            chip.className = 'frs-state-chip';
            const count = stateCounts[state];

            if (selectedServiceAreas.includes(state)) {
                chip.classList.add('frs-state-chip--selected');
            }
            chip.dataset.state = state;
            chip.textContent = state;
            chip.title = `${STATE_NAMES[state]} (${count})`;
            stateChipsContainer.appendChild(chip);
        });
    }

    function applyFilters() {
        let filtered = [...profiles];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => {
                const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
                const loc = (p.city_state || '').toLowerCase();
                return name.includes(q) || loc.includes(q);
            });
        }

        // Service areas filter (match ANY selected area)
        if (selectedServiceAreas.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.service_areas || !Array.isArray(p.service_areas)) return false;
                const normalizedAreas = p.service_areas.map(a => normalizeState(a));
                return selectedServiceAreas.some(area => normalizedAreas.includes(area));
            });
        }

        filteredProfiles = filtered;
        render();
    }

    function clearFilters() {
        searchQuery = '';
        selectedServiceAreas = [];
        if (searchInput) searchInput.value = '';
        if (heroSearch) heroSearch.value = '';
        if (stateChipsContainer) {
            stateChipsContainer.querySelectorAll('.frs-state-chip').forEach(c => c.classList.remove('frs-state-chip--selected'));
        }
        filteredProfiles = [...profiles];
        updateURL();
        render();
    }

    function updateURL() {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedServiceAreas.length) params.set('areas', selectedServiceAreas.join(','));

        const newURL = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    }

    function render() {
        const hasFilters = searchQuery || selectedServiceAreas.length > 0;
        displayedCount = 0;
        if (grid) grid.innerHTML = '';

        if (countEl) countEl.textContent = filteredProfiles.length;
        if (clearBtn) clearBtn.style.display = hasFilters ? '' : 'none';

        if (filteredProfiles.length === 0) {
            if (noResults) noResults.style.display = hasFilters ? '' : 'none';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        } else {
            if (noResults) noResults.style.display = 'none';
            loadMore();
        }
    }

    function loadMore() {
        const batch = filteredProfiles.slice(displayedCount, displayedCount + config.perPage);
        batch.forEach(lo => {
            if (grid) grid.appendChild(createCard(lo));
        });
        displayedCount += batch.length;

        if (loadMoreContainer) {
            if (displayedCount >= filteredProfiles.length) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = '';
            }
        }
    }

    function createCard(lo) {
        const firstName = lo.first_name || '';
        const lastName = lo.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        const title = lo.job_title || 'Loan Officer';
        const nmls = lo.nmls || lo.nmls_number || '';
        const titleNmls = nmls ? `${title} | NMLS ${nmls}` : title;
        const email = lo.email || '';
        const phone = lo.phone_number || lo.mobile_number || '';
        const headshot = getProfileImage(lo);
        const slug = lo.profile_slug || lo.id;
        const profileUrl = `${config.hubUrl}profile/${slug}`;
        const videoUrl = config.videoUrl || '';
        const qrData = lo.qr_code_data || '';
        const serviceAreas = lo.service_areas || [];

        const card = document.createElement('div');
        card.className = 'frs-card';
        card._loData = lo;

        // Service areas tags
        let serviceAreasTags = '';
        if (Array.isArray(serviceAreas) && serviceAreas.length > 0) {
            const normalizedAreas = serviceAreas.map(a => normalizeState(a)).slice(0, 4);
            serviceAreasTags = `<div class="frs-card__service-areas">${normalizedAreas.map(a => `<span class="frs-card__area-tag">${a}</span>`).join('')}</div>`;
        }

        card.innerHTML = `
            <div class="frs-card__header">
                ${videoUrl ? `<video autoplay loop muted playsinline><source src="${videoUrl}" type="video/mp4"></video>` : ''}
                ${qrData ? `<button class="frs-card__qr-btn" aria-label="Show QR code" data-qr="${qrData}" data-name="${fullName}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#qr-grad-${slug})" stroke-width="2">
                        <defs><linearGradient id="qr-grad-${slug}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2dd4da"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs>
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                        <rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/>
                        <rect x="18" y="18" width="3" height="3"/>
                    </svg>
                </button>` : ''}
            </div>
            <div class="frs-card__avatar">
                ${headshot ? `<img src="${headshot}" alt="${fullName}" loading="lazy">` : `<div class="frs-card__avatar-placeholder">${initials}</div>`}
            </div>
            <div class="frs-card__content">
                <h3 class="frs-card__name">${fullName}</h3>
                <p class="frs-card__title-nmls">${titleNmls}</p>
                ${serviceAreasTags}
                <div class="frs-card__contact">
                    ${phone ? `<div class="frs-card__contact-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${phone.replace(/[^\d+]/g, '')}">${phone}</a></div>` : ''}
                    ${email ? `<div class="frs-card__contact-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:${email}">${email}</a></div>` : ''}
                </div>
            </div>
            <div class="frs-card__actions">
                <a href="${profileUrl}" class="frs-card__btn frs-card__btn--primary">View Profile</a>
                ${phone ? `<a href="tel:${phone.replace(/[^\d+]/g, '')}" class="frs-card__btn frs-card__btn--outline">Call</a>` :
                  (email ? `<a href="mailto:${email}" class="frs-card__btn frs-card__btn--outline">Email</a>` :
                  `<a href="${profileUrl}" class="frs-card__btn frs-card__btn--outline">Contact</a>`)}
            </div>
        `;

        return card;
    }
});
