(function () {
  'use strict';

  const showcase = document.getElementById('services-showcase');
  const tabs = document.querySelectorAll('.services__tab');
  const compareCols = document.querySelectorAll('.services__compare-col');
  const panels = document.querySelectorAll('.service-panel');
  const compareMobile = document.getElementById('services-compare-mobile');
  const compareTable = document.querySelector('.services__compare');

  const SERVICE_LABELS = {
    remote: { num: '01', name: 'Без выезда' },
    measurement: { num: '02', name: 'Обследование' },
    design: { num: '03', name: 'Проект' },
    special: { num: '04', name: 'Спецпроекты' },
    industrial: { num: '05', name: 'Промышленность' },
  };

  const SERVICE_ORDER = ['remote', 'measurement', 'design', 'special', 'industrial'];

  function isMobileCarousel() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function scrollShowcaseToPanel(panel, behavior = 'smooth') {
    if (!showcase || !panel || !isMobileCarousel()) return;
    const offset = panel.offsetLeft - showcase.offsetLeft - parseFloat(getComputedStyle(showcase).paddingLeft || 0);
    showcase.scrollTo({ left: Math.max(0, offset), behavior });
  }

  function setActiveService(target, options = {}) {
    const { scroll = true } = options;
    let activePanel = null;

    panels.forEach((p) => {
      const active = p.dataset.service === target;
      p.classList.toggle('is-active', active);

      if (active) {
        activePanel = p;
        const img = p.querySelector('.service-panel__media img');
        if (img?.getAttribute('loading') === 'lazy' && !img.complete) {
          img.loading = 'eager';
          if (img.dataset.src) img.src = img.dataset.src;
        }

        p.querySelectorAll('.service-panel__media, .service-panel__body').forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });

        if (window.CIA_REVEAL_SERVICE_PANEL) {
          window.CIA_REVEAL_SERVICE_PANEL(p);
        }
      }
    });

    tabs.forEach((t) => {
      const active = t.dataset.target === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (compareMobile) {
      compareMobile.querySelectorAll('.services__compare-tab').forEach((tab) => {
        const active = tab.dataset.target === target;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      compareMobile.querySelectorAll('.services__compare-card').forEach((card) => {
        card.hidden = card.dataset.service !== target;
      });
    }

    if (scroll && activePanel) {
      scrollShowcaseToPanel(activePanel);
    }

    window.dispatchEvent(new CustomEvent('cia:service-change', { detail: { target } }));
  }

  window.CIA_SET_SERVICE = setActiveService;

  function scrollToPanel(target) {
    const panel = document.getElementById(`service-${target}`);
    if (!panel) return;
    if (window.CIA_SCROLL_TO_ELEMENT) {
      window.CIA_SCROLL_TO_ELEMENT(panel, { anchor: true });
    } else {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function cellValue(cell) {
    if (!cell) return { text: '', type: 'text' };
    const span = cell.querySelector('.services__compare-cell');
    if (!span) return { text: cell.textContent.trim(), type: 'text' };

    let type = 'text';
    if (span.classList.contains('services__compare-cell--yes')) type = 'yes';
    else if (span.classList.contains('services__compare-cell--no')) type = 'no';

    return { text: span.textContent.trim(), type };
  }

  function buildCompareMobile() {
    if (!compareMobile || !compareTable) return;

    const headerCells = compareTable.querySelectorAll('thead .services__compare-col');
    const targets = Array.from(headerCells).map((btn) => btn.dataset.target).filter(Boolean);
    if (!targets.length) return;

    const rows = compareTable.querySelectorAll('tbody tr');
    const dataByService = {};

    targets.forEach((target, colIndex) => {
      dataByService[target] = [];
      rows.forEach((row) => {
        const label = row.querySelector('.services__compare-row')?.textContent?.trim() || '';
        const cells = row.querySelectorAll('td');
        const { text: value, type: valueType } = cellValue(cells[colIndex]);
        if (label && value) {
          dataByService[target].push({ label, value, valueType });
        }
      });
    });

    const tabsHtml = targets.map((target, i) => {
      const meta = SERVICE_LABELS[target] || { num: '', name: target };
      const active = i === 0 ? ' is-active' : '';
      return `<button type="button" class="services__compare-tab${active}" data-target="${target}" aria-selected="${i === 0}">${meta.num} ${meta.name}</button>`;
    }).join('');

    const cardsHtml = targets.map((target, i) => {
      const meta = SERVICE_LABELS[target] || { num: '', name: target };
      const rowsHtml = (dataByService[target] || []).map((row) => {
        const valueMod = row.valueType === 'yes'
          ? ' services__compare-card-value--yes'
          : row.valueType === 'no'
            ? ' services__compare-card-value--no'
            : ' services__compare-card-value--text';
        return `
        <li class="services__compare-card-row">
          <span class="services__compare-card-label">${row.label}</span>
          <span class="services__compare-card-value${valueMod}">${row.value}</span>
        </li>
      `;
      }).join('');

      return `
        <div class="services__compare-card" data-service="${target}"${i === 0 ? '' : ' hidden'}>
          <h3 class="services__compare-card-title">${meta.num} — ${meta.name}</h3>
          <ul class="services__compare-card-list">${rowsHtml}</ul>
          <button type="button" class="btn btn--secondary services__compare-card-cta" data-open-service="${target}">Открыть описание услуги</button>
        </div>
      `;
    }).join('');

    compareMobile.innerHTML = `
      <div class="services__compare-tabs" role="tablist" aria-label="Сравнение услуг">${tabsHtml}</div>
      ${cardsHtml}
    `;

    compareMobile.querySelectorAll('.services__compare-tab').forEach((tab) => {
      tab.addEventListener('click', () => setActiveService(tab.dataset.target));
    });

    compareMobile.querySelectorAll('[data-open-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-open-service');
        setActiveService(target);
        scrollToPanel(target);
      });
    });
  }

  function bootServices() {
    buildCompareMobile();
    panels.forEach((panel) => {
      panel.querySelectorAll('.service-panel__media, .service-panel__body').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveService(tab.dataset.target));
  });

  compareCols.forEach((col) => {
    col.addEventListener('click', () => {
      const target = col.dataset.target;
      if (!target) return;
      setActiveService(target);
      scrollToPanel(target);
    });
  });

  panels.forEach((panel) => {
    const toggle = panel.querySelector('.service-panel__toggle');
    const details = panel.querySelector('.service-panel__details');

    if (toggle && details) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        details.hidden = open;
      });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootServices);
  } else {
    bootServices();
  }

  window.addEventListener('load', () => {
    if (compareMobile && !compareMobile.children.length) {
      buildCompareMobile();
    }
  });
})();
