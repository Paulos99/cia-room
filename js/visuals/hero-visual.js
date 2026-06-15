(function () {
  'use strict';

  function initHeroVisual() {
    const container = document.getElementById('hero-visual');
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const waveCount = isMobile ? 3 : 6;
    let waves = '';
    for (let i = 0; i < waveCount; i++) {
      const y = 120 + i * 35;
      waves += `<path class="hero-wave" d="M0 ${y} Q125 ${y - 20} 250 ${y} T500 ${y}" fill="none" stroke="rgba(120,180,255,0.25)" stroke-width="1"/>`;
    }

    svg.innerHTML = `
      <defs>
        <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(47,125,255,0)"/>
          <stop offset="50%" stop-color="rgba(47,125,255,0.3)"/>
          <stop offset="100%" stop-color="rgba(47,125,255,0)"/>
        </linearGradient>
      </defs>
      <polygon points="80,280 420,280 380,120 120,120" fill="rgba(18,25,32,0.8)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <polygon points="120,120 380,120 360,80 140,80" fill="rgba(18,25,32,0.6)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <line x1="80" y1="280" x2="420" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <rect x="350" y="200" width="30" height="80" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="M350 200 L380 200 L380 240 L350 260" fill="none" stroke="#2F7DFF" stroke-width="1.5"/>
      ${waves}
      <circle class="hero-point" cx="200" cy="200" r="5" fill="#2F7DFF"/>
      <circle class="hero-point" cx="320" cy="160" r="4" fill="#78B4FF"/>
      <circle class="hero-point" cx="150" cy="240" r="4" fill="#78B4FF"/>
      <rect id="hero-scan" x="0" y="0" width="40" height="400" fill="url(#scanGrad)" opacity="0"/>
      <text x="90" y="300" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="10">SECTION A-A</text>
      <text x="90" y="315" fill="#607080" font-family="IBM Plex Mono, monospace" font-size="9">NODE / J-04</text>
    `;
    container.appendChild(svg);

    if (reduced) return;

    let rafId = null;
    container.addEventListener('pointermove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 500;
        const waves = svg.querySelectorAll('.hero-wave');
        waves.forEach((w, i) => {
          const offset = Math.sin(x * 0.02 + i) * 8;
          const baseY = 120 + i * 35;
          w.setAttribute('d', `M0 ${baseY + offset} Q125 ${baseY - 20 + offset} 250 ${baseY + offset} T500 ${baseY + offset}`);
        });
        rafId = null;
      });
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to('#hero-scan', {
        x: 460,
        opacity: 0.6,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
      gsap.to('.hero-wave', {
        stroke: 'rgba(47,125,255,0.5)',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVisual);
  } else {
    initHeroVisual();
  }
})();
