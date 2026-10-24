/**
 * H & S DOORS — Master Application Logic (Multi-Page Version)
 * -------------------------------------------------------------
 * Accessible, Responsive & Performant across Desktop, Tablet & Mobile.
 */

// -------------------------------------------------------------
// Mobile 3-Card Progressive Disclosure Helper
// -------------------------------------------------------------
window.toggleMobileCards = function(sectionKey) {
  let container = null;
  let btn = null;

  if (sectionKey === 'benefits') {
    container = document.getElementById('benefits');
    btn = document.getElementById('toggleBenefitsBtn');
  } else if (sectionKey === 'process') {
    container = document.getElementById('process');
    btn = document.getElementById('toggleProcessBtn');
  } else if (sectionKey === 'aboutProcess') {
    container = document.querySelector('.timeline-flow-track.steps-4');
    btn = document.getElementById('toggleAboutProcessBtn');
  } else if (sectionKey === 'woods') {
    container = document.getElementById('woodSpeciesGrid');
    btn = document.getElementById('toggleWoodsBtn');
  }

  if (!container || !btn) return;

  const hiddenCards = container.querySelectorAll('.mobile-card-hidden');
  if (!hiddenCards.length) return;

  const isCurrentlyExpanded = btn.getAttribute('aria-expanded') === 'true';
  const shouldExpand = !isCurrentlyExpanded;

  hiddenCards.forEach(card => {
    card.classList.toggle('is-revealed', shouldExpand);
  });

  btn.setAttribute('aria-expanded', String(shouldExpand));
  const span = btn.querySelector('span');
  const svg = btn.querySelector('svg');
  const origText = btn.dataset.originalText || 'View More';

  if (span) {
    span.textContent = shouldExpand ? 'Show Less' : origText;
  }
  if (svg) {
    svg.style.transform = shouldExpand ? 'rotate(180deg)' : 'rotate(0deg)';
    svg.style.transition = 'transform 0.25s ease';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------------------------------------
  // 1. State Management
  // -----------------------------------------------------------
  const state = {
    // Catalogue State
    activeCategory: 'all',
    searchQuery: '',
    visibleCount: 12,
    homePreviewExpanded: false,
    mobileProductsDoorsExpanded: false,
    mobileProductsWindowsExpanded: false,
    totalDoors: window.HS_CATALOG ? window.HS_CATALOG.length : 0,

    // Customisation Engine State
    customisation: {
      step: 1,
      category: 'main-entrance',
      categoryLabel: 'Main Entrance Doors',
      selectedDoor: null,
      stylePreference: 'Modern Vertical Grooves',
      finishPreference: 'Rich Teak Wood Polish',
      hardwarePreference: 'Long Bar Pull (1200mm)',
      glassPreference: 'Solid Wood (No Glass)',
      widthMm: '',
      heightMm: '',
      needsMeasurementHelp: false,
      roomLocation: 'Main Villa Entrance',
      quantity: 1,
      customerNotes: ''
    },

    // Inspiration Section State
    activeInspiration: 'warm-natural'
  };

  // Pre-select first door as default for customizer preview
  if (window.HS_CATALOG && window.HS_CATALOG.length > 0) {
    state.customisation.selectedDoor = window.HS_CATALOG[0];
  }

  // -----------------------------------------------------------
  // 2. DOM Elements Cache
  // -----------------------------------------------------------
  const header = document.querySelector('.site-header');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const doorsGrid = document.getElementById('doorsGrid');
  const catalogueCounter = document.getElementById('catalogueCounter');
  const searchInput = document.getElementById('doorSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const loadMoreBtn = document.getElementById('loadMoreDoorsBtn');

  // Customizer Elements
  const wizardNodes = document.querySelectorAll('.wizard-step-node');
  const wizardPanes = document.querySelectorAll('.wizard-step-pane');
  const progressFill = document.getElementById('wizardProgressFill');
  const prevStepBtn = document.getElementById('prevStepBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const whatsappNotice = document.getElementById('whatsappSetupNotice');

  // Modals & Toast
  const quickViewModal = document.getElementById('quickViewModal');
  const quickViewContent = document.getElementById('quickViewContent');
  const toastNotification = document.getElementById('toastNotification');

  // -----------------------------------------------------------
  // 3. Navigation & Header Behavior
  // -----------------------------------------------------------
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // Mobile Drawer Toggle
  function openMobileMenu() {
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileMenu);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // -----------------------------------------------------------
  // 4. Products Page Tab Switching (Doors vs Windows)
  // -----------------------------------------------------------
  function switchProductView(targetView) {
    const productTabs = document.querySelectorAll('.product-view-tab');
    productTabs.forEach(t => {
      const isTarget = (t.dataset.view === targetView);
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    const doorsContainer = document.getElementById('productsDoorsContainer');
    const windowsContainer = document.getElementById('productsWindowsContainer');

    if (doorsContainer && windowsContainer) {
      if (targetView === 'windows') {
        doorsContainer.style.display = 'none';
        windowsContainer.style.display = 'block';
        if (typeof renderWindows === 'function') renderWindows();
      } else {
        doorsContainer.style.display = 'block';
        windowsContainer.style.display = 'none';
      }
    }
  }

  const productTabs = document.querySelectorAll('.product-view-tab');
  if (productTabs && productTabs.length > 0) {
    productTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        switchProductView(tab.dataset.view);
      });
    });

    // Check URL query param or hash for view e.g. ?view=windows or #windows
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const hash = window.location.hash.toLowerCase();
    if (viewParam === 'windows' || hash === '#windows') {
      setTimeout(() => switchProductView('windows'), 50);
    }
  }

  // -----------------------------------------------------------
  // 5. Catalogue Rendering & Filtering (No Exact Design Numbers)
  // -----------------------------------------------------------
  function getFilteredDoors() {
    if (!window.HS_CATALOG) return [];
    return window.HS_CATALOG.filter(door => {
      const matchesCategory = (state.activeCategory === 'all' || door.category === state.activeCategory);
      const query = state.searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        door.name.toLowerCase().includes(query) ||
        door.id.toLowerCase().includes(query) ||
        door.style.toLowerCase().includes(query) ||
        door.finish.toLowerCase().includes(query) ||
        door.categoryName.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  function renderCatalogue() {
    if (!doorsGrid) return;
    const isProductsPage = Boolean(document.getElementById('doorSearchInput'));
    const filtered = getFilteredDoors();
    const isMobile = window.innerWidth <= 768;

    let displayCount;
    if (isProductsPage) {
      if (isMobile && !state.mobileProductsDoorsExpanded) {
        displayCount = 4;
      } else {
        displayCount = state.visibleCount;
      }
    } else {
      // Home page preview: 4 items rendered on mobile (second card hidden via CSS leaves 3 visible)
      displayCount = isMobile ? 4 : 6;
    }

    const visible = filtered.slice(0, displayCount);

    if (catalogueCounter) {
      catalogueCounter.textContent = `Showing ${visible.length} designs of our collection`;
    }

    if (filtered.length === 0) {
      doorsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 4rem 1.5rem; text-align: center; background: #fff; border: 2px dashed var(--color-taupe); border-radius: var(--radius-md);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="1.5" style="margin: 0 auto 1rem;">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
            <circle cx="14" cy="12" r="1"/>
          </svg>
          <h3 style="font-family: var(--font-serif); font-size: 1.35rem; margin-bottom: 0.5rem;">No Matching Designs Found</h3>
          <p style="font-size: var(--text-sm); color: rgba(33,33,30,0.7); max-width: 440px; margin: 0 auto 1.25rem;">
            We couldn't find any designs matching "${state.searchQuery}". Try searching for another style (e.g. "Teak", "Fluted", "Panel") or reset your search.
          </p>
          <button class="btn btn-secondary btn-sm" id="resetFiltersBtn">Reset Filters &amp; Search</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.activeCategory = 'all';
          state.searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (searchClearBtn) searchClearBtn.classList.remove('visible');
          filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
          renderCatalogue();
        });
      }
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    doorsGrid.innerHTML = visible.map(door => `
      <article class="door-card" data-door-id="${door.id}">
        <div class="door-card-media">
          <span class="door-card-badge">${door.tag}</span>
          <img class="door-card-img" 
               src="${door.thumb}" 
               data-full-src="${door.image}"
               alt="${door.name}" 
               loading="lazy"
               width="320" 
               height="620">
          <button class="door-card-quick-btn" title="Quick View ${door.name}" data-action="quickview" data-id="${door.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <div class="door-card-body">
          <div class="door-card-header">
            <span class="door-card-code">${door.id}</span>
            <span class="door-card-style-tag">${door.categoryName}</span>
          </div>
          <h3 class="door-card-title">${door.name}</h3>
          <div class="door-card-finish">Finish: ${door.finish}</div>
          <div class="door-card-actions">
            <button class="btn btn-primary btn-sm" data-action="customise" data-id="${door.id}">
              <span>Customise</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" data-action="quickview" data-id="${door.id}">
              Details
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Toggle Load More button (on products.html)
    if (loadMoreBtn) {
      if (isMobile && !state.mobileProductsDoorsExpanded && filtered.length > 3) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.innerHTML = `<span>View All Door Designs</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
      } else if (visible.length < filtered.length) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.innerHTML = `<span>Browse More Designs</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  // Category Overview Cards click
  document.querySelectorAll('.category-overview-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      state.activeCategory = cat;
      state.visibleCount = 12;
      filterPills.forEach(p => p.classList.toggle('active', p.dataset.category === cat));
      renderCatalogue();

      // Scroll to catalogue
      const filterBar = document.querySelector('.catalogue-controls-bar');
      if (filterBar) {
        const offset = 80;
        const pos = filterBar.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });

  // Filter Pills click
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.category;
      state.visibleCount = 12;
      renderCatalogue();
    });
  });

  // Search Input behavior
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.visibleCount = 12;
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
      }
      renderCatalogue();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchClearBtn.classList.remove('visible');
      renderCatalogue();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && !state.mobileProductsDoorsExpanded) {
        state.mobileProductsDoorsExpanded = true;
      } else {
        state.visibleCount += 12;
      }
      renderCatalogue();
    });
  }

  // Auto-adapt preview cards when resizing across breakpoint
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderCatalogue();
      renderWindows();
    }, 150);
  });

  // Delegate door card buttons
  if (doorsGrid) {
    doorsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const doorId = btn.dataset.id;
      const door = window.HS_CATALOG.find(d => d.id === doorId);
      if (!door) return;

      if (action === 'quickview') {
        openQuickView(door);
      } else if (action === 'customise') {
        selectDoorForCustomisation(door);
      }
    });
  }

  // -----------------------------------------------------------
  // 6. Windows Rendering & Quick Enquiry
  // -----------------------------------------------------------
  const windowsGrid = document.getElementById('windowsGrid');
  function renderWindows() {
    if (!windowsGrid || !window.HS_WINDOWS) return;
    const isMobile = window.innerWidth <= 768;
    const limit = (isMobile && !state.mobileProductsWindowsExpanded) ? 3 : window.HS_WINDOWS.length;
    const visibleWindows = window.HS_WINDOWS.slice(0, limit);

    windowsGrid.innerHTML = visibleWindows.map(win => `
      <article class="window-card" data-window-id="${win.id}">
        <div class="window-visual-showcase">
          ${win.svg}
          <span class="door-card-badge" style="position: absolute; top: 12px; left: 12px;">${win.categoryName}</span>
          <span style="position: absolute; top: 12px; right: 12px; background: rgba(33,33,30,0.85); color: var(--color-gold-light); font-family: var(--font-mono); font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 700;">${win.id}</span>
        </div>
        
        <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 0.35rem; color: var(--color-charcoal);">${win.name}</h3>
        <div style="font-size: 0.75rem; color: var(--color-brown-warm); font-weight: 700; margin-bottom: 0.75rem;">
          Ideal for: ${win.recommendedFor}
        </div>

        <div class="window-feature-badges">
          ${(win.badges || []).map(b => `<span class="window-badge-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>${b}</span>`).join('')}
        </div>

        <p style="font-size: var(--text-xs); color: rgba(33,33,30,0.75); line-height: 1.55; margin-bottom: 1rem;">
          ${win.description}
        </p>

        <div class="window-specs-table">
          <div class="window-specs-row">
            <span class="window-specs-label">Frame Profile:</span>
            <span class="window-specs-val">${win.frame}</span>
          </div>
          <div class="window-specs-row">
            <span class="window-specs-label">Glass Specification:</span>
            <span class="window-specs-val">${win.glazing}</span>
          </div>
          <div class="window-specs-row">
            <span class="window-specs-label">Hardware &amp; Locking:</span>
            <span class="window-specs-val">${win.hardware}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn btn-whatsapp btn-sm btn-full" data-window-id="${win.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.16c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.23 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/>
            </svg>
            <span>Enquire on WhatsApp</span>
          </button>
          <a href="customise.html" class="btn btn-secondary btn-sm" title="Customise Matching Doors" style="flex-shrink: 0; padding-inline: 0.85rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </a>
        </div>
      </article>
    `).join('');

    // Toggle Mobile View All Windows Button
    const toggleWindowsBtn = document.getElementById('toggleWindowsBtn');
    const windowsWrap = document.getElementById('windowsMobileViewMoreWrap');
    if (windowsWrap && toggleWindowsBtn) {
      if (isMobile && window.HS_WINDOWS.length > 3) {
        windowsWrap.style.display = 'block';
        const span = toggleWindowsBtn.querySelector('span');
        const svg = toggleWindowsBtn.querySelector('svg');
        if (span) {
          span.textContent = state.mobileProductsWindowsExpanded ? 'Show Fewer Window Designs' : 'View All Window Designs';
        }
        if (svg) {
          svg.style.transform = state.mobileProductsWindowsExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      } else {
        windowsWrap.style.display = 'none';
      }
    }

    windowsGrid.querySelectorAll('button[data-window-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const winId = btn.dataset.windowId;
        const win = window.HS_WINDOWS.find(w => w.id === winId);
        if (win) handleWindowEnquiry(win);
      });
    });
  }

  // Windows Mobile View All Button Click
  const toggleWindowsBtn = document.getElementById('toggleWindowsBtn');
  if (toggleWindowsBtn) {
    toggleWindowsBtn.addEventListener('click', () => {
      state.mobileProductsWindowsExpanded = !state.mobileProductsWindowsExpanded;
      renderWindows();
    });
  }

  function handleWindowEnquiry(windowItem) {
    const message = `Hello H & S Doors,

I would like to enquire about your window design.

Window Model: ${windowItem.name}
Code: ${windowItem.id}
Category: ${windowItem.categoryName}
Profile Specification: ${windowItem.frame}
Glazing: ${windowItem.glazing}

Could you please share quotation details and discuss dimensions for my home?

Thank you.`;

    sendToWhatsAppWithMessage(message, `Window Enquiry: ${windowItem.name}`);
  }

  // -----------------------------------------------------------
  // 7. Signature Customisation Wizard (Redesigned Step 2 Cards)
  // -----------------------------------------------------------
  function updateWizardUI() {
    const step = state.customisation.step;
    wizardNodes.forEach((node, idx) => {
      const nodeStep = idx + 1;
      node.classList.toggle('active', nodeStep === step);
      node.classList.toggle('completed', nodeStep < step);
    });

    if (progressFill) {
      const percentage = ((step - 1) / 5) * 100;
      progressFill.style.width = `${Math.min(percentage, 100)}%`;
    }

    wizardPanes.forEach((pane, idx) => {
      pane.classList.toggle('active', (idx + 1) === step);
    });

    if (prevStepBtn) {
      prevStepBtn.style.visibility = (step === 1) ? 'hidden' : 'visible';
    }

    if (nextStepBtn && sendWhatsAppBtn) {
      if (step === 6) {
        nextStepBtn.style.display = 'none';
        sendWhatsAppBtn.style.display = 'inline-flex';
      } else {
        nextStepBtn.style.display = 'inline-flex';
        sendWhatsAppBtn.style.display = 'none';
      }
    }

    updateLivePreview();
  }

  function updateLivePreview() {
    const door = state.customisation.selectedDoor;
    const previewDoorImg = document.getElementById('previewDoorImg');
    const previewDoorTitle = document.getElementById('previewDoorTitle');
    const previewDoorCode = document.getElementById('previewDoorCode');
    const previewCategory = document.getElementById('previewCategory');
    const previewFinish = document.getElementById('previewFinish');
    const previewHardware = document.getElementById('previewHardware');
    const previewDimensions = document.getElementById('previewDimensions');
    const previewQuantity = document.getElementById('previewQuantity');

    if (door && previewDoorImg) {
      previewDoorImg.src = door.image;
      previewDoorImg.alt = door.name;
    }
    if (door && previewDoorTitle) previewDoorTitle.textContent = door.name;
    if (door && previewDoorCode) previewDoorCode.textContent = door.id;
    if (previewCategory) previewCategory.textContent = state.customisation.categoryLabel;
    if (previewFinish) previewFinish.textContent = state.customisation.finishPreference;
    if (previewHardware) previewHardware.textContent = state.customisation.hardwarePreference;

    if (previewDimensions) {
      if (state.customisation.needsMeasurementHelp) {
        previewDimensions.textContent = 'Measurement Assistance Requested';
      } else if (state.customisation.widthMm && state.customisation.heightMm) {
        previewDimensions.textContent = `${state.customisation.widthMm} × ${state.customisation.heightMm} mm`;
      } else {
        previewDimensions.textContent = 'Standard / Unspecified';
      }
    }

    if (previewQuantity) {
      previewQuantity.textContent = `${state.customisation.quantity} unit(s)`;
    }

    renderReviewSummary();
  }

  function renderReviewSummary() {
    const summaryBox = document.getElementById('reviewSummaryTable');
    if (!summaryBox) return;
    const c = state.customisation;
    const door = c.selectedDoor || { name: 'Custom Design', id: 'HS-CUSTOM' };

    summaryBox.innerHTML = `
      <div style="background-color: var(--color-ivory); border: 1.5px solid var(--color-taupe); border-radius: var(--radius-sm); padding: 1.25rem; font-size: var(--text-sm); display: flex; flex-direction: column; gap: 0.65rem;">
        <div style="display:flex; justify-content:space-between;"><span>Door Category:</span> <strong>${c.categoryLabel}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Selected Design:</span> <strong>${door.name} (${door.id})</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Polish Finish:</span> <strong>${c.finishPreference}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Handle Style:</span> <strong>${c.hardwarePreference}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Glass / Panel:</span> <strong>${c.glassPreference}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Size:</span> <strong>${c.needsMeasurementHelp ? 'Measurement Help Requested' : (c.widthMm && c.heightMm ? `${c.widthMm} × ${c.heightMm} mm` : 'Standard Size')}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Room Spot:</span> <strong>${c.roomLocation || 'Not Specified'}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Quantity:</span> <strong>${c.quantity} unit(s)</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Notes:</span> <strong>${c.customerNotes ? c.customerNotes : 'Standard'}</strong></div>
      </div>
    `;
  }

  // REDESIGNED Step 2 Design Picker Grid (Fixing Screenshot #2)
  function renderDesignPickerGrid() {
    const pickerGrid = document.getElementById('customizerDesignGrid');
    if (!pickerGrid || !window.HS_CATALOG) return;

    const cat = state.customisation.category;
    let available = window.HS_CATALOG.filter(d => d.category === cat);
    if (available.length === 0) available = window.HS_CATALOG;

    pickerGrid.innerHTML = available.map(door => `
      <div class="design-picker-item ${state.customisation.selectedDoor && state.customisation.selectedDoor.id === door.id ? 'selected' : ''}" data-id="${door.id}">
        <div class="picker-thumb-box">
          <img src="${door.thumb}" alt="${door.name}" loading="lazy" width="160" height="320">
          <div class="picker-selected-check">&#10003;</div>
        </div>
        <div class="picker-item-meta">
          <span class="picker-code-badge">${door.id}</span>
          <div class="picker-item-name" title="${door.name}">${door.name}</div>
        </div>
      </div>
    `).join('');

    pickerGrid.querySelectorAll('.design-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const door = window.HS_CATALOG.find(d => d.id === id);
        if (door) {
          state.customisation.selectedDoor = door;
          pickerGrid.querySelectorAll('.design-picker-item').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
          updateLivePreview();
          showToast(`Selected ${door.id} (${door.name})`);
        }
      });
    });
  }

  // Step 1: Category selection
  document.querySelectorAll('.selection-option-card[data-category]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.selection-option-card[data-category]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.customisation.category = card.dataset.category;
      state.customisation.categoryLabel = card.querySelector('strong').textContent.trim();
      renderDesignPickerGrid();
      updateLivePreview();
    });
  });

  // Step 3: Choice chips
  document.querySelectorAll('.choice-chip[data-field]').forEach(chip => {
    chip.addEventListener('click', () => {
      const field = chip.dataset.field;
      const val = chip.dataset.val;
      const group = chip.parentElement;
      group.querySelectorAll('.choice-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');

      if (field === 'style') state.customisation.stylePreference = val;
      if (field === 'finish') state.customisation.finishPreference = val;
      if (field === 'hardware') state.customisation.hardwarePreference = val;
      if (field === 'glass') state.customisation.glassPreference = val;

      updateLivePreview();
    });
  });

  // Step 4: Dimensions
  const widthInput = document.getElementById('doorWidthMm');
  const heightInput = document.getElementById('doorHeightMm');
  const helpDimensionsCheckbox = document.getElementById('helpDimensionsCheckbox');

  if (widthInput) {
    widthInput.addEventListener('input', (e) => {
      state.customisation.widthMm = e.target.value.trim();
      updateLivePreview();
    });
  }

  if (heightInput) {
    heightInput.addEventListener('input', (e) => {
      state.customisation.heightMm = e.target.value.trim();
      updateLivePreview();
    });
  }

  if (helpDimensionsCheckbox) {
    helpDimensionsCheckbox.addEventListener('change', (e) => {
      state.customisation.needsMeasurementHelp = e.target.checked;
      if (widthInput) widthInput.disabled = e.target.checked;
      if (heightInput) heightInput.disabled = e.target.checked;
      updateLivePreview();
    });
  }

  // Step 5: Room Location, Quantity, & Notes
  const roomSelect = document.getElementById('roomLocationSelect');
  const qtyMinus = document.getElementById('qtyMinusBtn');
  const qtyPlus = document.getElementById('qtyPlusBtn');
  const qtyDisplay = document.getElementById('qtyDisplay');
  const notesTextarea = document.getElementById('customisationNotes');

  if (roomSelect) {
    roomSelect.addEventListener('change', (e) => {
      state.customisation.roomLocation = e.target.value;
      updateLivePreview();
    });
  }

  if (qtyMinus && qtyPlus && qtyDisplay) {
    qtyMinus.addEventListener('click', () => {
      if (state.customisation.quantity > 1) {
        state.customisation.quantity--;
        qtyDisplay.textContent = state.customisation.quantity;
        updateLivePreview();
      }
    });
    qtyPlus.addEventListener('click', () => {
      if (state.customisation.quantity < 50) {
        state.customisation.quantity++;
        qtyDisplay.textContent = state.customisation.quantity;
        updateLivePreview();
      }
    });
  }

  if (notesTextarea) {
    notesTextarea.addEventListener('input', (e) => {
      state.customisation.customerNotes = e.target.value.trim();
      updateLivePreview();
    });
  }

  // Wizard Navigation
  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      if (state.customisation.step > 1) {
        state.customisation.step--;
        updateWizardUI();
      }
    });
  }

  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      if (state.customisation.step < 6) {
        if (state.customisation.step === 2 && !state.customisation.selectedDoor) {
          showToast('Please select a door design from the collection');
          return;
        }
        state.customisation.step++;
        updateWizardUI();
      }
    });
  }

  const editSelectionsBtn = document.getElementById('editSelectionsBtn');
  if (editSelectionsBtn) {
    editSelectionsBtn.addEventListener('click', () => {
      state.customisation.step = 2;
      updateWizardUI();
    });
  }

  function selectDoorForCustomisation(door) {
    state.customisation.selectedDoor = door;
    state.customisation.category = door.category;
    state.customisation.categoryLabel = door.categoryName;
    state.customisation.finishPreference = door.finish;
    state.customisation.stylePreference = door.style;

    // If on a page other than customise.html, redirect with door ID param
    if (!document.getElementById('customise') && !document.getElementById('customizerDesignGrid')) {
      window.location.href = `customise.html?door=${door.id}`;
      return;
    }

    document.querySelectorAll('.selection-option-card[data-category]').forEach(card => {
      card.classList.toggle('selected', card.dataset.category === door.category);
    });

    renderDesignPickerGrid();
    state.customisation.step = 3;
    updateWizardUI();

    const customizerEl = document.getElementById('customise');
    if (customizerEl) {
      const offset = 70;
      const pos = customizerEl.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }

    showToast(`Loaded ${door.name} into customizer`);
  }

  // Handle URL param for customise.html e.g. ?door=HS-005
  const urlParams = new URLSearchParams(window.location.search);
  const paramDoorId = urlParams.get('door');
  if (paramDoorId && window.HS_CATALOG) {
    const door = window.HS_CATALOG.find(d => d.id === paramDoorId);
    if (door) {
      setTimeout(() => {
        selectDoorForCustomisation(door);
      }, 100);
    }
  }

  // -----------------------------------------------------------
  // 8. WhatsApp Message Compilation
  // -----------------------------------------------------------
  function compileWhatsAppMessage() {
    const c = state.customisation;
    const door = c.selectedDoor || { name: 'Custom Door Design', id: 'HS-CUSTOM' };
    
    const dimensionsText = c.needsMeasurementHelp 
      ? 'I need help with measurements (Consultation requested)' 
      : (c.widthMm && c.heightMm ? `${c.widthMm} mm (W) × ${c.heightMm} mm (H)` : 'Standard size requested');

    return `Hello H & S Doors,

I would like to enquire about a customised door for my home.

Door category: ${c.categoryLabel}
Design: ${door.name}
Design code: ${door.id}
Preferred polish: ${c.finishPreference}
Handle preference: ${c.hardwarePreference}
Glass/panel: ${c.glassPreference}
Dimensions: ${dimensionsText}
Installation spot: ${c.roomLocation || 'Not specified'}
Quantity: ${c.quantity} unit(s)
Special requirements: ${c.customerNotes ? c.customerNotes : 'Standard design as shown'}

Please help me with the quotation and available customisation options.

Thank you.`;
  }

  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const message = compileWhatsAppMessage();
      sendToWhatsAppWithMessage(message, `Door Enquiry: ${state.customisation.selectedDoor ? state.customisation.selectedDoor.name : 'Custom Door'}`);
    });
  }

  function sendToWhatsAppWithMessage(message, titleContext = 'Enquiry') {
    const config = window.HS_CONFIG || {};
    const rawNumber = (config.whatsappNumber || '').replace(/[^\d]/g, '');

    if (!rawNumber) {
      if (whatsappNotice) whatsappNotice.classList.add('visible');
      openWhatsAppPreviewModal(message, null, titleContext);
      return;
    }

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${rawNumber}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp... Please remember to tap "Send" in WhatsApp.');
  }

  function openWhatsAppPreviewModal(message, waUrl, titleContext) {
    const modal = document.getElementById('whatsappModal');
    const previewTextarea = document.getElementById('whatsappPreviewText');
    const modalTitle = document.getElementById('whatsappModalTitle');
    const modalSendBtn = document.getElementById('whatsappModalSendBtn');
    const modalCopyBtn = document.getElementById('whatsappModalCopyBtn');

    if (modalTitle) modalTitle.textContent = titleContext || 'Your WhatsApp Enquiry';
    if (previewTextarea) previewTextarea.value = message;

    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    if (modalCopyBtn) {
      modalCopyBtn.onclick = () => {
        navigator.clipboard.writeText(message).then(() => {
          showToast('Enquiry copied to clipboard!');
        }).catch(() => {
          previewTextarea.select();
          document.execCommand('copy');
          showToast('Enquiry text copied!');
        });
      };
    }

    if (modalSendBtn) {
      if (waUrl) {
        modalSendBtn.style.display = 'inline-flex';
        modalSendBtn.onclick = () => {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        };
      } else {
        modalSendBtn.style.display = 'none';
      }
    }
  }

  const closeWaModalBtn = document.getElementById('closeWhatsappModalBtn');
  if (closeWaModalBtn) {
    closeWaModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('whatsappModal');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // -----------------------------------------------------------
  // 9. Quick View Modal
  // -----------------------------------------------------------
  function openQuickView(door) {
    if (!quickViewModal || !quickViewContent) return;

    quickViewContent.innerHTML = `
      <div class="door-modal-grid">
        <div class="door-modal-media">
          <img src="${door.image}" alt="${door.name}" width="380" height="740">
        </div>
        <div class="door-modal-info">
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-gold-rich); font-weight: 800; margin-bottom: 0.25rem;">
            ${door.id} &bull; ${door.categoryName}
          </div>
          <h2 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.5rem; color: var(--color-charcoal);">
            ${door.name}
          </h2>
          <p style="font-size: var(--text-sm); color: rgba(33,33,30,0.78); margin-bottom: 1.25rem; line-height: 1.6;">
            ${door.description}
          </p>
          <div style="background-color: var(--color-ivory); border: 1.5px solid var(--color-taupe); border-radius: var(--radius-xs); padding: 1rem; margin-bottom: 1.5rem; font-size: var(--text-xs); display: flex; flex-direction: column; gap: 0.5rem;">
            <div><strong>Default Polish:</strong> ${door.finish}</div>
            <div><strong>Design Style:</strong> ${door.style}</div>
            <div><strong>Reference Size:</strong> ${door.dimensions}</div>
            <div><strong>Handle Compatibility:</strong> ${door.hardwareCompatibility}</div>
          </div>
          <div>
            <button class="btn btn-gold btn-full btn-sm" id="modalCustomiseBtn">
              <span>Customise This Door</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    quickViewModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const customiseBtn = document.getElementById('modalCustomiseBtn');
    if (customiseBtn) {
      customiseBtn.addEventListener('click', () => {
        closeQuickView();
        selectDoorForCustomisation(door);
      });
    }
  }

  function closeQuickView() {
    if (quickViewModal) {
      quickViewModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
  if (closeQuickViewBtn) closeQuickViewBtn.addEventListener('click', closeQuickView);
  if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) closeQuickView();
    });
  }

  // -----------------------------------------------------------
  // 10. Simplified Style Matcher (Teak, Black & Grey, Brown, Gold)
  // -----------------------------------------------------------
  const inspirationButtons = document.querySelectorAll('.interior-style-btn');
  const inspirationContainer = document.getElementById('inspirationRecommendationGrid');

  const inspirationMap = {
    'warm-natural': {
      title: 'Teak Wood Style',
      doors: ['HS-003', 'HS-005', 'HS-008']
    },
    'contemporary-minimalist': {
      title: 'Modern Black & Grey',
      doors: ['HS-004', 'HS-006', 'HS-010']
    },
    'classic-elegant': {
      title: 'Classic Brown Wood',
      doors: ['HS-007', 'HS-011', 'HS-015']
    },
    'bold-statement': {
      title: 'Luxury Golden Finish',
      doors: ['HS-009', 'HS-012', 'HS-016']
    }
  };

  function renderInspirationRecommendations(styleKey) {
    if (!inspirationContainer || !window.HS_CATALOG) return;
    const data = inspirationMap[styleKey];
    if (!data) return;

    const matchedDoors = window.HS_CATALOG.filter(d => data.doors.includes(d.id));

    inspirationContainer.innerHTML = matchedDoors.map(door => `
      <div class="door-card" style="margin-bottom: 0;">
        <div class="door-card-media">
          <img class="door-card-img" src="${door.thumb}" alt="${door.name}" loading="lazy">
        </div>
        <div class="door-card-body">
          <span class="door-card-code">${door.id}</span>
          <h4 style="font-family: var(--font-serif); font-size: 1.1rem; margin-block: 0.25rem;">${door.name}</h4>
          <p style="font-size: 0.75rem; color: rgba(33,33,30,0.7); margin-bottom: 0.75rem;">${door.finish}</p>
          <button class="btn btn-secondary btn-full btn-sm" data-action="customise" data-id="${door.id}">
            Select for Customisation
          </button>
        </div>
      </div>
    `).join('');

    inspirationContainer.querySelectorAll('button[data-action="customise"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const door = window.HS_CATALOG.find(d => d.id === btn.dataset.id);
        if (door) selectDoorForCustomisation(door);
      });
    });
  }

  inspirationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      inspirationButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const styleKey = btn.dataset.style;
      state.activeInspiration = styleKey;
      renderInspirationRecommendations(styleKey);
    });
  });

  // -----------------------------------------------------------
  // 11. FAQ Accordion
  // -----------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(other => {
          other.classList.remove('open');
          const otherTrigger = other.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // -----------------------------------------------------------
  // 12. Toast Feedback
  // -----------------------------------------------------------
  let toastTimer;
  function showToast(message) {
    if (!toastNotification) return;
    const textSpan = toastNotification.querySelector('span');
    if (textSpan) textSpan.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  // -----------------------------------------------------------
  // 13. Dynamic Data Injection (Showroom, Phone, Social Media)
  // -----------------------------------------------------------
  function injectShowroomDetails() {
    const cfg = window.HS_CONFIG || {};
    const showroom = cfg.showroom || {};
    const social = cfg.socialMedia || {};

    const elTopPhone = document.getElementById('topPhoneText');
    const elName = document.getElementById('showroomFacilityName');
    const elAddress = document.getElementById('showroomAddress');
    const elHours = document.getElementById('showroomHours');
    const elPhone = document.getElementById('showroomPhone');
    const elPhoneLink = document.getElementById('callShowroomBtn');
    const elWaLink = document.getElementById('showroomWhatsappBtn');
    const elDrawerWa = document.getElementById('drawerWhatsappBtn');
    const elDirectionsBtn = document.getElementById('showroomDirectionsBtn');

    if (elTopPhone && cfg.phoneDisplay) elTopPhone.textContent = `Call: ${cfg.phoneDisplay}`;
    if (elName && showroom.name) elName.textContent = showroom.name;
    if (elAddress && showroom.addressLine1) elAddress.textContent = `${showroom.addressLine1}, ${showroom.district}, ${showroom.country}`;
    if (elHours && showroom.hours) elHours.textContent = showroom.hours;
    if (elPhone) elPhone.textContent = `${cfg.phoneDisplay || '+91 98765 43210'} (Direct Call to Owner)`;

    if (elPhoneLink && cfg.phoneCallable) {
      elPhoneLink.href = `tel:${cfg.phoneCallable}`;
    }

    // Hook up social media links
    document.querySelectorAll('.ig-btn').forEach(a => { if (social.instagram) a.href = social.instagram; });
    document.querySelectorAll('.fb-btn').forEach(a => { if (social.facebook) a.href = social.facebook; });
    document.querySelectorAll('.yt-btn').forEach(a => { if (social.youtube) a.href = social.youtube; });

    if (elWaLink) {
      elWaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = `Hello H & S Doors,\n\nI would like to enquire about visiting your showroom to explore door designs in person.\n\nThank you.`;
        sendToWhatsAppWithMessage(msg, 'Showroom Visit Enquiry');
      });
    }

    if (elDrawerWa) {
      elDrawerWa.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = `Hello H & S Doors,\n\nI would like to enquire about your custom door and window designs.\n\nThank you.`;
        sendToWhatsAppWithMessage(msg, 'General Enquiry');
      });
    }

    if (elDirectionsBtn) {
      elDirectionsBtn.addEventListener('click', (e) => {
        if (showroom.googleMapsUrl) {
          window.open(showroom.googleMapsUrl, '_blank', 'noopener');
        } else {
          e.preventDefault();
          const msg = `Hello H & S Doors,\n\nCould you please share your showroom Google Maps location pin and directions?\n\nThank you.`;
          sendToWhatsAppWithMessage(msg, 'Directions Request');
        }
      });
    }

    // Home Page Showroom Elements
    const elHomeAddress = document.getElementById('homeShowroomAddress');
    const elHomeHours = document.getElementById('homeShowroomHours');
    const elHomePhone = document.getElementById('homeShowroomPhone');
    const elHomePhoneLink = document.getElementById('homeCallShowroomBtn');
    const elHomeWaLink = document.getElementById('homeShowroomWhatsappBtn');
    const elHomeDirectionsBtn = document.getElementById('homeShowroomDirectionsBtn');

    if (elHomeAddress && showroom.addressLine1) elHomeAddress.textContent = `${showroom.addressLine1}, ${showroom.district}, ${showroom.country}`;
    if (elHomeHours && showroom.hours) elHomeHours.textContent = showroom.hours;
    if (elHomePhone) elHomePhone.textContent = `${cfg.phoneDisplay || '+91 98765 43210'} (Direct Call to Owner)`;
    if (elHomePhoneLink && cfg.phoneCallable) elHomePhoneLink.href = `tel:${cfg.phoneCallable}`;

    if (elHomeWaLink) {
      elHomeWaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = `Hello H & S Doors,\n\nI would like to enquire about visiting your showroom to explore door and window designs in person.\n\nThank you.`;
        sendToWhatsAppWithMessage(msg, 'Showroom Visit Enquiry');
      });
    }

    if (elHomeDirectionsBtn) {
      elHomeDirectionsBtn.addEventListener('click', (e) => {
        if (showroom.googleMapsUrl) {
          window.open(showroom.googleMapsUrl, '_blank', 'noopener');
        } else {
          e.preventDefault();
          const msg = `Hello H & S Doors,\n\nCould you please share your showroom Google Maps location pin and directions?\n\nThank you.`;
          sendToWhatsAppWithMessage(msg, 'Directions Request');
        }
      });
    }

    if (!cfg.whatsappNumber && whatsappNotice) {
      whatsappNotice.classList.add('visible');
    }
  }

  // -----------------------------------------------------------
  // 14. Scroll-Triggered Reveal Observer (Safe Initialization)
  // -----------------------------------------------------------
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-loaded');

    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        scrollObserver.observe(el);
      }
    });
  } else {
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => el.classList.add('is-visible'));
  }

  // -----------------------------------------------------------
  // 15. Initial Bootstrapping
  // -----------------------------------------------------------
  renderCatalogue();
  renderWindows();
  renderDesignPickerGrid();
  updateWizardUI();
  renderInspirationRecommendations('warm-natural');
  injectShowroomDetails();
});
