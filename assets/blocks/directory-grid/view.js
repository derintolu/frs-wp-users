/**
 * Directory Grid Block - View Script
 * 
 * Initializes the store with profile data and renders cards.
 * Uses the same card HTML structure as the original block.
 */
import { store, getContext } from '@wordpress/interactivity';

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

function normalizeState(state) {
    if (!state) return '';
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

function formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits[0] === '1') {
        return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
    }
    return phone;
}

function getProfileImage(profile) {
    if (profile.headshot_url && profile.headshot_url.trim() !== '') {
        return profile.headshot_url;
    }
    if (profile.avatar_url && profile.avatar_url.trim() !== '' && !profile.avatar_url.includes('gravatar.com/avatar')) {
        return profile.avatar_url.replace(/-\d+x\d+\./, '-512x512.');
    }
    return '';
}

function createCard(lo, hubUrl) {
    const firstName = lo.first_name || '';
    const lastName = lo.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || '?';
    const title = lo.job_title || 'Loan Officer';
    const nmls = lo.nmls || lo.nmls_number || '';
    const email = lo.email || '';
    const phone = lo.phone_number || lo.mobile_number || '';
    const phoneFormatted = formatPhone(phone);
    const headshot = getProfileImage(lo);
    const slug = lo.profile_slug || lo.id;
    const profileUrl = `${hubUrl}${slug}/`;
    const qrData = lo.qr_code_data || '';
    const serviceAreas = lo.service_areas || [];

    const card = document.createElement('div');
    card.className = 'frs-card';

    // Service areas tags
    let serviceAreasTags = '';
    if (Array.isArray(serviceAreas) && serviceAreas.length > 0) {
        const normalizedAreas = serviceAreas.map(a => normalizeState(a));
        const displayAreas = normalizedAreas.slice(0, 4);
        const remaining = normalizedAreas.length - 4;
        serviceAreasTags = `<div class="frs-card__service-areas">${displayAreas.map(a => `<span class="frs-card__area-tag">${a}</span>`).join('')}${remaining > 0 ? `<span class="frs-card__area-tag frs-card__area-tag--more">+${remaining} more</span>` : ''}</div>`;
    }

    card.innerHTML = `
        <div class="frs-card__header">
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
            <p class="frs-card__title">${title}</p>
            ${nmls ? `<p class="frs-card__nmls">NMLS# ${nmls}</p>` : ''}
            ${serviceAreasTags}
            <div class="frs-card__contact">
                ${phoneFormatted ? `<div class="frs-card__contact-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${phone.replace(/\D/g, '')}">${phoneFormatted}</a></div>` : ''}
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

// Store definition with grid-specific functionality
const { state, actions } = store('frs/directory', {
    state: {
        profiles: [],
        filteredProfiles: [],
        serviceAreaCounts: {},
        availableServiceAreas: [],
        searchQuery: '',
        selectedServiceAreas: [],
        perPage: 12,
        displayedCount: 0,
        isLoading: true,
        isInitialized: false,
        hubUrl: '',
        excludedNames: [],
        
        get hasFilters() {
            return state.searchQuery.length > 0 || state.selectedServiceAreas.length > 0;
        },
        get hasMoreProfiles() {
            return state.displayedCount < state.filteredProfiles.length;
        },
        get totalCount() {
            return state.filteredProfiles.length;
        }
    },
    
    actions: {
        init(profiles, config = {}) {
            if (state.isInitialized) return;
            
            state.hubUrl = config.hubUrl || '';
            state.perPage = config.perPage || 12;
            state.excludedNames = config.excludedNames || [];
            
            // Deduplicate and filter profiles
            const seen = new Set();
            state.profiles = (profiles || []).filter(p => {
                const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
                if (state.excludedNames.includes(fullName)) return false;
                
                const email = (p.email || '').toLowerCase();
                if (email && seen.has(email)) return false;
                if (email) seen.add(email);
                
                return true;
            });
            
            actions.extractServiceAreas();
            
            // Check URL params
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('search')) {
                state.searchQuery = urlParams.get('search');
            }
            if (urlParams.get('areas')) {
                state.selectedServiceAreas = urlParams.get('areas').split(',');
            }
            
            actions.applyFilters();
            
            state.isLoading = false;
            state.isInitialized = true;
            
            // Render initial cards
            actions.renderGrid();
        },
        
        extractServiceAreas() {
            const ALL_STATES = Object.keys(STATE_NAMES);
            state.serviceAreaCounts = {};
            ALL_STATES.forEach(s => state.serviceAreaCounts[s] = 0);
            
            state.profiles.forEach(p => {
                let areas = p.service_areas;
                if (typeof areas === 'string') {
                    try { areas = JSON.parse(areas); p.service_areas = areas; } catch (e) { areas = []; }
                }
                if (areas && Array.isArray(areas)) {
                    areas.forEach(area => {
                        const abbr = normalizeState(area);
                        if (state.serviceAreaCounts.hasOwnProperty(abbr)) {
                            state.serviceAreaCounts[abbr]++;
                        }
                    });
                }
            });
            
            state.availableServiceAreas = ALL_STATES.filter(s => state.serviceAreaCounts[s] > 0);
        },
        
        setSearchQuery(query) {
            state.searchQuery = query;
            actions.applyFilters();
            actions.updateURL();
            actions.renderGrid();
        },
        
        toggleServiceArea(area) {
            if (state.selectedServiceAreas.includes(area)) {
                state.selectedServiceAreas = state.selectedServiceAreas.filter(a => a !== area);
            } else {
                state.selectedServiceAreas = [...state.selectedServiceAreas, area];
            }
            actions.applyFilters();
            actions.updateURL();
            actions.renderGrid();
        },
        
        clearFilters() {
            state.searchQuery = '';
            state.selectedServiceAreas = [];
            
            // Clear search inputs
            document.querySelectorAll('.frs-directory-search__input').forEach(input => {
                input.value = '';
            });
            
            // Clear filter chips
            document.querySelectorAll('.frs-service-area-chip--selected').forEach(chip => {
                chip.classList.remove('frs-service-area-chip--selected');
            });
            
            actions.applyFilters();
            actions.updateURL();
            actions.renderGrid();
        },
        
        applyFilters() {
            let filtered = [...state.profiles];
            
            // Search filter
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase().trim();
                filtered = filtered.filter(p => {
                    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
                    const loc = (p.city_state || '').toLowerCase();
                    const region = (p.region || '').toLowerCase();
                    const title = (p.job_title || '').toLowerCase();
                    
                    let rawAreas = p.service_areas || [];
                    if (typeof rawAreas === 'string') {
                        try { rawAreas = JSON.parse(rawAreas); } catch (e) { rawAreas = []; }
                    }
                    const areas = Array.isArray(rawAreas) ? rawAreas : [];
                    const areasText = areas.map(a => a.toLowerCase()).join(' ');
                    const stateNames = areas.map(a => STATE_NAMES[normalizeState(a)] || '').join(' ').toLowerCase();
                    
                    const searchText = `${name} ${loc} ${region} ${title} ${areasText} ${stateNames}`;
                    const words = q.split(/\s+/).filter(w => w.length > 0);
                    return words.some(word => searchText.includes(word));
                });
            }
            
            // Service areas filter
            if (state.selectedServiceAreas.length > 0) {
                filtered = filtered.filter(p => {
                    let areas = p.service_areas;
                    if (typeof areas === 'string') {
                        try { areas = JSON.parse(areas); } catch (e) { return false; }
                    }
                    if (!areas || !Array.isArray(areas)) return false;
                    const normalizedAreas = areas.map(a => normalizeState(a));
                    return state.selectedServiceAreas.some(area => normalizedAreas.includes(area));
                });
            }
            
            state.filteredProfiles = filtered;
            state.displayedCount = Math.min(state.perPage, filtered.length);
        },
        
        loadMore() {
            state.displayedCount = Math.min(
                state.displayedCount + state.perPage,
                state.filteredProfiles.length
            );
            actions.renderGrid();
        },
        
        updateURL() {
            const params = new URLSearchParams();
            if (state.searchQuery) params.set('search', state.searchQuery);
            if (state.selectedServiceAreas.length) params.set('areas', state.selectedServiceAreas.join(','));
            
            const newURL = params.toString() 
                ? `${window.location.pathname}?${params}` 
                : window.location.pathname;
            window.history.replaceState({}, '', newURL);
        },
        
        renderGrid() {
            const grid = document.getElementById('frs-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            const visibleProfiles = state.filteredProfiles.slice(0, state.displayedCount);
            visibleProfiles.forEach(lo => {
                grid.appendChild(createCard(lo, state.hubUrl));
            });
        }
    },
    
    callbacks: {
        onSearchInput(event) {
            actions.setSearchQuery(event.target.value);
        },
        
        onSearchSubmit(event) {
            event.preventDefault();
        },
        
        onClearFilters() {
            actions.clearFilters();
        },
        
        onLoadMore() {
            actions.loadMore();
        }
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gridBlock = document.querySelector('.frs-directory-grid');
    if (gridBlock && gridBlock.dataset.config) {
        try {
            const config = JSON.parse(gridBlock.dataset.config);
            actions.init(config.profiles, config);
        } catch (e) {
            console.error('Failed to parse directory config:', e);
        }
    }
});
