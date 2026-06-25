(function () {
  'use strict';

  const PATHS = [
    {
      id: 'np-ceiling',
      d: 'M120 158 L120 88 L268 88 L268 152',
      label: 'через перекрытие',
      desc: 'Ударный и воздушный шум соседей сверху передаётся через плиту перекрытия — даже если кажется, что источник «в стене».',
      lx: 194,
      ly: 100,
      anchor: 'middle',
      reason: 0,
      color: '#2F7DFF',
      soft: false,
      endX: 268,
      endY: 152,
    },
    {
      id: 'np-wall',
      d: 'M120 158 L62 158 L62 232 L120 232',
      label: 'через стену',
      desc: 'Прямой воздушный путь через ограждающую стену — самый очевидный, но не всегда главный маршрут.',
      lx: 28,
      ly: 192,
      anchor: 'start',
      reason: 1,
      color: '#2F7DFF',
      soft: false,
      endX: 120,
      endY: 232,
    },
    {
      id: 'np-flank',
      d: 'M120 158 L318 158 L318 232 L216 232',
      label: 'обходной путь',
      desc: 'Звук обходит основную конструкцию по смежным стенам, полу или потолку — типичная причина «не сработавшей» звукоизоляции.',
      lx: 326,
      ly: 192,
      anchor: 'end',
      reason: 2,
      color: '#78B4FF',
      soft: true,
      endX: 216,
      endY: 232,
    },
    {
      id: 'np-vent',
      d: 'M192 158 L192 82 L288 82 L288 104',
      label: 'вентиляция',
      desc: 'Вентиляционные каналы, шахты и проходки создают обходной маршрут между помещениями.',
      lx: 252,
      ly: 68,
      anchor: 'middle',
      reason: 3,
      color: '#78B4FF',
      soft: true,
      endX: 288,
      endY: 104,
    },
    {
      id: 'np-hole',
      d: 'M120 158 L154 158 L154 172 L124 232',
      label: 'акустическая дыра',
      desc: 'Розетка, проходка, неплотный шов или незакрытый узел становятся коротким маршрутом для звука и могут испортить всю конструкцию.',
      lx: 168,
      ly: 204,
      anchor: 'start',
      reason: 4,
      color: '#5AA0FF',
      soft: true,
      endX: 124,
      endY: 232,
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
      <circle cx="${x}" cy="${y}" r="8" class="${ringCls}"/>
      <circle cx="${x}" cy="${y}" r="4" class="${dotCls}"/>`;
  }

  function initNoisePath() {
    const container = document.getElementById('noise-path-diagram');
    const tabsRoot = document.getElementById('why-path-tabs');
    const detailEl = document.getElementById('why-path-detail');
    if (!container || !window.CIAViz) return;

    const V = window.CIAViz;
    const r = V.reduced();
    const pulses = r
      ? ''
      : PATHS.map((p, i) => V.movingDot(p.d, p.color, '2.6s', `${i * 0.35}s`)).join('');

    const pathEls = PATHS.map((p) => {
      const pathCls = p.soft ? 'viz-path viz-path--soft' : 'viz-path';
      return `
      <g class="noise-path-group" data-reason="${p.reason}" role="button" tabindex="0" aria-label="${p.label}">
        <path d="${p.d}" class="noise-path-hit"/>
        <path id="${p.id}" d="${p.d}" class="${pathCls}" stroke="${p.color}" opacity="0.28"/>
        ${pathEndpoint(p.endX, p.endY, p.soft)}
        ${pathLabel(p)}
      </g>`;
    }).join('');

    const svg = V.mount(
      container,
      '0 0 400 320',
      `
      ${V.arrowMarkers('np')}

      <text x="20" y="26" class="viz-label viz-label--title">ПЛАН КВАРТИРЫ · МАРШРУТЫ ШУМА</text>

      <rect x="48" y="56" width="304" height="232" class="viz-frame" rx="2"/>
      <line x1="200" y1="56" x2="200" y2="288" class="viz-line"/>
      <line x1="48" y1="172" x2="352" y2="172" class="viz-line"/>

      <text x="124" y="122" class="viz-label viz-label--room" text-anchor="middle">гостиная</text>
      <text x="276" y="122" class="viz-label viz-label--room" text-anchor="middle">спальня</text>
      <text x="124" y="246" class="viz-label viz-label--room" text-anchor="middle">кухня</text>
      <text x="276" y="246" class="viz-label viz-label--room" text-anchor="middle">санузел</text>

      <rect x="284" y="56" width="14" height="24" class="noise-path-vent-shaft" rx="1"/>
      <rect x="147" y="166" width="14" height="12" class="viz-callout" rx="1"/>
      <text x="154" y="162" class="viz-label viz-label--caption" text-anchor="middle">розетка</text>

      <g class="noise-path-source">
        <circle cx="120" cy="158" r="16" class="noise-path-source-ring"/>
        <circle cx="120" cy="158" r="6" class="noise-path-source-dot">
          ${r ? '' : '<animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite"/>'}
        </circle>
        <text x="120" y="136" class="viz-label viz-label--active" text-anchor="middle">источник</text>
      </g>
      ${r ? '' : V.impactRipples(120, 158)}

      ${pathEls}
      ${pulses}

      ${V.pathLegend(20, 304)}
    `
    );

    const tabButtons = [];
    if (tabsRoot) {
      PATHS.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'why__path-tab';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', 'false');
        btn.dataset.reason = String(p.reason);
        btn.textContent = p.label;
        btn.addEventListener('click', () => {
          pauseAutoCycle();
          highlightPath(i, true);
        });
        tabsRoot.appendChild(btn);
        tabButtons.push(btn);
      });
    }

    let activeIndex = -1;
    let autoTimer = null;
    let autoIndex = 0;
    let sectionVisible = true;

    function highlightPath(index, fromUser) {
      if (index < 0 || index >= PATHS.length) return;
      if (index === activeIndex && fromUser) return;
      activeIndex = index;

      PATHS.forEach((p) => {
        const group = svg.querySelector(`[data-reason="${p.reason}"]`);
        const path = svg.getElementById(p.id);
        const labelWrap = group && group.querySelector('.noise-path-label-wrap');
        const endpoints = group && group.querySelectorAll('.noise-path-endpoint, .noise-path-endpoint-ring');
        const active = p.reason === index;
        if (group) {
          group.classList.toggle('is-active', active);
          group.setAttribute('aria-pressed', active ? 'true' : 'false');
        }
        if (path) {
          path.setAttribute('opacity', active ? '1' : '0.18');
          path.setAttribute('stroke-width', active ? (p.soft ? '2.2' : '2.6') : p.soft ? '1.4' : '1.6');
        }
        if (labelWrap) labelWrap.setAttribute('opacity', active ? '1' : '0.65');
        if (endpoints) {
          endpoints.forEach((node) => node.setAttribute('opacity', active ? '1' : '0.4'));
        }
      });

      tabButtons.forEach((btn, i) => {
        const active = i === index;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (detailEl) {
        detailEl.textContent = PATHS[index].desc;
        detailEl.classList.add('is-active');
      }
    }

    function bindGroup(group, index) {
      group.addEventListener('mouseenter', () => {
        pauseAutoCycle();
        highlightPath(index, false);
      });
      group.addEventListener('focus', () => {
        pauseAutoCycle();
        highlightPath(index, false);
      });
      group.addEventListener('click', () => {
        pauseAutoCycle();
        highlightPath(index, true);
      });
      group.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pauseAutoCycle();
          highlightPath(index, true);
        }
      });
    }

    PATHS.forEach((p) => {
      const group = svg.querySelector(`[data-reason="${p.reason}"]`);
      if (group) bindGroup(group, p.reason);
    });

    function pauseAutoCycle() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoCycle() {
      if (r || autoTimer || !sectionVisible) return;
      autoTimer = setInterval(() => {
        autoIndex = (autoIndex + 1) % PATHS.length;
        highlightPath(autoIndex, false);
      }, 4500);
    }

    container.addEventListener('mouseenter', pauseAutoCycle);
    container.addEventListener('mouseleave', () => {
      startAutoCycle();
    });

    if (tabsRoot) {
      tabsRoot.addEventListener('mouseenter', pauseAutoCycle);
      tabsRoot.addEventListener('mouseleave', startAutoCycle);
    }

    highlightPath(0, false);

    const whySection = document.getElementById('why');
    if (whySection && 'IntersectionObserver' in window) {
      const cycleObserver = new IntersectionObserver(
        (entries) => {
          sectionVisible = entries.some((entry) => entry.isIntersecting);
          if (sectionVisible) startAutoCycle();
          else pauseAutoCycle();
        },
        { threshold: 0.12 },
      );
      cycleObserver.observe(whySection);
    } else {
      startAutoCycle();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNoisePath);
  } else {
    initNoisePath();
  }
})();
