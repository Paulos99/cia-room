(function () {
  'use strict';

  function initFormVisual() {
    const container = document.getElementById('form-visual');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const chaosLines = [];
    for (let i = 0; i < 12; i++) {
      const x1 = 50 + Math.random() * 300;
      const y1 = 50 + Math.random() * 300;
      const x2 = 50 + Math.random() * 300;
      const y2 = 50 + Math.random() * 300;
      chaosLines.push(`<line class="chaos-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(120,180,255,0.3)" stroke-width="1"/>`);
    }

    svg.innerHTML = `
      ${chaosLines.join('')}
      <rect id="form-contour" x="100" y="100" width="200" height="200" fill="none" stroke="#2F7DFF" stroke-width="1.5" opacity="0"/>
      <polygon id="form-shape" points="100,200 200,100 300,200 200,300" fill="rgba(47,125,255,0.05)" stroke="#78B4FF" stroke-width="1" opacity="0"/>
      <text x="100" y="80" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="10">SCAN → PROJECT</text>
    `;
    container.appendChild(svg);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.to('.chaos-line', {
          opacity: 0.1,
          scrollTrigger: { trigger: '#lead', start: 'top 80%', end: 'top 30%', scrub: 1 },
        });
        gsap.to('#form-contour', {
          opacity: 1,
          scrollTrigger: { trigger: '#lead', start: 'top 70%', end: 'top 20%', scrub: 1 },
        });
        gsap.to('#form-shape', {
          opacity: 1,
          scrollTrigger: { trigger: '#lead', start: 'top 60%', end: 'top 10%', scrub: 1 },
        });
      } else {
        document.getElementById('form-contour')?.setAttribute('opacity', '1');
        document.getElementById('form-shape')?.setAttribute('opacity', '1');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormVisual);
  } else {
    initFormVisual();
  }
})();
