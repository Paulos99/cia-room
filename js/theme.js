(function () {
  'use strict';

  const STORAGE_KEY = 'cia-theme';
  const THEMES = ['dark', 'light'];

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(stored) ? stored : null;
    } catch (_) {
      return null;
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    const next = THEMES.includes(theme) ? theme : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        next === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'
      );
      toggle.setAttribute(
        'title',
        next === 'light' ? 'Тёмная тема' : 'Светлая тема'
      );
    }

    window.dispatchEvent(new CustomEvent('cia:theme-change', { detail: { theme: next } }));
    return next;
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) { /* ignore */ }
  }

  function withTransition(callback) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced && typeof document.startViewTransition === 'function') {
      document.startViewTransition(callback);
      return;
    }

    if (!reduced) {
      document.documentElement.classList.add('theme-transition');
      callback();
      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 460);
      return;
    }

    callback();
  }

  function setTheme(theme, persist) {
    const next = THEMES.includes(theme) ? theme : getSystemTheme();

    withTransition(() => {
      applyTheme(next);
      if (persist !== false) persistTheme(next);
    });
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', toggleTheme);

    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  function initSystemListener() {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (!getStoredTheme()) setTheme(getSystemTheme(), false);
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onChange);
    }
  }

  function boot() {
    applyTheme(getTheme());
    initThemeToggle();
    initSystemListener();
  }

  window.CIA_THEME = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
