(function () {
  'use strict';

  function initReportVisual() {
    const container = document.getElementById('report-visual');
    if (!container) return;
    if (container.querySelector('.media-slot')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.innerHTML = `
      <rect x="20" y="20" width="260" height="360" fill="rgba(8,11,14,0.5)" stroke="rgba(255,255,255,0.12)"/>
      <line class="report-line" x1="40" y1="50" x2="120" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <line class="report-line" x1="40" y1="70" x2="200" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line class="report-line" x1="40" y1="85" x2="180" y2="85" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <rect class="report-block" x="40" y="110" width="100" height="80" fill="none" stroke="rgba(255,255,255,0.12)"/>
      <rect class="report-block" x="150" y="110" width="110" height="80" fill="none" stroke="rgba(255,255,255,0.12)"/>
      <path class="report-path" d="M40 220 L260 220" stroke="rgba(255,255,255,0.1)"/>
      <path class="report-path" d="M40 250 L200 250" stroke="rgba(255,255,255,0.1)"/>
      <path class="report-path" d="M40 280 L240 280" stroke="rgba(255,255,255,0.1)"/>
      <circle class="report-point" cx="60" cy="320" r="3" fill="#2F7DFF"/>
      <circle class="report-point" cx="100" cy="340" r="3" fill="#78B4FF"/>
      <circle class="report-point" cx="140" cy="330" r="3" fill="#2F7DFF"/>
      <text x="40" y="40" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="9">REPORT / STRUCTURE</text>
    `;
    container.insertBefore(svg, container.firstChild);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from('.report-line', {
          scaleX: 0,
          transformOrigin: 'left',
          stagger: 0.1,
          duration: 0.6,
          scrollTrigger: { trigger: '#result', start: 'top 70%' },
        });
        gsap.from('.report-block', {
          opacity: 0,
          y: 10,
          stagger: 0.15,
          duration: 0.5,
          scrollTrigger: { trigger: '#result', start: 'top 60%' },
        });
        gsap.from('.report-point', {
          scale: 0,
          stagger: 0.1,
          duration: 0.4,
          scrollTrigger: { trigger: '#result', start: 'top 50%' },
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportVisual);
  } else {
    initReportVisual();
  }
})();
