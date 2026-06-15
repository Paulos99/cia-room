(function () {
  'use strict';

  const PATHS = [
    { id: 'path-ceiling', d: 'M80 60 L220 60 L220 140', color: '#2F7DFF', reason: 0 },
    { id: 'path-wall', d: 'M60 80 L60 200 L180 200', color: '#78B4FF', reason: 1 },
    { id: 'path-flank', d: 'M280 100 L320 100 L320 180 L200 180', color: '#607080', reason: 2 },
    { id: 'path-vent', d: 'M140 40 L140 20 L200 20 L200 60', color: '#2F7DFF', reason: 3 },
  ];

  function initNoisePath() {
    const container = document.getElementById('noise-path-diagram');
    const reasons = document.querySelectorAll('.why__reason');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 360 360');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    svg.innerHTML = `
      <rect x="60" y="60" width="240" height="200" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <line x1="60" y1="160" x2="300" y2="160" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <line x1="180" y1="60" x2="180" y2="260" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <rect x="60" y="60" width="120" height="100" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)"/>
      <rect x="180" y="160" width="120" height="100" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)"/>
      <circle cx="100" cy="100" r="8" fill="#2F7DFF" opacity="0.8"/>
      <text x="115" y="104" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="9">SRC</text>
      ${PATHS.map(
        (p) =>
          `<path id="${p.id}" d="${p.d}" fill="none" stroke="${p.color}" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>`
      ).join('')}
      <text x="60" y="50" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="10">NOISE ROUTING / PLAN</text>
    `;
    container.appendChild(svg);

    function highlightPath(index) {
      PATHS.forEach((p) => {
        const el = svg.getElementById(p.id);
        if (el) el.setAttribute('opacity', p.reason === index ? '1' : '0.15');
      });
      reasons.forEach((r, i) => {
        r.classList.toggle('is-active', i === index);
      });
    }

    reasons.forEach((reason, index) => {
      reason.addEventListener('mouseenter', () => highlightPath(index));
      reason.addEventListener('focus', () => highlightPath(index));
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        ScrollTrigger.create({
          trigger: '#why',
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(3, Math.floor(self.progress * 4));
            highlightPath(idx);
          },
        });
      } else {
        highlightPath(0);
      }
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
