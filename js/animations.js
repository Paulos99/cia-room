(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const pulse = document.getElementById('process-pulse');
  const track = document.getElementById('process-track');

  if (pulse && track) {
    const isDesktop = window.innerWidth >= 768;
    const steps = track.querySelectorAll('.process__step');

    if (isDesktop && steps.length) {
      const first = steps[0].querySelector('.process__step-marker');
      const last = steps[steps.length - 1].querySelector('.process__step-marker');
      if (first && last) {
        const trackRect = track.getBoundingClientRect();
        const startX = first.getBoundingClientRect().left - trackRect.left + 24;
        const endX = last.getBoundingClientRect().left - trackRect.left + 24;
        gsap.set(pulse, { left: startX });
        gsap.to(pulse, {
          left: endX,
          duration: 8,
          repeat: -1,
          ease: 'none',
        });
      }
    } else if (steps.length) {
      const first = steps[0].querySelector('.process__step-marker');
      const last = steps[steps.length - 1].querySelector('.process__step-marker');
      if (first && last) {
        const trackRect = track.getBoundingClientRect();
        const startY = first.getBoundingClientRect().top - trackRect.top + 24;
        const endY = last.getBoundingClientRect().top - trackRect.top + 24;
        gsap.set(pulse, { top: startY });
        gsap.to(pulse, {
          top: endY,
          duration: 10,
          repeat: -1,
          ease: 'none',
        });
      }
    }
  }

  gsap.utils.toArray('.principle').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: '#approach',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  });
})();
