(function () {
  'use strict';

  function initFormVisual() {
    const container = document.getElementById('form-visual');
    if (!container || !window.CIAViz) return;

    const r = CIAViz.reduced();

    const svg = CIAViz.mount(container, '0 0 420 420', `
      <defs>
        <linearGradient id="formScan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(47,125,255,0)"/>
          <stop offset="45%" stop-color="rgba(47,125,255,0.22)"/>
          <stop offset="50%" stop-color="rgba(120,180,255,0.38)"/>
          <stop offset="55%" stop-color="rgba(47,125,255,0.22)"/>
          <stop offset="100%" stop-color="rgba(47,125,255,0)"/>
        </linearGradient>
        <linearGradient id="formPlanFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(47,125,255,0.12)"/>
          <stop offset="100%" stop-color="rgba(47,125,255,0.02)"/>
        </linearGradient>
      </defs>
      <text x="24" y="30" class="viz-label viz-label--title">ЗАДАЧА → МОДЕЛЬ ОБЪЕКТА → ПРОЕКТ</text>

      <g id="form-chaos" opacity="1">
        <rect x="36" y="74" width="108" height="42" rx="2" class="viz-zone--muted"/>
        <rect x="36" y="134" width="108" height="42" rx="2" class="viz-zone--muted"/>
        <rect x="36" y="194" width="108" height="42" rx="2" class="viz-zone--muted"/>
        <text x="52" y="100" class="viz-label">объект</text>
        <text x="52" y="160" class="viz-label">задача</text>
        <text x="52" y="220" class="viz-label">контакт</text>
        <circle cx="124" cy="95" r="3" class="viz-node"/>
        <circle cx="124" cy="155" r="3" class="viz-node"/>
        <circle cx="124" cy="215" r="3" class="viz-node"/>
        <path d="M144 95 C168 95 174 126 196 126" class="viz-path viz-path--soft"/>
        <path d="M144 155 H196" class="viz-path viz-path--soft"/>
        <path d="M144 215 C168 215 174 184 196 184" class="viz-path viz-path--soft"/>
        <text x="40" y="270" class="viz-label">исходные данные</text>
      </g>

      <g id="form-room">
        <text x="204" y="70" class="viz-label viz-label--active">модель помещения</text>
        <polygon points="196,122 330,92 366,244 232,276" fill="url(#formPlanFill)" stroke="#2F7DFF" stroke-width="1.5"/>
        <polyline points="196,122 232,276 366,244" class="viz-line"/>
        <polyline points="240,112 274,264" class="viz-line"/>
        <polyline points="286,102 320,254" class="viz-line"/>
        <polyline points="216,180 348,150" class="viz-line"/>
        <polyline points="226,222 358,192" class="viz-line"/>
        <circle cx="246" cy="170" r="5" class="viz-node"/>
        <circle cx="316" cy="154" r="5" class="viz-node viz-node--soft"/>
        <circle cx="296" cy="224" r="5" class="viz-node viz-node--soft"/>
        <path id="form-route" d="M246 170 C278 152 296 152 316 154 C330 174 320 204 296 224" class="viz-path"/>
        ${r ? '' : '<circle r="3" fill="#78B4FF"><animateMotion path="M246 170 C278 152 296 152 316 154 C330 174 320 204 296 224" dur="3s" repeatCount="indefinite"/></circle>'}
        <rect id="form-scanner" x="206" y="92" width="34" height="190" fill="url(#formScan)" opacity="0.85" transform="skewX(-13)">
          ${r ? '' : '<animate attributeName="x" values="206;322;206" dur="4.4s" repeatCount="indefinite"/>'}
        </rect>
      </g>

      <g id="form-structure" opacity="0.3">
        <rect x="230" y="312" width="118" height="46" rx="2" class="viz-zone"/>
        <line x1="246" y1="328" x2="332" y2="328" class="viz-line"/>
        <line x1="246" y1="342" x2="314" y2="342" class="viz-line"/>
        <text x="248" y="340" class="viz-label viz-label--active">формат работ</text>
        <path d="M292 276 V312" class="viz-path viz-path--soft"/>
      </g>

      <text x="212" y="296" class="viz-label">анализ путей передачи</text>
    `);

    if (!r) {
      const chaos = svg.getElementById('form-chaos');
      const structure = svg.getElementById('form-structure');

      const tl = () => {
        if (typeof gsap === 'undefined') return;
        gsap.timeline({ repeat: -1, repeatDelay: 0.7 })
          .to(chaos, { opacity: 0.42, duration: 1.8, ease: 'power1.inOut' })
          .to(structure, { opacity: 1, duration: 1.8, ease: 'power1.inOut' }, '<')
          .to(chaos, { opacity: 1, duration: 1.8, ease: 'power1.inOut' })
          .to(structure, { opacity: 0.35, duration: 1.8, ease: 'power1.inOut' }, '<');
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
