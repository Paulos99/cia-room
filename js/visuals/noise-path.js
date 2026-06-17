(function () {
  'use strict';

  const PATHS = [
    {
      id: 'np-ceiling',
      d: 'M100 134 L100 74 L218 74 L218 128',
      label: 'через перекрытие',
      lx: 160,
      ly: 86,
      anchor: 'middle',
      reason: 0,
      color: '#2F7DFF',
      soft: false,
      endX: 218,
      endY: 128,
    },
    {
      id: 'np-wall',
      d: 'M100 134 L52 134 L52 198 L100 198',
      label: 'через стену',
      lx: 24,
      ly: 164,
      anchor: 'start',
      reason: 1,
      color: '#2F7DFF',
      soft: false,
      endX: 100,
      endY: 198,
    },
    {
      id: 'np-flank',
      d: 'M100 134 L268 134 L268 198 L180 198',
      label: 'обходной путь',
      lx: 276,
      ly: 164,
      anchor: 'end',
      reason: 2,
      color: '#78B4FF',
      soft: true,
      endX: 180,
      endY: 198,
    },
    {
      id: 'np-vent',
      d: 'M160 134 L160 68 L232 68 L232 88',
      label: 'вентиляция',
      lx: 204,
      ly: 56,
      anchor: 'middle',
      reason: 3,
      color: '#78B4FF',
      soft: true,
      endX: 232,
      endY: 88,
    },
  ];

  function pathLabel(p) {
    const anchor = p.anchor || 'start';
    const padX = 6;
    const padY = 4;
    const charW = 5.4;
    const textW = p.label.length * charW;
    const boxW = textW + padX * 2;
    const boxH = 14;
    let bx = p.lx - padX;
    if (anchor === 'middle') bx = p.lx - boxW / 2;
    if (anchor === 'end') bx = p.lx - boxW + padX;
    const by = p.ly - boxH + 2;
    return `
      <g class="noise-path-label-wrap">
        <rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" rx="2" class="noise-path-label-bg"/>
        <text x="${p.lx}" y="${p.ly}" class="viz-label viz-label--path noise-path-label" text-anchor="${anchor}">${p.label}</text>
      </g>`;
  }

  function pathEndpoint(x, y, soft) {
    const ringCls = soft ? 'noise-path-endpoint-ring noise-path-endpoint-ring--soft' : 'noise-path-endpoint-ring';
    const dotCls = soft ? 'noise-path-endpoint noise-path-endpoint--soft' : 'noise-path-endpoint';
    return `
      <circle cx="${x}" cy="${y}" r="7" class="${ringCls}"/>
      <circle cx="${x}" cy="${y}" r="3.5" class="${dotCls}"/>`;
  }

  function initNoisePath() {
    const container = document.getElementById('noise-path-diagram');
    const whySection = document.getElementById('why');
    if (!container || !window.CIAViz) return;

    const V = window.CIAViz;
    const r = V.reduced();
    const pulses = r
      ? ''
      : PATHS.map((p, i) => V.movingDot(p.d, p.color, '2.8s', `${i * 0.4}s`)).join('');

    const pathEls = PATHS.map((p) => {
      const pathCls = p.soft ? 'viz-path viz-path--soft' : 'viz-path';
      return `
      <g class="noise-path-group" data-reason="${p.reason}">
        <path id="${p.id}" d="${p.d}" class="${pathCls}" stroke="${p.color}" opacity="0.28"/>
        ${pathEndpoint(p.endX, p.endY, p.soft)}
        ${pathLabel(p)}
      </g>`;
    }).join('');

    const svg = V.mount(
      container,
      '0 0 320 276',
      `
      ${V.arrowMarkers('np')}

      <text x="16" y="22" class="viz-label viz-label--title">ПЛАН КВАРТИРЫ · МАРШРУТЫ ШУМА</text>

      <rect x="40" y="48" width="240" height="192" class="viz-frame" rx="2"/>
      <line x1="160" y1="48" x2="160" y2="240" class="viz-line"/>
      <line x1="40" y1="144" x2="280" y2="144" class="viz-line"/>

      <text x="100" y="102" class="viz-label viz-label--room" text-anchor="middle">гостиная</text>
      <text x="220" y="102" class="viz-label viz-label--room" text-anchor="middle">спальня</text>
      <text x="100" y="206" class="viz-label viz-label--room" text-anchor="middle">кухня</text>
      <text x="220" y="206" class="viz-label viz-label--room" text-anchor="middle">санузел</text>

      <rect x="224" y="48" width="12" height="20" class="noise-path-vent-shaft" rx="1"/>

      <g class="noise-path-source">
        <circle cx="100" cy="134" r="14" class="noise-path-source-ring"/>
        <circle cx="100" cy="134" r="5" class="noise-path-source-dot">
          ${r ? '' : '<animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>'}
        </circle>
        <text x="100" y="116" class="viz-label viz-label--active" text-anchor="middle">источник</text>
      </g>
      ${r ? '' : V.impactRipples(100, 134)}

      ${pathEls}
      ${pulses}

      ${V.pathLegend(16, 256)}
    `
    );

    let activeIndex = -1;

    function pathIndexFromY(clientY) {
      const rect = container.getBoundingClientRect();
      const rel = (clientY - rect.top) / rect.height;
      if (rel <= 0) return 0;
      if (rel >= 1) return 3;
      return Math.min(3, Math.floor(rel * 4));
    }

    function highlightPath(index) {
      if (index === activeIndex) return;
      activeIndex = index;
      PATHS.forEach((p) => {
        const group = svg.querySelector(`[data-reason="${p.reason}"]`);
        const path = svg.getElementById(p.id);
        const labelWrap = group && group.querySelector('.noise-path-label-wrap');
        const endpoints = group && group.querySelectorAll('.noise-path-endpoint, .noise-path-endpoint-ring');
        const active = p.reason === index;
        if (group) group.classList.toggle('is-active', active);
        if (path) {
          path.setAttribute('opacity', active ? '1' : '0.22');
          path.setAttribute('stroke-width', active ? (p.soft ? '2' : '2.4') : p.soft ? '1.4' : '1.6');
        }
        if (labelWrap) labelWrap.setAttribute('opacity', active ? '1' : '0.72');
        if (endpoints) {
          endpoints.forEach((node) => node.setAttribute('opacity', active ? '1' : '0.45'));
        }
      });
    }

    function handlePointer(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const padX = 32;
      if (clientX < rect.left - padX || clientX > rect.right + padX) return;
      highlightPath(pathIndexFromY(clientY));
    }

    whySection.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
    whySection.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) handlePointer(touch.clientX, touch.clientY);
    }, { passive: true });

    highlightPath(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNoisePath);
  } else {
    initNoisePath();
  }
})();
