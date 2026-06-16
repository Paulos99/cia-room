(function () {
  'use strict';

  const NODE_COPY = {
    source: 'Источник — откуда идёт шум: соседи, техника, улица, вентиляция. Определяем не только уровень, но и спектр и режим — постоянный или импульсный.',
    path: 'Путь передачи — через какие конструкции звук доходит до вас: пол, стена, потолок, вентиляция, щели. Часто доминирует неочевидный маршрут.',
    construction: 'Конструкция — материалы, толщины, узлы и примыкания. Один слабый стык может свести на нет всю систему звукоизоляции.',
    perception: 'Восприятие — как звук ощущается внутри: разборчивость речи, реверберация, комфорт. Это отдельная задача от снижения шума снаружи.',
  };

  const flow = document.getElementById('cia-flow');
  const detail = document.getElementById('cia-detail');
  const ambient = document.getElementById('cia-ambient');

  if (!flow) return;

  const nodes = flow.querySelectorAll('.cia-identity__node');

  function activate(node) {
    const key = node.dataset.node;
    nodes.forEach((n) => {
      n.classList.toggle('is-active', n === node);
      n.setAttribute('aria-pressed', n === node ? 'true' : 'false');
    });
    if (detail && NODE_COPY[key]) {
      detail.textContent = NODE_COPY[key];
      detail.classList.add('is-active');
    }
  }

  nodes.forEach((node, i) => {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    node.addEventListener('click', () => activate(node));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate(node);
      }
    });
  });

  if (nodes[0]) activate(nodes[0]);

  let autoIndex = 0;
  const autoCycle = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoIndex = (autoIndex + 1) % nodes.length;
    activate(nodes[autoIndex]);
  };

  let interval = setInterval(autoCycle, 5000);
  flow.addEventListener('mouseenter', () => clearInterval(interval));
  flow.addEventListener('mouseleave', () => {
    interval = setInterval(autoCycle, 5000);
  });

  if (ambient && typeof gsap !== 'undefined') {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      gsap.to(ambient, {
        backgroundPosition: '100% 50%',
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }
})();
