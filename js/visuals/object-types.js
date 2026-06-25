(function () {
  'use strict';

  function initObjectTypes() {
    const grid = document.getElementById('objects-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.object-card');
    cards.forEach((card) => {
      const activate = () => {
        cards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');
        if (window.CIAAnalytics) {
          window.CIAAnalytics.track('object_type_select', { type: card.dataset.object });
        }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObjectTypes);
  } else {
    initObjectTypes();
  }
})();
