(function () {
  'use strict';

  document.documentElement.classList.add('js');

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function canAnimate() {
    return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion();
  }

  function isDesktopParallax() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function revealStart() {
    return isMobileViewport() ? 'top 94%' : 'top 82%';
  }

  function revealFrom(trigger, elements, options) {
    const els = gsap.utils.toArray(elements);
    if (!els.length) return;
    gsap.from(els, {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger, start: revealStart(), once: true },
      ...options,
    });
  }

  function initHeroMotion() {
    const content = document.querySelectorAll(
      '.hero__content > *, .hero__method-item, .hero__foot > *'
    );
    const visual = document.getElementById('hero-visual');
    if (!content.length) return;

    gsap.set(content, { opacity: 0, y: 32 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(content, { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 });

    if (visual) {
      visual.style.opacity = '1';
      gsap.set(visual, { opacity: 0, x: 48, scale: 0.94 });
      tl.to(visual, { opacity: 1, x: 0, scale: 1, duration: 1.1, clearProps: 'opacity' }, '-=0.55');

      if (isDesktopParallax()) {
        gsap.to(visual, {
          y: 40,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }
    }
  }

  function initSectionReveals() {
    const sectionIds = ['about-cia', 'why', 'system', 'objects', 'services', 'diagnose', 'process', 'result', 'approach', 'faq', 'lead'];

    sectionIds.forEach((id) => {
      if (id === 'about-cia') return;
      const section = document.getElementById(id);
      if (!section) return;

      const headers = section.querySelectorAll('.section-label, .section-title, .section-intro');
      if (headers.length) {
        revealFrom(section, headers, { stagger: 0.1, duration: 0.75 });
      }
    });

    revealFrom('#about-cia', '.cia-identity__content > *', { stagger: 0.08, duration: 0.65, y: 20 });

    gsap.from('#about-cia .media-slot', {
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#about-cia', start: 'top 72%', once: true },
    });

    gsap.from('.why__content', {
      opacity: 0,
      x: -24,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.why__grid', start: 'top 80%', once: true },
    });

    gsap.from('.why__diagram-panel', {
      opacity: 0,
      x: 24,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.why__grid', start: 'top 80%', once: true },
    });

    gsap.from('.system__content', {
      opacity: 0,
      x: -24,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.system__grid', start: 'top 80%', once: true },
    });

    gsap.from('.system__panel', {
      opacity: 0,
      x: 24,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.system__grid', start: 'top 80%', once: true },
    });

    gsap.from('.diagnose__shell', {
      opacity: 0,
      y: 28,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#diagnose', start: 'top 78%', once: true },
    });

    gsap.from('.process__media', {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.process__media', start: 'top 85%', once: true },
    });

    gsap.from('.process__step-marker', {
      scale: 0,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: '#process-track', start: 'top 78%', once: true },
    });

    gsap.utils.toArray('.result__list li').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        x: -12,
        duration: 0.4,
        delay: i * 0.04,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#result', start: 'top 75%', once: true },
      });
    });

    const principles = gsap.utils.toArray('.principle');
    if (principles.length && isMobileViewport()) {
      gsap.set(principles, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
    } else {
      principles.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          scale: 0.97,
          duration: 0.65,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#approach', start: 'top 75%', once: true },
        });
      });
    }

    gsap.from('.principles__note', {
      opacity: 0,
      y: 16,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.principles__note', start: 'top 88%', once: true },
    });
  }

  function initServicesMotion() {
    const section = document.getElementById('services');
    if (!section) return;

    gsap.from('.services__compare-wrap', {
      opacity: 0,
      y: 20,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.services__compare-wrap', start: 'top 88%', once: true },
    });

    gsap.from('.services__tabs', {
      opacity: 0,
      y: 20,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.services__tabs', start: 'top 88%', once: true },
    });

    const revealPanel = (panel) => {
      const targets = [
        panel.querySelector('.service-panel__media'),
        panel.querySelector('.service-panel__body'),
      ].filter(Boolean);
      if (!targets.length) return;
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'opacity,transform' });
    };

    document.querySelectorAll('.service-panel').forEach((panel) => {
      const targets = [
        panel.querySelector('.service-panel__media'),
        panel.querySelector('.service-panel__body'),
      ].filter(Boolean);

      if (isMobileViewport()) {
        gsap.set(targets, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
        return;
      }

      gsap.from(targets, {
        opacity: 0,
        y: 36,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: panel, start: 'top 84%', once: true },
      });
    });

    window.CIA_REVEAL_SERVICE_PANEL = revealPanel;
  }

  function initScrubEffects() {
    if (!isDesktopParallax() || typeof gsap === 'undefined') return;
  }

  function initMediaParallax() {
    if (!isDesktopParallax()) return;

    gsap.utils.toArray('.media-slot__img').forEach((img) => {
      const slot = img.closest('.media-slot');
      if (!slot) return;

      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: slot,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });
  }

  function initObjectsFaqLead() {
    const cards = gsap.utils.toArray('.object-card');
    if (cards.length && isMobileViewport()) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
    } else if (cards.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 36,
        scale: 0.95,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#objects-grid', start: 'top 82%', once: true },
      });
    }

    gsap.from('.accordion__item', {
      opacity: 0,
      y: 28,
      duration: 0.65,
      stagger: 0.07,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#faq-accordion', start: 'top 85%', once: true },
    });

    const leadGrid = document.querySelector('.lead__grid');
    if (leadGrid) {
      gsap.from(leadGrid.children, {
        opacity: 0,
        y: 36,
        duration: 0.85,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#lead', start: 'top 78%', once: true },
      });
    }
  }

  function initResultReveal() {
    const slot = document.querySelector('#report-visual .media-slot');
    if (slot) {
      gsap.from(slot, {
        clipPath: 'inset(0 100% 0 0)',
        opacity: 0.5,
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '#result', start: 'top 68%', once: true },
      });
    }

    const label = document.querySelector('.result__visual-label');
    if (label) {
      gsap.from(label, {
        opacity: 0,
        y: 8,
        duration: 0.5,
        delay: 0.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#result', start: 'top 68%', once: true },
      });
    }

    gsap.from('.result__accent', {
      opacity: 0,
      x: -20,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.result__accent', start: 'top 88%', once: true },
    });
  }

  function initProcessPulse() {
    const track = document.getElementById('process-track');
    const stepsContainer = document.getElementById('process-steps');
    const pulse = document.getElementById('process-pulse');
    const lineFill = document.getElementById('process-line-fill');
    const steps = stepsContainer ? stepsContainer.querySelectorAll('.process__step') : [];
    if (!track || !pulse || !steps.length) return;

    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

    const markerPositions = () => {
      const trackRect = track.getBoundingClientRect();
      return Array.from(steps).map((step) => {
        const marker = step.querySelector('.process__step-marker');
        const rect = (marker || step).getBoundingClientRect();
        return rect.left + rect.width / 2 - trackRect.left;
      });
    };

    const interpolate = (positions, progress) => {
      const p = Math.max(0, Math.min(1, progress));
      if (positions.length < 2) return positions[0] || 0;
      const span = positions.length - 1;
      const exact = p * span;
      const index = Math.min(span - 1, Math.floor(exact));
      const frac = exact - index;
      return positions[index] + (positions[index + 1] - positions[index]) * frac;
    };

    const applyPulse = (progress) => {
      const positions = markerPositions();
      const pos = interpolate(positions, progress);
      pulse.style.left = pos - 4 + 'px';
      pulse.style.top = '20px';
      if (lineFill) lineFill.style.width = Math.max(0, pos) + 'px';
    };

    const setStepStates = (progress) => {
      const p = Math.max(0, Math.min(1, progress));
      const span = Math.max(1, steps.length - 1);
      let currentIndex = 0;

      for (let i = steps.length - 1; i >= 0; i -= 1) {
        if (p >= i / span) {
          currentIndex = i;
          break;
        }
      }

      steps.forEach((step, index) => {
        step.classList.toggle('is-reached', index <= currentIndex);
        step.classList.toggle('is-current', index === currentIndex);
      });
    };

    const updateProgress = (progress) => {
      applyPulse(progress);
      setStepStates(progress);
    };

    const resetProgress = () => {
      steps.forEach((step) => step.classList.remove('is-reached', 'is-current'));
      if (lineFill) {
        lineFill.style.width = '0';
        lineFill.style.height = '0';
      }
      const positions = markerPositions();
      const start = positions[0] || 0;
      pulse.style.left = start - 4 + 'px';
      pulse.style.top = '20px';
    };

    if (isMobileViewport()) {
      steps.forEach((step) => step.classList.add('is-reached'));
      return;
    }

    if (typeof ScrollTrigger === 'undefined') return;

    const processEnd = isDesktop() ? 'top 38%' : 'top 22%';

    const processTrigger = ScrollTrigger.create({
      trigger: track,
      start: 'top 92%',
      end: processEnd,
      scrub: 0.25,
      onUpdate: (self) => updateProgress(self.progress),
      onEnter: (self) => updateProgress(self.progress),
      onLeave: () => updateProgress(1),
      onEnterBack: (self) => updateProgress(self.progress),
      onLeaveBack: () => resetProgress(),
    });

    updateProgress(processTrigger.progress);

    ScrollTrigger.addEventListener('refresh', () => {
      updateProgress(processTrigger.progress);
    });

    window.addEventListener('resize', () => {
      updateProgress(processTrigger.progress);
    });
  }

  function initStuckRevealFallback() {
    if (!isMobileViewport()) return;

    const revealSelectors = [
      '.section-label',
      '.section-title',
      '.why__content',
      '.why__diagram-panel',
      '.system__content',
      '.system__panel',
      '.diagnose__shell',
      '.service-panel__media',
      '.service-panel__body',
      '.object-card',
      '.accordion__item',
      '.process__step-marker',
      '.principle',
    ];

    let timer = 0;
    const unlockVisible = () => {
      revealSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          const style = window.getComputedStyle(el);
          const hidden = style.opacity === '0' || Number(style.opacity) < 0.05;
          const shifted = style.transform && style.transform !== 'none' && !style.transform.startsWith('matrix(1, 0, 0, 1, 0, 0)');
          if (!hidden && !shifted) return;

          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
            gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: 'opacity,transform,scale,clipPath' });
          }
        });
      });
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(unlockVisible, 120);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('load', () => {
      schedule();
      setTimeout(unlockVisible, 800);
    });
    schedule();
  }

  function initScrollRefresh() {
    let resizeTimer;
    let loadTimer;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const shouldRefreshOnResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const widthDelta = Math.abs(width - lastWidth);
      const heightDelta = Math.abs(height - lastHeight);

      if (widthDelta < 1 && heightDelta < 1) return false;

      // Игнорируем смену высоты от скрытия/показа панели браузера на телефонах.
      if (isMobileViewport() && widthDelta < 1 && heightDelta < 96) return false;

      lastWidth = width;
      lastHeight = height;
      return true;
    };

    const refresh = () => {
      if (typeof ScrollTrigger === 'undefined') return;
      const lenis = window.CIA_SMOOTH_SCROLL?.lenis;
      const scroll = lenis?.scroll;
      ScrollTrigger.refresh();
      if (lenis && typeof scroll === 'number') {
        lenis.scrollTo(scroll, { immediate: true });
      }
    };

    window.addEventListener('load', () => {
      clearTimeout(loadTimer);
      loadTimer = setTimeout(refresh, 400);
    });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!shouldRefreshOnResize()) return;
        refresh();
      }, 250);
    });
  }

  function boot() {
    initProcessPulse();

    if (!canAnimate()) {
      document.querySelectorAll('.hero__content > *').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      const visual = document.getElementById('hero-visual');
      if (visual) {
        visual.style.opacity = '1';
        visual.style.transform = 'none';
      }
      if (!isMobileViewport()) {
        document.querySelectorAll('.process__step').forEach((step) => {
          step.classList.add('is-reached');
        });
        const lineFill = document.getElementById('process-line-fill');
        if (lineFill) lineFill.style.width = '100%';
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    });

    initHeroMotion();
    initSectionReveals();
    initServicesMotion();
    initScrubEffects();
    initMediaParallax();
    initObjectsFaqLead();
    initResultReveal();
    initStuckRevealFallback();
    initScrollRefresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
