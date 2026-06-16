(function () {
  'use strict';

  window.CIAViz = {
    reduced() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
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
    pulseDot(pathD, color, dur, delay) {
      if (this.reduced()) return '';
      return `<circle r="4" fill="${color || '#2F7DFF'}"><animateMotion path="${pathD}" dur="${dur || '2.5s'}" begin="${delay || '0s'}" repeatCount="indefinite"/></circle>`;
    },
  };
})();
