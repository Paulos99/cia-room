(function () {
  'use strict';

  const SCHEMATICS = {
    apartment: '<rect x="20" y="20" width="160" height="50" fill="none" stroke="rgba(255,255,255,0.2)"/><rect x="20" y="80" width="75" height="50" fill="none" stroke="rgba(255,255,255,0.2)"/><rect x="105" y="80" width="75" height="50" fill="none" stroke="rgba(255,255,255,0.2)"/><circle cx="100" cy="45" r="3" fill="#2F7DFF"/>',
    house: '<polygon points="100,15 170,55 30,55" fill="none" stroke="rgba(255,255,255,0.2)"/><rect x="40" y="55" width="120" height="70" fill="none" stroke="rgba(255,255,255,0.2)"/><line x1="100" y1="55" x2="100" y2="125" stroke="rgba(255,255,255,0.1)"/>',
    studio: '<rect x="30" y="30" width="140" height="90" fill="none" stroke="rgba(255,255,255,0.2)"/><path d="M50 90 Q100 60 150 90" fill="none" stroke="#78B4FF" stroke-width="1"/><rect x="70" y="100" width="60" height="15" fill="rgba(47,125,255,0.1)" stroke="#2F7DFF"/>',
    office: '<rect x="25" y="25" width="150" height="100" fill="none" stroke="rgba(255,255,255,0.2)"/><rect x="110" y="35" width="55" height="40" fill="rgba(47,125,255,0.08)" stroke="#2F7DFF"/><line x1="25" y1="75" x2="175" y2="75" stroke="rgba(255,255,255,0.08)"/>',
    horeca: '<rect x="20" y="40" width="160" height="70" fill="none" stroke="rgba(255,255,255,0.2)"/><ellipse cx="60" cy="75" rx="25" ry="15" fill="none" stroke="rgba(255,255,255,0.15)"/><ellipse cx="140" cy="75" rx="25" ry="15" fill="none" stroke="rgba(255,255,255,0.15)"/>',
    industrial: '<rect x="30" y="50" width="140" height="60" fill="none" stroke="rgba(255,255,255,0.2)"/><rect x="50" y="65" width="40" height="30" fill="rgba(47,125,255,0.1)" stroke="#2F7DFF"/><circle cx="130" cy="80" r="12" fill="none" stroke="#78B4FF"/>',
  };

  function initObjectTypes() {
    const grid = document.getElementById('objects-grid');
    if (!grid) return;

    grid.querySelectorAll('[data-schematic]').forEach((el) => {
      const type = el.dataset.schematic;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 200 140');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.innerHTML = SCHEMATICS[type] || '';
      el.appendChild(svg);
    });

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
