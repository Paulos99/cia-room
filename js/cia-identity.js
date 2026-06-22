(function () {
  'use strict';

  const ambient = document.getElementById('cia-ambient');
  if (!ambient || typeof gsap === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  gsap.to(ambient, {
    backgroundPosition: '100% 50%',
    duration: 12,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
})();
