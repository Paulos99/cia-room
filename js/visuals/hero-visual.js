(function () {
  'use strict';

  function initHeroVisual() {
    const container = document.getElementById('hero-visual');
    if (!container || !window.CIAViz) return;

    const r = CIAViz.reduced();
    const motion = r ? '' : `
      <circle r="3" fill="#2F7DFF"><animateMotion path="M60 200 L200 200 L280 140" dur="3s" repeatCount="indefinite"/></circle>
      <circle r="3" fill="#78B4FF"><animateMotion path="M60 200 L200 200 L320 220" dur="3.5s" begin="0.5s" repeatCount="indefinite"/></circle>
      <rect x="0" y="0" width="60" height="400" fill="url(#heroScan)" opacity="0.5">
        <animate attributeName="x" from="-60" to="500" dur="4s" repeatCount="indefinite"/>
      </rect>
    `;

    const svg = CIAViz.mount(container, '0 0 500 380', `
      <defs>
        <linearGradient id="heroScan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(47,125,255,0)"/>
          <stop offset="50%" stop-color="rgba(47,125,255,0.25)"/>
          <stop offset="100%" stop-color="rgba(47,125,255,0)"/>
        </linearGradient>
        <pattern id="heroHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <text x="24" y="28" class="viz-label">СЕЧЕНИЕ A-A · ИССЛЕДОВАНИЕ КОНСТРУКЦИИ</text>

      <!-- Пол -->
      <polygon points="60,280 400,280 360,300 100,300" fill="#121920" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <!-- Задняя стена -->
      <polygon points="100,120 360,120 360,280 100,280" fill="url(#heroHatch)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <!-- Потолок -->
      <polygon points="100,120 360,120 340,100 120,100" fill="#0D1217" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <!-- Передняя грань -->
      <polygon points="60,280 100,280 100,120 60,200" fill="rgba(18,25,32,0.9)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>

      <!-- Слои стены (передняя) -->
      <line x1="72" y1="140" x2="88" y2="260" stroke="rgba(120,180,255,0.35)" stroke-width="1" stroke-dasharray="3 4"/>
      <line x1="80" y1="140" x2="96" y2="260" stroke="rgba(120,180,255,0.2)" stroke-width="1" stroke-dasharray="3 4"/>

      <!-- Узел примыкания -->
      <rect x="330" y="200" width="36" height="80" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="4 3"/>
      <path d="M330 200 L366 200 L366 240 L330 260" fill="rgba(47,125,255,0.08)" stroke="#2F7DFF" stroke-width="1"/>

      <!-- Источник и приёмник -->
      <circle cx="60" cy="200" r="10" fill="rgba(47,125,255,0.15)" stroke="#2F7DFF" stroke-width="1"/>
      <text x="42" y="230" class="viz-label">ИСТОЧНИК</text>
      <circle cx="340" cy="160" r="8" fill="rgba(120,180,255,0.12)" stroke="#78B4FF" stroke-width="1"/>
      <text x="310" y="148" class="viz-label">ТОЧКА ИЗМЕРЕНИЯ</text>

      <!-- Пути сигнала -->
      <path id="hero-path-main" d="M60 200 L200 200 L280 140" fill="none" stroke="#2F7DFF" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
      <path id="hero-path-bypass" d="M60 200 L200 200 L320 220" fill="none" stroke="#78B4FF" stroke-width="1" stroke-dasharray="6 4" opacity="0.5"/>
      <path d="M280 140 L320 220" fill="none" stroke="rgba(96,112,128,0.5)" stroke-width="1" stroke-dasharray="2 4"/>

      <!-- Точки измерения -->
      <circle cx="200" cy="200" r="5" fill="#2F7DFF"><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="280" cy="140" r="4" fill="#78B4FF"/>
      <circle cx="320" cy="220" r="4" fill="#78B4FF"/>

      ${motion}

      <text x="100" y="318" class="viz-label">СЛОИ КОНСТРУКЦИИ</text>
      <text x="320" y="318" class="viz-label">УЗЕЛ J-04</text>
    `);

    if (!r) {
      container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 500;
        const py = ((e.clientY - rect.top) / rect.height) * 380;
        const main = svg.getElementById('hero-path-main');
        const bypass = svg.getElementById('hero-path-bypass');
        const dx = (px - 250) * 0.02;
        const dy = (py - 190) * 0.02;
        if (main) main.setAttribute('transform', `translate(${dx}, ${dy})`);
        if (bypass) bypass.setAttribute('transform', `translate(${-dx * 0.5}, ${dy * 0.5})`);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVisual);
  } else {
    initHeroVisual();
  }
})();
