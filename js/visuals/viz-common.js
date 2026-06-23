(function () {
  'use strict';

  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  window.CIAViz = {
    reduced,
    mount(container, viewBox, html) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', viewBox);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('class', 'viz-svg');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.innerHTML = html;
      container.innerHTML = '';
      container.appendChild(svg);
      return svg;
    },
    movingDot(path, color = '#2F7DFF', dur = '2.4s', delay = '0s') {
      if (reduced()) return '';
      const begin = delay !== '0s' ? ` begin="${delay}"` : '';
      return `<circle r="3.5" fill="${color}" class="viz-motion-dot"><animateMotion path="${path}" dur="${dur}"${begin} repeatCount="indefinite"/></circle>`;
    },
    pulseDot(pathD, color, dur, delay) {
      return window.CIAViz.movingDot(pathD, color || '#2F7DFF', dur || '2.5s', delay || '0s');
    },
    impactRipples(cx, cy, color = '#2F7DFF') {
      if (reduced()) return '';
      return [0, 0.65, 1.3]
        .map((begin) => `
        <circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${color}" stroke-width="1.2" class="viz-impact-ripple">
          <animate attributeName="r" values="8;22;8" dur="2.2s" begin="${begin}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" begin="${begin}s" repeatCount="indefinite"/>
        </circle>`)
        .join('');
    },
    arrowMarkers(id = 'arrow') {
      return `<defs>
        <marker id="${id}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#2F7DFF"/>
        </marker>
        <marker id="${id}Soft" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#78B4FF"/>
        </marker>
      </defs>`;
    },
    pathLegend(x, y) {
      return `<g class="viz-legend" transform="translate(${x},${y})">
        <line x1="0" y1="5" x2="22" y2="5" class="viz-path"/>
        <text x="28" y="9" class="viz-label viz-label--caption">прямой путь</text>
        <line x1="0" y1="21" x2="22" y2="21" class="viz-path viz-path--soft"/>
        <text x="28" y="25" class="viz-label viz-label--caption">обходной путь</text>
      </g>`;
    },
    layerStack(x, y, w, layers) {
      return layers
        .map((layer) => {
          const cls = layer.active ? 'viz-zone' : 'viz-zone--muted';
          const labelCls = layer.active
            ? 'viz-label viz-label--layer viz-label--active'
            : 'viz-label viz-label--layer';
          const ly = y + layer.h / 2 + 4;
          const block = `
            <rect x="${x}" y="${y}" width="${w}" height="${layer.h}" class="${cls}" rx="2"/>
            <text x="${x + 10}" y="${ly}" class="${labelCls}">${layer.label}</text>`;
          y += layer.h;
          return block;
        })
        .join('');
    },
    roomBlock(x, y, w, h, label, muted = true) {
      const cls = muted ? 'viz-zone--muted' : 'viz-frame';
      const lx = x + w / 2;
      const ly = y + h / 2 + 4;
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}" rx="2"/>
        <text x="${lx}" y="${ly}" class="viz-label viz-label--room" text-anchor="middle">${label}</text>`;
    },
  };
})();
