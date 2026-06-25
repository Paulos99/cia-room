(function () {
  'use strict';

  const PLACEHOLDER_RE = /^\[[^\]]+\]$/;

  function isPlaceholder(value) {
    return !value || PLACEHOLDER_RE.test(String(value).trim());
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function getHeaderOffset() {
    const header = document.getElementById('header');
    if (!header) return 80;
    return Math.ceil(header.getBoundingClientRect().height) + 12;
  }

  function getScrollAnchor(section) {
    return (
      section.querySelector(
        '.section-label, .section-title, .hero__label, h1, h2'
      ) || section
    );
  }

  function getScrollTopForElement(el) {
    return el.getBoundingClientRect().top + getScrollY();
  }

  function normalizeTelegram(value) {
    const v = String(value).trim();
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('@')) return 'https://t.me/' + v.slice(1);
    if (v.startsWith('t.me/')) return 'https://' + v;
    return 'https://t.me/' + v.replace(/^@/, '');
  }

  function applyContact(el, type, value) {
    if (!el || isPlaceholder(value)) {
      if (type === 'geography' || type === 'legalEntity' || type === 'legalDetails') {
        el.textContent = isPlaceholder(value) ? '' : value;
        el.hidden = !el.textContent;
      } else {
        el.hidden = true;
      }
      return;
    }

    if (type === 'phone') {
      const digits = value.replace(/[^\d+]/g, '');
      el.href = 'tel:' + digits;
      el.textContent = value;
      el.hidden = false;
    } else if (type === 'email') {
      el.href = 'mailto:' + value;
      el.textContent = value;
      el.hidden = false;
    } else if (type === 'telegram') {
      el.href = normalizeTelegram(value);
      el.textContent = value;
      el.hidden = false;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.textContent = value;
      el.hidden = !value;
    }
  }

  function injectContacts() {
    if (typeof CIA_CONFIG === 'undefined') return;

    document.querySelectorAll('[data-contact]').forEach((el) => {
      const key = el.getAttribute('data-contact');
      applyContact(el, key, CIA_CONFIG[key]);
    });

    const ld = document.querySelector('script[type="application/ld+json"]');
    if (ld && CIA_CONFIG.domain && !isPlaceholder(CIA_CONFIG.geography)) {
      try {
        const data = JSON.parse(ld.textContent);
        data.url = CIA_CONFIG.domain.replace(/\/$/, '') + '/';
        data.areaServed = CIA_CONFIG.geography;
        ld.textContent = JSON.stringify(data, null, 2);
      } catch (_) { /* ignore */ }
    }
  }

  function getScrollY() {
    return window.CIA_SMOOTH_SCROLL?.lenis?.scroll ?? window.scrollY;
  }

  function bindScroll(handler) {
    if (window.CIA_ON_SCROLL) {
      window.CIA_ON_SCROLL(handler);
      return;
    }
    window.addEventListener('scroll', handler, { passive: true });
  }

  function scrollToElement(el, options = {}) {
    if (!el) return;
    const anchor = options.anchor ? el : getScrollAnchor(el);
    const top = Math.max(0, getScrollTopForElement(anchor) - getHeaderOffset());
    const lenis = window.CIA_SMOOTH_SCROLL?.lenis;
    const duration = options.duration ?? (isMobileViewport() ? 0.65 : 1.15);

    const onComplete = options.onComplete;

    if (lenis) {
      lenis.scrollTo(top, { duration, onComplete });
    } else {
      window.scrollTo({ top, behavior: options.immediate ? 'auto' : 'smooth' });
      if (onComplete) setTimeout(onComplete, duration * 1000);
    }
  }

  window.CIA_SCROLL_TO_ELEMENT = scrollToElement;
  window.CIA_GET_HEADER_OFFSET = getHeaderOffset;

  function initHeaderScroll() {
    const header = document.getElementById('header');
    const progressFill = document.getElementById('header-progress-fill');
    if (!header) return;

    let headerScrolled = false;

    const onScroll = () => {
      const scrollY = getScrollY();
      if (!headerScrolled && scrollY > 20) {
        headerScrolled = true;
        header.classList.add('is-scrolled');
      } else if (headerScrolled && scrollY < 6) {
        headerScrolled = false;
        header.classList.remove('is-scrolled');
      }

      if (progressFill) {
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
        progressFill.style.width = `${progress * 100}%`;
      }
    };
    onScroll();
    bindScroll(onScroll);
  }

  function scrollToHash(hash, replace) {
    if (!hash || hash === '#') return;
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;

    const onScrollDone = () => {
      const heading = target.querySelector('h1, h2, .section-title, .section-label');
      const focusEl = heading || target;
      if (!focusEl.hasAttribute('tabindex')) {
        focusEl.setAttribute('tabindex', '-1');
      }
      focusEl.focus({ preventScroll: true });
    };

    scrollToElement(target, { onComplete: onScrollDone });

    if (replace) {
      history.replaceState(null, '', '#' + id);
    }
  }

  function initAnchorNav() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToHash(href, true);
      });
    });

    if (window.location.hash) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToHash(window.location.hash, false));
      });
    }
  }

  function initNavSpy() {
    const links = new Map();
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const id = link.getAttribute('data-nav');
      if (!id) return;
      if (!links.has(id)) links.set(id, []);
      links.get(id).push(link);
    });
    if (!links.size) return;

    const setActive = (id) => {
      links.forEach((linkList, key) => {
        const active = key === id;
        linkList.forEach((link) => {
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });

      const railLink = document.querySelector(`.section-rail__link[data-nav="${id}"]`);
      const railScroll = document.getElementById('section-rail-scroll');
      if (railLink && railScroll && isMobileViewport()) {
        const linkLeft = railLink.offsetLeft;
        const linkWidth = railLink.offsetWidth;
        const scrollLeft = linkLeft - railScroll.offsetWidth / 2 + linkWidth / 2;
        railScroll.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function boot() {
    document.documentElement.classList.add('js');
    document.body.classList.add('has-ambient');
    injectContacts();
    initHeaderScroll();
    initAnchorNav();
    initNavSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
