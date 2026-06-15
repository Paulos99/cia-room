(function () {
  'use strict';

  const queue = [];

  function getMetrikaId() {
    return (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.yandexMetrikaId) || '';
  }

  function flushQueue() {
    if (typeof window.ym !== 'function') return;
    const id = getMetrikaId();
    if (!id) return;
    while (queue.length) {
      const item = queue.shift();
      window.ym(id, 'reachGoal', item.name, item.params || {});
    }
  }

  function initMetrika() {
    const id = getMetrikaId();
    if (!id || window.__ciaMetrikaInit) return;
    window.__ciaMetrikaInit = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
    flushQueue();
  }

  function trackEvent(name, params) {
    if (!name) return;
    if (typeof window.CIAAnalytics !== 'undefined' && window.CIAAnalytics.debug) {
      console.info('[CIA analytics]', name, params || {});
    }
    const id = getMetrikaId();
    if (id && typeof window.ym === 'function') {
      window.ym(id, 'reachGoal', name, params || {});
    } else if (id) {
      queue.push({ name, params: params || {} });
      initMetrika();
    }
  }

  function bindClickTracking() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-analytics]');
      if (!el) return;
      trackEvent(el.getAttribute('data-analytics'), {
        href: el.getAttribute('href') || undefined,
      });
    });
  }

  window.CIAAnalytics = { trackEvent, initMetrika };

  function boot() {
    initMetrika();
    bindClickTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
