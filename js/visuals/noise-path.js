(function () {
  'use strict';

  const PATHS = [
    {
      id: 'np-ceiling',
      d: 'M100 130 L100 70 L220 70 L220 130',
      label: 'через перекрытие',
      lx: 130, ly: 58,
      reason: 0,
      color: '#2F7DFF',
    },
    {
      id: 'np-wall',
      d: 'M100 130 L40 130 L40 200 L100 200',
      label: 'через стену',
      lx: 8, ly: 168,
      reason: 1,
      color: '#78B4FF',
    },
    {
      id: 'np-flank',
      d: 'M220 130 L280 130 L280 200 L180 200',
      label: 'обходной путь',
      lx: 248, ly: 168,
      reason: 2,
      color: '#94A0AA',
    },
    {
      id: 'np-vent',
      d: 'M160 130 L160 40 L240 40 L240 90',
      label: 'вентиляция',
      lx: 200, ly: 28,
      reason: 3,
      color: '#2F7DFF',
    },
  ];

  function initNoisePath() {
    const container = document.getElementById('noise-path-diagram');
    const reasons = document.querySelectorAll('.why__reason');
    if (!container || !window.CIAViz) return;

    const r = CIAViz.reduced();
    const pulses = r ? '' : PATHS.map((p, i) =>
      CIAViz.pulseDot(p.d, p.color, '2.8s', `${i * 0.4}s`)
    ).join('');

    const pathEls = PATHS.map((p) => `
      <g class="noise-path-group" data-reason="${p.reason}">
        <path id="${p.id}" d="${p.d}" fill="none" stroke="${p.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.2"/>
        <text x="${p.lx}" y="${p.ly}" class="viz-label noise-path-label" opacity="0">${p.label}</text>
      </g>
    `).join('');

    const svg = CIAViz.mount(container, '0 0 320 280', `
      <text x="16" y="22" class="viz-label">ПЛАН КВАРТИРЫ · МАРШРУТЫ ШУМА</text>

      <!-- Корпус -->
      <rect x="40" y="40" width="240" height="200" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <line x1="160" y1="40" x2="160" y2="240" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <line x1="40" y1="140" x2="280" y2="140" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

      <!-- Комнаты -->
      <text x="85" y="95" class="viz-label">гостиная</text>
      <text x="195" y="95" class="viz-label">спальня</text>
      <text x="85" y="195" class="viz-label">кухня</text>
      <text x="195" y="195" class="viz-label">санузел</text>

      <!-- Источник -->
      <circle cx="100" cy="130" r="12" fill="rgba(47,125,255,0.15)" stroke="#2F7DFF" stroke-width="1.5"/>
      <circle cx="100" cy="130" r="5" fill="#2F7DFF">
        ${r ? '' : '<animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>'}
      </circle>
      <text x="118" y="134" class="viz-label viz-label--active">источник</text>

      ${pathEls}
      ${pulses}

      <text x="16" y="268" class="viz-label">наведите на пункт справа</text>
    `);

    function highlightPath(index) {
      PATHS.forEach((p) => {
        const path = svg.getElementById(p.id);
        const label = svg.querySelector(`[data-reason="${p.reason}"] .noise-path-label`);
        const active = p.reason === index;
        if (path) {
          path.setAttribute('opacity', active ? '1' : '0.12');
          path.setAttribute('stroke-width', active ? '2.5' : '1.5');
        }
        if (label) label.setAttribute('opacity', active ? '1' : '0');
      });
      reasons.forEach((el, i) => el.classList.toggle('is-active', i === index));
    }

    reasons.forEach((reason, index) => {
      reason.addEventListener('mouseenter', () => highlightPath(index));
      reason.addEventListener('focus', () => highlightPath(index));
      reason.addEventListener('click', () => highlightPath(index));
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !r) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: '#why',
        start: 'top 55%',
        end: 'bottom 45%',
        scrub: 0.8,
        onUpdate: (self) => highlightPath(Math.min(3, Math.floor(self.progress * 4))),
      });
    } else {
      highlightPath(0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNoisePath);
  } else {
    initNoisePath();
  }
})();
