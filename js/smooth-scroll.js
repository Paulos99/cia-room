(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function initSmoothScroll() {
    if (prefersReducedMotion() || typeof Lenis === 'undefined' || isMobileViewport()) return null;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
      syncTouch: false,
    });

    document.documentElement.classList.add('has-smooth-scroll');

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
      });

      lenis.on('scroll', ScrollTrigger.update);

      ScrollTrigger.defaults({ scroller: document.documentElement });
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const scroll = lenis.scroll;
        lenis.resize();
        lenis.scrollTo(scroll, { immediate: true });
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 200);
    });

    window.CIA_ON_SCROLL = (handler) => {
      lenis.on('scroll', handler);
    };

    window.CIA_SCROLL_TO = (target, options = {}) => {
      lenis.scrollTo(target, options);
    };

    window.CIA_SMOOTH_SCROLL = { lenis };
    return lenis;
  }

  function boot() {
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
