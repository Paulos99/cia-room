(function () {
  'use strict';

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function initMobileCarousels() {
    document.querySelectorAll('[data-mobile-carousel]').forEach((carousel) => {
      const viewport = carousel.querySelector('.mobile-carousel__viewport');
      if (!viewport) return;

      let frame = 0;
      const update = () => {
        if (!isMobile()) {
          carousel.classList.remove('is-scrollable', 'is-at-start', 'is-at-end');
          return;
        }

        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const scrollable = maxScroll > 4;
        const atStart = viewport.scrollLeft <= 4;
        const atEnd = !scrollable || viewport.scrollLeft >= maxScroll - 4;

        carousel.classList.toggle('is-scrollable', scrollable);
        carousel.classList.toggle('is-at-start', atStart);
        carousel.classList.toggle('is-at-end', atEnd);
      };

      const schedule = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      };

      viewport.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(schedule);
        ro.observe(viewport);
        viewport.querySelectorAll('.process__step, .object-card, .principle, .services__chain-step').forEach((el) => ro.observe(el));
      }
      schedule();
    });
  }

  function boot() {
    initMobileCarousels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
