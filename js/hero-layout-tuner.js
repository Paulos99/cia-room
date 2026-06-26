(function () {
  'use strict';

  const STORAGE_KEY = 'cia-hero-layout-desktop';
  const DESKTOP_MQ = '(min-width: 1024px)';

  const VARS = {
    stage: '--hero-stage-offset-y-desktop',
    caption: '--hero-caption-bottom-desktop',
  };

  const DEFAULTS = {
    stage: -150,
    caption: 7,
  };

  const STEP = {
    stage: 2,
    caption: 0.25,
  };

  function isTunerEnabled() {
    const host = window.location.hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '' ||
      host.endsWith('.local');
    const params = new URLSearchParams(window.location.search);
    return isLocal || params.get('hero-tuner') === '1';
  }

  function isHomePage() {
    return Boolean(document.getElementById('hero-visual'));
  }

  function parsePx(value) {
    const match = String(value).trim().match(/^(-?\d+(?:\.\d+)?)px$/);
    return match ? Number(match[1]) : null;
  }

  function parseRem(value) {
    const match = String(value).trim().match(/^(-?\d+(?:\.\d+)?)rem$/);
    return match ? Number(match[1]) : null;
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        stage: Number.isFinite(parsed.stage) ? parsed.stage : DEFAULTS.stage,
        caption: Number.isFinite(parsed.caption) ? parsed.caption : DEFAULTS.caption,
      };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function applyState(state) {
    const root = document.documentElement;
    root.style.setProperty(VARS.stage, `${state.stage}px`);
    root.style.setProperty(VARS.caption, `${state.caption}rem`);
  }

  function formatCssSnippet(state) {
    return [
      '/* Hero visual — ПК */',
      `--hero-stage-offset-y-desktop: ${state.stage}px;`,
      `--hero-caption-bottom-desktop: ${state.caption}rem;`,
    ].join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return Promise.resolve();
  }

  function createButton(label, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = label;
    btn.setAttribute('aria-label', label);
    return btn;
  }

  function initHeroLayoutTuner() {
    if (!isTunerEnabled() || !isHomePage()) return;

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    let state = readState();
    applyState(state);

    const panel = document.createElement('aside');
    panel.className = 'hero-layout-tuner';
    panel.setAttribute('aria-label', 'Настройка положения hero-визуала');
    panel.innerHTML = `
      <div class="hero-layout-tuner__head">
        <div>
          <p class="hero-layout-tuner__title">Позиция hero (ПК)</p>
          <p class="hero-layout-tuner__hint">Стрелки — шаг. Тяните значение вверх/вниз.</p>
        </div>
        <button type="button" class="hero-layout-tuner__close" aria-label="Скрыть панель">×</button>
      </div>
    `;

    const toggle = createButton('Hero layout', 'hero-layout-tuner__toggle');
    toggle.hidden = true;

    const rows = {};

    function renderValues() {
      rows.stage.valueEl.textContent = `${state.stage}px`;
      rows.caption.valueEl.textContent = `${state.caption}rem`;
    }

    function commit() {
      applyState(state);
      saveState(state);
      renderValues();
    }

    function adjustStage(steps) {
      state.stage += steps * STEP.stage;
      commit();
    }

    function adjustCaption(steps) {
      state.caption = Math.max(
        0,
        Number((state.caption + steps * STEP.caption).toFixed(2))
      );
      commit();
    }

    function bindStepControl({ key, onAdjust }) {
      const row = document.createElement('div');
      row.className = 'hero-layout-tuner__row';

      const label = document.createElement('span');
      label.className = 'hero-layout-tuner__label';
      label.textContent = key === 'stage' ? '3D-объект' : 'Надпись';

      const control = document.createElement('div');
      control.className = 'hero-layout-tuner__control';

      const up = createButton('▲', 'hero-layout-tuner__btn');
      up.dataset.dir = 'up';

      const valueEl = document.createElement('div');
      valueEl.className = 'hero-layout-tuner__value';
      valueEl.title = 'Потяните вверх или вниз';

      const down = createButton('▼', 'hero-layout-tuner__btn');
      down.dataset.dir = 'down';

      control.append(up, valueEl, down);
      row.append(label, control);
      panel.append(row);

      rows[key] = { valueEl, up, down };

      function runStep(steps) {
        if (!steps) return;
        onAdjust(steps);
      }

      up.addEventListener('click', () => runStep(1));
      down.addEventListener('click', () => runStep(-1));

      bindHoldRepeat(up, () => runStep(1));
      bindHoldRepeat(down, () => runStep(-1));
      bindDragAdjust(valueEl, (delta) => {
        const steps = Math.trunc(delta / 6);
        if (!steps) return 0;
        onAdjust(steps);
        return Math.abs(steps) * 6;
      });
    }

    function bindHoldRepeat(button, action) {
      let timer = null;

      const stop = () => {
        button.classList.remove('is-active');
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        button.classList.add('is-active');
        action();
        timer = window.setInterval(action, 120);
      });

      button.addEventListener('pointerup', stop);
      button.addEventListener('pointerleave', stop);
      button.addEventListener('pointercancel', stop);
    }

    function bindDragAdjust(element, onDelta) {
      let startY = 0;
      let consumed = 0;
      let active = false;

      element.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        active = true;
        startY = event.clientY;
        consumed = 0;
        element.setPointerCapture(event.pointerId);
        element.classList.add('is-active');
      });

      element.addEventListener('pointermove', (event) => {
        if (!active || !element.hasPointerCapture(event.pointerId)) return;
        const deltaY = startY - event.clientY - consumed;
        const applied = onDelta(deltaY);
        if (applied) consumed += applied;
      });

      const stop = (event) => {
        if (!active) return;
        active = false;
        element.classList.remove('is-active');
        if (element.hasPointerCapture(event.pointerId)) {
          element.releasePointerCapture(event.pointerId);
        }
      };

      element.addEventListener('pointerup', stop);
      element.addEventListener('pointercancel', stop);
    }

    bindStepControl({ key: 'stage', onAdjust: adjustStage });
    bindStepControl({ key: 'caption', onAdjust: adjustCaption });

    const actions = document.createElement('div');
    actions.className = 'hero-layout-tuner__actions';

    const resetBtn = createButton('Сброс', 'hero-layout-tuner__action');
    const copyBtn = createButton('Копировать CSS', 'hero-layout-tuner__action hero-layout-tuner__action--primary');

    resetBtn.addEventListener('click', () => {
      state = { ...DEFAULTS };
      commit();
    });

    copyBtn.addEventListener('click', () => {
      const snippet = formatCssSnippet(state);
      copyText(snippet).then(() => {
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано';
        window.setTimeout(() => {
          copyBtn.textContent = prev;
        }, 1400);
      });
    });

    actions.append(resetBtn, copyBtn);
    panel.append(actions);

    const closeBtn = panel.querySelector('.hero-layout-tuner__close');
    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
      toggle.hidden = false;
    });

    toggle.addEventListener('click', () => {
      panel.hidden = false;
      toggle.hidden = true;
    });

    function syncVisibility() {
      const visible = desktopMq.matches;
      panel.hidden = !visible;
      toggle.hidden = !visible || !panel.hidden;
      if (!visible) return;
      if (panel.hidden) toggle.hidden = false;
    }

    desktopMq.addEventListener('change', syncVisibility);

    document.body.append(panel, toggle);
    renderValues();
    syncVisibility();
    panel.hidden = false;
    toggle.hidden = true;

    window.CIA_HERO_LAYOUT_TUNER = {
      getState: () => ({ ...state }),
      setState: (next) => {
        state = {
          stage: Number.isFinite(next.stage) ? next.stage : state.stage,
          caption: Number.isFinite(next.caption) ? next.caption : state.caption,
        };
        commit();
      },
      reset: () => {
        state = { ...DEFAULTS };
        commit();
      },
      getCssSnippet: () => formatCssSnippet(state),
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroLayoutTuner);
  } else {
    initHeroLayoutTuner();
  }
})();
