(function () {
  'use strict';

  function initFormVisual() {
    const container = document.getElementById('form-visual');
    if (!container || !window.CIAViz) return;

    const r = CIAViz.reduced();

    const waves = [];
    for (let i = 0; i < 5; i++) {
      const y = 60 + i * 28;
      waves.push(`<path class="form-wave" d="M30 ${y} Q80 ${y - 18} 130 ${y} T230 ${y}" fill="none" stroke="rgba(120,180,255,0.35)" stroke-width="1"/>`);
    }

    const svg = CIAViz.mount(container, '0 0 400 400', `
      <defs>
        <linearGradient id="formScan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(47,125,255,0)"/>
          <stop offset="50%" stop-color="rgba(47,125,255,0.2)"/>
          <stop offset="100%" stop-color="rgba(47,125,255,0)"/>
        </linearGradient>
        <clipPath id="formRoomClip">
          <polygon points="220,120 340,120 340,280 220,280"/>
        </clipPath>
      </defs>
      <text x="20" y="28" class="viz-label">СИГНАЛ → СКАНИРОВАНИЕ → ПРОЕКТ</text>

      <!-- Хаотичный сигнал -->
      <g id="form-chaos" opacity="1">
        ${waves.join('')}
        <text x="30" y="220" class="viz-label">исходный сигнал</text>
      </g>

      <!-- Линия сканирования -->
      <rect id="form-scanner" x="130" y="40" width="50" height="320" fill="url(#formScan)" opacity="0.8">
        ${r ? '' : '<animate attributeName="x" values="130;200;130" dur="4s" repeatCount="indefinite"/>'}
      </rect>
      <text x="145" y="370" class="viz-label">анализ</text>

      <!-- Структурированный контур помещения -->
      <g id="form-structure" opacity="0.3">
        <polygon points="220,120 340,120 340,280 220,280" fill="rgba(47,125,255,0.06)" stroke="#2F7DFF" stroke-width="1.5"/>
        <line x1="220" y1="160" x2="340" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="220" y1="200" x2="340" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="220" y1="240" x2="340" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="260" y1="120" x2="260" y2="280" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="300" y1="120" x2="300" y2="280" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <circle cx="250" cy="180" r="4" fill="#2F7DFF"/>
        <circle cx="310" cy="220" r="4" fill="#78B4FF"/>
        <text x="230" y="300" class="viz-label viz-label--active">проектный контур</text>
      </g>

      <!-- Спектр -->
      <g id="form-spectrum" clip-path="url(#formRoomClip)" opacity="0.5">
        ${[0,1,2,3,4,5,6].map((i) => `<rect x="${225 + i * 16}" y="${200 - i * 8}" width="10" height="${40 + i * 12}" fill="rgba(47,125,255,${0.15 + i * 0.05})"/>`).join('')}
      </g>

      <path d="M200 200 L220 200" stroke="#607080" stroke-width="1" stroke-dasharray="3 3"/>
    `);

    if (!r) {
      const chaos = svg.getElementById('form-chaos');
      const structure = svg.getElementById('form-structure');
      const spectrum = svg.getElementById('form-spectrum');

      const tl = () => {
        if (typeof gsap === 'undefined') return;
        gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
          .to(chaos, { opacity: 0.2, duration: 2, ease: 'power1.inOut' })
          .to(structure, { opacity: 1, duration: 2, ease: 'power1.inOut' }, '<')
          .to(spectrum, { opacity: 0.9, duration: 1.5 }, '-=1')
          .to(chaos, { opacity: 1, duration: 2 })
          .to(structure, { opacity: 0.3, duration: 2 }, '<')
          .to(spectrum, { opacity: 0.4, duration: 1.5 }, '<');
      };

      if (typeof gsap !== 'undefined') {
        tl();
      } else {
        structure?.setAttribute('opacity', '1');
      }
    } else {
      svg.getElementById('form-structure')?.setAttribute('opacity', '1');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormVisual);
  } else {
    initFormVisual();
  }
})();
