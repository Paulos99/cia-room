(function () {
  'use strict';

  const showcase = document.getElementById('services-showcase');
  const tabs = document.querySelectorAll('.services__tab');
  const panels = document.querySelectorAll('.service-panel');
  const chainSteps = document.querySelectorAll('.services__chain-step');
  const chainDesc = document.getElementById('chain-desc');

  const CHAIN_COPY = [
    'Фиксируем исходное состояние: жалобу, назначение помещения и характер шума.',
    'Строим модель объекта: источники, пути передачи, конструкции и ограничения.',
    'Разрабатываем решение: конструкции, узлы, материалы, прогноз и критерии приёмки.',
    'Подрядчик реализует проект; критические узлы можем сопровождать по согласованию.',
    'Сравниваем план и факт: повторные измерения и анализ отклонений.',
  ];

  const MODEL_COPY = {
    source: 'Источник — речь, музыка, шаги, техника, улица. Определяем уровень, спектр и режим шума.',
    path: 'Путь передачи — через стену, перекрытие, стык, вентиляцию или трубы. Часто доминирует неочевидный маршрут.',
    construction: 'Конструкции и узлы — состав стен, перекрытий, примыканий. Один слабый стык может свести на нет всю систему.',
    perception: 'Целевой результат зависит от назначения: сон, работа, запись, приватность речи. Переводим задачу в измеримые показатели.',
  };

  function initAcousticModelFlow(flow, detail) {
    if (!flow) return;

    const nodes = flow.querySelectorAll('.cia-identity__node');
    let autoIndex = 0;
    let interval;

    function activate(node) {
      const key = node.dataset.node;
      nodes.forEach((n) => {
        n.classList.toggle('is-active', n === node);
        n.setAttribute('aria-pressed', n === node ? 'true' : 'false');
      });
      if (detail && MODEL_COPY[key]) {
        detail.textContent = MODEL_COPY[key];
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

    const autoCycle = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoIndex = (autoIndex + 1) % nodes.length;
      activate(nodes[autoIndex]);
    };

    interval = setInterval(autoCycle, 5000);
    flow.addEventListener('mouseenter', () => clearInterval(interval));
    flow.addEventListener('mouseleave', () => {
      interval = setInterval(autoCycle, 5000);
    });
  }

  initAcousticModelFlow(
    document.getElementById('service-model-flow'),
    document.getElementById('service-model-detail')
  );

  function setActiveService(target) {
    panels.forEach((p) => {
      const active = p.dataset.service === target;
      p.classList.toggle('is-active', active);

      if (active) {
        const img = p.querySelector('.service-panel__media img');
        if (img?.getAttribute('loading') === 'lazy' && !img.complete) {
          img.loading = 'eager';
          if (img.dataset.src) img.src = img.dataset.src;
        }

        if (window.CIA_REVEAL_SERVICE_PANEL) {
          window.CIA_REVEAL_SERVICE_PANEL(p);
        } else {
          p.querySelectorAll('.service-panel__media, .service-panel__body').forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        }
      }
    });
    tabs.forEach((t) => {
      const active = t.dataset.target === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveService(tab.dataset.target));
  });

  panels.forEach((panel) => {
    const toggle = panel.querySelector('.service-panel__toggle');
    const details = panel.querySelector('.service-panel__details');
    const media = panel.querySelector('.service-panel__media');

    if (toggle && details) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        details.hidden = open;
      });
    }

    if (media && window.matchMedia('(min-width: 1024px)').matches) {
      media.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = media.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        media.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      media.addEventListener('mouseleave', () => {
        media.style.transform = '';
      });
    }
  });

  chainSteps.forEach((step) => {
    step.addEventListener('click', () => {
      const idx = Number(step.dataset.chain);
      chainSteps.forEach((s) => s.classList.toggle('is-active', s === step));
      if (chainDesc && CHAIN_COPY[idx]) {
        chainDesc.style.opacity = '0';
        setTimeout(() => {
          chainDesc.textContent = CHAIN_COPY[idx];
          chainDesc.style.opacity = '1';
        }, 150);
      }
    });
  });
})();
