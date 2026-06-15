(function () {
  'use strict';

  const accordion = document.getElementById('faq-accordion');
  if (!accordion) return;

  const triggers = accordion.querySelectorAll('.accordion__trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      triggers.forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = true;
      });

      if (!expanded && panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        if (window.CIAAnalytics) window.CIAAnalytics.track('faq_open', { id: panelId });
      }
    });

    trigger.addEventListener('keydown', (e) => {
      const items = Array.from(triggers);
      const index = items.indexOf(trigger);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(index + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    });
  });
})();
