(function () {
  'use strict';

  const NODE_COPY = {
    source: 'Источник — что создаёт акустическое воздействие: речь, музыка, шаги, инженерное оборудование, транспорт или производственный процесс. Определяем характер, режим и частотный состав шума.',
    path: 'Путь передачи — как звуковая энергия достигает принимающего помещения: напрямую через ограждение, по смежным конструкциям, через стыки, вентиляцию, трубы и технологические проходки.',
    construction: 'Конструкции и узлы — состав стен, перекрытий, полов, потолков, инженерных проходок и примыканий. Итог системы часто определяет слабый элемент или ошибка соединения.',
    perception: 'Целевой результат зависит от назначения пространства: сон, работа, приватность речи, запись, прослушивание, общение или защита от оборудования. Задачу переводим в измеримые показатели и критерии приёмки.',
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
