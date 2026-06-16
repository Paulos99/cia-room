(function () {
  'use strict';

  const SCHEMATICS = {
    apartment: {
      viewBox: '0 0 200 120',
      html: `
        <rect x="10" y="10" width="180" height="100" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)"/>
        <line x1="100" y1="10" x2="100" y2="110" stroke="rgba(255,255,255,0.08)"/>
        <line x1="10" y1="55" x2="190" y2="55" stroke="rgba(255,255,255,0.08)"/>
        <text x="35" y="40" class="viz-label">зал</text>
        <text x="125" y="40" class="viz-label">спальня</text>
        <text x="35" y="85" class="viz-label">кухня</text>
        <circle cx="55" cy="35" r="5" fill="#2F7DFF" opacity="0.8"/>
        <path class="obj-path" d="M55 35 L100 35 L100 75" fill="none" stroke="#2F7DFF" stroke-width="1.5" opacity="0.6"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#2F7DFF"><animateMotion path="M55 35 L100 35 L100 75" dur="2.5s" repeatCount="indefinite"/></circle>'}
      `,
    },
    house: {
      viewBox: '0 0 200 120',
      html: `
        <polygon points="100,8 175,45 25,45" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)"/>
        <rect x="35" y="45" width="130" height="65" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <line x1="100" y1="45" x2="100" y2="110" stroke="rgba(255,255,255,0.08)"/>
        <line x1="35" y1="78" x2="165" y2="78" stroke="rgba(255,255,255,0.06)"/>
        <text x="50" y="68" class="viz-label">1 этаж</text>
        <text x="115" y="68" class="viz-label">2 этаж</text>
        <path d="M100 78 L100 45" stroke="#2F7DFF" stroke-width="1.5" stroke-dasharray="4 2"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#2F7DFF"><animateMotion path="M100 95 L100 55" dur="2s" repeatCount="indefinite"/></circle>'}
      `,
    },
    studio: {
      viewBox: '0 0 200 120',
      html: `
        <rect x="20" y="15" width="160" height="90" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M40 85 Q100 45 160 85" fill="none" stroke="#78B4FF" stroke-width="1" opacity="0.5"/>
        <rect x="75" y="90" width="50" height="12" fill="rgba(47,125,255,0.1)" stroke="#2F7DFF"/>
        <text x="30" y="35" class="viz-label">микрофон</text>
        <circle cx="45" cy="40" r="4" fill="#2F7DFF"/>
        <path d="M45 44 Q100 60 155 44" fill="none" stroke="#2F7DFF" stroke-width="1" opacity="0.4"/>
        ${CIAViz.reduced() ? '' : '<circle r="2" fill="#78B4FF"><animateMotion path="M45 44 Q100 60 155 44" dur="2.5s" repeatCount="indefinite"/></circle>'}
      `,
    },
    office: {
      viewBox: '0 0 200 120',
      html: `
        <rect x="15" y="15" width="170" height="90" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <rect x="120" y="25" width="55" height="45" fill="rgba(47,125,255,0.08)" stroke="#2F7DFF"/>
        <text x="128" y="52" class="viz-label">переговорная</text>
        <line x1="15" y1="70" x2="185" y2="70" stroke="rgba(255,255,255,0.06)"/>
        <path d="M80 70 L120 50" stroke="#78B4FF" stroke-width="1" stroke-dasharray="4 3"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#78B4FF"><animateMotion path="M80 70 L120 50" dur="2s" repeatCount="indefinite"/></circle>'}
      `,
    },
    horeca: {
      viewBox: '0 0 200 120',
      html: `
        <rect x="15" y="25" width="170" height="75" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <ellipse cx="60" cy="65" rx="35" ry="18" fill="none" stroke="rgba(255,255,255,0.1)"/>
        <ellipse cx="140" cy="65" rx="35" ry="18" fill="none" stroke="rgba(255,255,255,0.1)"/>
        <text x="45" y="68" class="viz-label">зал</text>
        <text x="125" y="68" class="viz-label">кухня</text>
        <rect x="95" y="55" width="10" height="20" fill="rgba(47,125,255,0.15)" stroke="#2F7DFF"/>
        <path d="M140 65 L105 65" stroke="#2F7DFF" stroke-width="1.5"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#2F7DFF"><animateMotion path="M140 65 L105 65" dur="1.8s" repeatCount="indefinite"/></circle>'}
      `,
    },
    industrial: {
      viewBox: '0 0 200 120',
      html: `
        <rect x="20" y="30" width="160" height="70" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)"/>
        <rect x="40" y="50" width="45" height="35" fill="rgba(47,125,255,0.1)" stroke="#2F7DFF"/>
        <text x="48" y="72" class="viz-label">агрегат</text>
        <circle cx="130" cy="65" r="14" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="3 4"/>
        <text x="115" y="95" class="viz-label">зона контроля</text>
        <path d="M85 67 L116 67" stroke="#2F7DFF" stroke-width="1.5"/>
        ${CIAViz.reduced() ? '' : '<circle r="2.5" fill="#2F7DFF"><animateMotion path="M85 67 L116 67" dur="2s" repeatCount="indefinite"/></circle>'}
      `,
    },
  };

  function initObjectTypes() {
    const grid = document.getElementById('objects-grid');
    if (!grid || !window.CIAViz) return;

    grid.querySelectorAll('[data-schematic]').forEach((el) => {
      const type = el.dataset.schematic;
      const spec = SCHEMATICS[type];
      if (!spec) return;
      CIAViz.mount(el, spec.viewBox, spec.html);
    });

    const cards = grid.querySelectorAll('.object-card');
    cards.forEach((card) => {
      const activate = () => {
        cards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');
        card.querySelectorAll('.obj-path').forEach((p) => p.setAttribute('opacity', '1'));
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
