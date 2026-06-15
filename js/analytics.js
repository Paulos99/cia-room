(function () {
  'use strict';

  const CIAAnalytics = {
    track(eventName, params) {
      if (typeof console !== 'undefined' && window.location.hostname === 'localhost') {
        console.debug('[CIA Analytics]', eventName, params || {});
      }

      if (typeof ym !== 'undefined' && typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.yandexMetrikaId) {
        try {
          ym(CIA_CONFIG.yandexMetrikaId, 'reachGoal', eventName, params);
        } catch {
          /* ignore */
        }
      }
    },
  };

  window.CIAAnalytics = CIAAnalytics;

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-analytics]');
    if (!el) return;
    CIAAnalytics.track(el.dataset.analytics, { href: el.getAttribute('href') });
  });

  if (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.yandexMetrikaId) {
    const id = CIA_CONFIG.yandexMetrikaId;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
})();
