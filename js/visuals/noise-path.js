(function () {
  'use strict';

  const PATHS = [
    {
      id: 'np-ceiling',
      d: 'M100 130 L100 70 L220 70 L220 130',
      label: 'через перекрытие',
      lx: 128,
      ly: 58,
      reason: 0,
      color: '#2F7DFF',
    },
    {
      id: 'np-wall',
      d: 'M100 130 L40 130 L40 200 L100 200',
      label: 'через стену',
      lx: 8,
      ly: 168,
      reason: 1,
      color: '#78B4FF',
    },
    {
      id: 'np-flank',
      d: 'M220 130 L280 130 L280 200 L180 200',
      label: 'фланговый путь',
      lx: 248,
      ly: 168,
      reason: 2,
      color: '#94A0AA',
    },
    {
      id: 'np-vent',
      d: 'M160 130 L160 40 L240 40 L240 90',
      label: 'вентиляция',
      lx: 200,
      ly: 28,
      reason: 3,
      color: '#2F7DFF',
    },
  ];

  function initNoisePath() {
    const container = document.getElementById('noise-path-diagram');
    const reasons = document.querySelectorAll('.why__reason');
    if (!container || !window.CIAViz) return;

    const V = window.CIAViz;
    const r = V.reduced();
    const pulses = r
      ? ''
      : PATHS.map((p, i) => V.movingDot(p.d, p.color, '2.8s', `${i * 0.4}s`)).join('');

    const pathEls = PATHS.map(
      (p) => `
      <g class="noise-path-group" data-reason="${p.reason}">
        <path id="${p.id}" d="${p.d}" class="viz-path" stroke="${p.color}" opacity="0.18"/>
        <text x="${p.lx}" y="${p.ly}" class="viz-label viz-label--caption noise-path-label" opacity="0.35">${p.label}</text>
      </g>
    `
    ).join('');

    const svg = V.mount(
      container,
      '0 0 320 280',
      `
      <text x="16" y="22" class="viz-label viz-label--title">ПЛАН КВАРТИРЫ · МАРШРУТЫ ШУМА</text>

      <rect x="40" y="40" width="240" height="200" class="viz-frame" rx="2"/>
      <line x1="160" y1="40" x2="160" y2="240" class="viz-line"/>
      <line x1="40" y1="140" x2="280" y2="140" class="viz-line"/>

      <text x="100" y="98" class="viz-label viz-label--room" text-anchor="middle">гостиная</text>
      <text x="220" y="98" class="viz-label viz-label--room" text-anchor="middle">спальня</text>
      <text x="100" y="198" class="viz-label viz-label--room" text-anchor="middle">кухня</text>
      <text x="220" y="198" class="viz-label viz-label--room" text-anchor="middle">санузел</text>

      <circle cx="100" cy="130" r="14" fill="rgba(47,125,255,0.12)" stroke="#2F7DFF" stroke-width="1.5"/>
      <circle cx="100" cy="130" r="5" fill="#2F7DFF">
        ${r ? '' : '<animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>'}
      </circle>
      <text x="100" y="112" class="viz-label viz-label--active" text-anchor="middle">источник</text>
      ${r ? '' : V.impactRipples(100, 130)}

      ${pathEls}
      ${pulses}

      ${V.pathLegend(16, 248)}
      <text x="130" y="268" class="viz-label viz-label--caption">наведите на пункт справа</text>
    `
    );

    function highlightPath(index) {
      PATHS.forEach((p) => {
        const path = svg.getElementById(p.id);
        const label = svg.querySelector(`[data-reason="${p.reason}"] .noise-path-label`);
        const active = p.reason === index;
        if (path) {
          path.setAttribute('opacity', active ? '1' : '0.14');
          path.setAttribute('stroke-width', active ? '2.5' : '1.6');
        }
        if (label) label.setAttribute('opacity', active ? '1' : '0.35');
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
