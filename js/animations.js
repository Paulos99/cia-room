(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initProcessPulse() {
    const track = document.getElementById('process-track');
    const pulse = document.getElementById('process-pulse');
    const steps = track ? track.querySelectorAll('.process__step') : [];
    if (!track || !pulse || !steps.length) return;

    const positionPulse = (progress) => {
      const p = Math.max(0, Math.min(1, progress));
      const desktop = window.matchMedia('(min-width: 768px)').matches;
      if (desktop) {
        const line = track.querySelector('.process__line');
        const rect = (line || track).getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const left = rect.left - trackRect.left + rect.width * p - 4;
        pulse.style.left = left + 'px';
        pulse.style.top = '20px';
      } else {
        const trackRect = track.getBoundingClientRect();
        const first = steps[0].getBoundingClientRect();
        const last = steps[steps.length - 1].getBoundingClientRect();
        const start = first.top - trackRect.top + first.height / 2;
        const end = last.top - trackRect.top + last.height / 2;
        pulse.style.top = start + (end - start) * p + 'px';
        pulse.style.left = '19px';
      }
    };

    const updateByScroll = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.3;
      const scrolled = vh * 0.35 - rect.top;
      positionPulse(scrolled / total);
    };

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion()) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: track,
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: 0.4,
        onUpdate: (self) => positionPulse(self.progress),
      });
    } else {
      updateByScroll();
      window.addEventListener('scroll', updateByScroll, { passive: true });
      window.addEventListener('resize', updateByScroll);
    }

    steps.forEach((step, index) => {
      if (typeof gsap === 'undefined' || prefersReducedMotion()) return;
      gsap.from(step, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay: index * 0.05,
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      });
    });
  }

  function initSectionMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion()) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-title').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    });

    gsap.utils.toArray('.service-panel').forEach((el, i) => {
      gsap.from(el, {
        y: 24,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    gsap.from('.cia-identity__content > *', {
      opacity: 0,
      y: 20,
      stagger: 0.07,
      duration: 0.6,
      scrollTrigger: { trigger: '#about-cia', start: 'top 78%', once: true },
    });

    gsap.utils.toArray('.result__list li').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        x: -10,
        duration: 0.35,
        delay: i * 0.04,
        scrollTrigger: { trigger: '#result', start: 'top 75%', once: true },
      });
    });

    gsap.utils.toArray('.principle').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay: i * 0.1,
        scrollTrigger: { trigger: '#approach', start: 'top 75%', once: true },
      });
    });

    gsap.utils.toArray('.why__reason').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        x: -12,
        duration: 0.5,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  }

  function boot() {
    initProcessPulse();
    initSectionMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();