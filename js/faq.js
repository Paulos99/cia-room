(function () {
  'use strict';

  function initFaq() {
    const root = document.getElementById('faq-accordion');
    if (!root) return;

    const triggers = root.querySelectorAll('.accordion__trigger');

    const closeItem = (trigger) => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    };

    const openItem = (trigger) => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      trigger.setAttribute('aria-expanded', 'true');
      if (panel) panel.hidden = false;
      if (window.CIAAnalytics && typeof window.CIAAnalytics.trackEvent === 'function') {
        window.CIAAnalytics.trackEvent('faq_open', { id: panelId });
      }
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        triggers.forEach((t) => closeItem(t));
        if (!expanded) openItem(trigger);
      });

      trigger.addEventListener('keydown', (e) => {
        const list = Array.from(triggers);
        const index = list.indexOf(trigger);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          list[Math.min(index + 1, list.length - 1)].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          list[Math.max(index - 1, 0)].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          list[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          list[list.length - 1].focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();