(function () {
  'use strict';

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function initObjectsCarousel() {
    const grid = document.getElementById('objects-grid');
    const counter = document.getElementById('objects-counter');
    if (!grid || !counter) return;

    const cards = grid.querySelectorAll('.object-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
    });

    const updateCounter = () => {
      if (!isMobile()) return;
      const gridRect = grid.getBoundingClientRect();
      const center = gridRect.left + gridRect.width * 0.35;
      let activeIndex = 0;
      let minDist = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = index;
        }
      });

      counter.textContent = `${activeIndex + 1} / ${cards.length}`;
    };

    grid.addEventListener('scroll', () => {
      requestAnimationFrame(updateCounter);
    }, { passive: true });

    updateCounter();
    window.addEventListener('resize', updateCounter);
  }

  function initPrinciplesCarousel() {
    const grid = document.getElementById('principles-grid');
    const counter = document.getElementById('principles-counter');
    if (!grid || !counter) return;

    const cards = grid.querySelectorAll('.principle');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
    });

    const updateCounter = () => {
      if (!isMobile()) return;
      const gridRect = grid.getBoundingClientRect();
      const center = gridRect.left + gridRect.width * 0.35;
      let activeIndex = 0;
      let minDist = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = index;
        }
      });

      counter.textContent = `${activeIndex + 1} / ${cards.length}`;
    };

    grid.addEventListener('scroll', () => {
      requestAnimationFrame(updateCounter);
    }, { passive: true });

    updateCounter();
    window.addEventListener('resize', updateCounter);
  }

  function initFormFocusCta() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    const onFocusIn = (e) => {
      if (!isMobile()) return;
      if (e.target.matches('input, textarea, select')) {
        document.body.classList.add('form-focus');
      }
    };

    const onFocusOut = () => {
      requestAnimationFrame(() => {
        if (!form.contains(document.activeElement)) {
          document.body.classList.remove('form-focus');
        }
      });
    };

    form.addEventListener('focusin', onFocusIn);
    form.addEventListener('focusout', onFocusOut);
  }

  function initServicesCarousel() {
    const showcase = document.getElementById('services-showcase');
    const counter = document.getElementById('services-counter');
    if (!showcase || !counter) return;

    const panels = showcase.querySelectorAll('.service-panel');
    if (!panels.length) return;

    panels.forEach((panel) => {
      panel.style.removeProperty('transform');
      panel.querySelectorAll('.service-panel__media, .service-panel__body').forEach((el) => {
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
      });
    });

    const updateFromScroll = () => {
      if (!isMobile()) return;

      const rect = showcase.getBoundingClientRect();
      const center = rect.left + rect.width * 0.35;
      let activeIndex = 0;
      let minDist = Infinity;
      let activePanel = null;

      panels.forEach((panel, index) => {
        const pr = panel.getBoundingClientRect();
        const pc = pr.left + pr.width / 2;
        const dist = Math.abs(pc - center);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = index;
          activePanel = panel;
        }
      });

      counter.textContent = `${activeIndex + 1} / ${panels.length}`;

      if (activePanel && window.CIA_SET_SERVICE) {
        const target = activePanel.dataset.service;
        const current = showcase.querySelector('.service-panel.is-active');
        if (current !== activePanel && target) {
          window.CIA_SET_SERVICE(target, { scroll: false });
        }
      }
    };

    showcase.addEventListener('scroll', () => {
      requestAnimationFrame(updateFromScroll);
    }, { passive: true });

    updateFromScroll();
    window.addEventListener('resize', updateFromScroll);
  }

  function initServicePanelsMobile() {
    if (!isMobile()) return;

    document.querySelectorAll('.service-panel').forEach((panel) => {
      const toggle = panel.querySelector('.service-panel__toggle');
      const details = panel.querySelector('.service-panel__details');
      if (!toggle || !details) return;
      toggle.setAttribute('aria-expanded', 'false');
      details.hidden = true;
    });
  }

  function boot() {
    initObjectsCarousel();
    initServicesCarousel();
    initPrinciplesCarousel();
    initFormFocusCta();
    initServicePanelsMobile();
    window.addEventListener('resize', () => {
      if (isMobile()) initServicePanelsMobile();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
