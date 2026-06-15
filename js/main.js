(function () {
  'use strict';

  const NAV_SECTIONS = ['about-cia', 'why', 'services', 'process', 'objects', 'faq', 'lead'];
  const PLACEHOLDER_RE = /^\[[^\]]+\]$/;

  function isPlaceholder(value) {
    return !value || PLACEHOLDER_RE.test(String(value).trim());
  }

  function getHeaderOffset() {
    const header = document.getElementById('header');
    return header ? header.getBoundingClientRect().height : 72;
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

  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const nav = document.getElementById('mobile-nav');
    if (!burger || !nav) return;

    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  function scrollToHash(hash, replace) {
    if (!hash || hash === '#') return;
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 1;
    window.scrollTo({ top, behavior: 'smooth' });
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
      requestAnimationFrame(() => scrollToHash(window.location.hash, false));
    }
  }

  function initNavSpy() {
    const links = new Map();
    document.querySelectorAll('.header__nav-link[data-nav]').forEach((link) => {
      links.set(link.getAttribute('data-nav'), link);
    });
    if (!links.size) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link, key) => {
            link.classList.toggle('is-active', key === id);
          });
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    NAV_SECTIONS.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function initMobileCta() {
    const bar = document.getElementById('mobile-cta');
    const hero = document.getElementById('hero');
    const lead = document.getElementById('lead');
    if (!bar || !hero) return;

    const update = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const leadVisible = lead && lead.getBoundingClientRect().top < window.innerHeight * 0.85;
      const show = heroBottom < 0 && !leadVisible;
      bar.classList.toggle('is-visible', show);
      bar.classList.toggle('is-hidden', leadVisible);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function boot() {
    injectContacts();
    initHeaderScroll();
    initMobileMenu();
    initAnchorNav();
    initNavSpy();
    initMobileCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();