(function () {
  'use strict';

  const showcase = document.getElementById('services-showcase');
  const tabs = document.querySelectorAll('.services__tab');
  const panels = document.querySelectorAll('.service-panel');
  const chainSteps = document.querySelectorAll('.services__chain-step');
  const chainDesc = document.getElementById('chain-desc');

  const CHAIN_COPY = [
    'Фиксируем факт: жалобу заказчика, назначение помещения, состояние конструкций, уровни и характер акустического воздействия.',
    'Определяем целевой результат и строим модель объекта: источники, прямые и обходные пути, конструкции, узлы и ограничения.',
    'Разрабатываем систему решений: составы конструкций, узлы, материалы, требования к монтажу, прогноз и критерии приёмки.',
    'Подрядчик реализует проект. Критические этапы и узлы могут сопровождаться инженерным контролем по отдельному согласованию.',
    'Сопоставляем план и факт: проводим повторные измерения, оцениваем достигнутый эффект и анализируем возможные отклонения.',
  ];

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
