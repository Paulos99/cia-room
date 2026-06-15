(function () {
  'use strict';

  const header = document.getElementById('header');
  const burger = document.querySelector('.header__burger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileCta = document.getElementById('mobile-cta');
  const leadSection = document.getElementById('lead');
  const navLinks = document.querySelectorAll('.header__nav-link[data-nav]');
  const sections = ['why', 'services', 'process', 'objects', 'faq', 'lead'];

  function injectContacts() {
    if (typeof CIA_CONFIG === 'undefined') return;

    const phone = CIA_CONFIG.phone;
    const email = CIA_CONFIG.email;
    const telegram = CIA_CONFIG.telegram;
    const geography = CIA_CONFIG.geography;
    const legalEntity = CIA_CONFIG.legalEntity;
    const legalDetails = CIA_CONFIG.legalDetails;

    document.querySelectorAll('[data-contact="phone"]').forEach((el) => {
      const digits = phone.replace(/[^\d+]/g, '');
      el.href = 'tel:' + digits;
      el.textContent = phone;
    });

    document.querySelectorAll('[data-contact="email"]').forEach((el) => {
      el.href = 'mailto:' + email;
      el.textContent = email;
    });

    document.querySelectorAll('[data-contact="telegram"]').forEach((el) => {
      const handle = telegram.replace(/^@/, '');
      el.href = 'https://t.me/' + handle;
      el.textContent = telegram;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('[data-contact="geography"]').forEach((el) => {
      el.textContent = geography;
    });

    document.querySelectorAll('[data-contact="legalEntity"]').forEach((el) => {
      el.textContent = legalEntity;
    });

    document.querySelectorAll('[data-contact="legalDetails"]').forEach((el) => {
      if (legalDetails && !legalDetails.startsWith('[')) {
        el.textContent = legalDetails;
      }
    });
  }

  function getHeaderOffset() {
    return header ? header.offsetHeight + 8 : 0;
  }

  function scrollToAnchor(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      scrollToAnchor(hash);
      closeMobileNav();
      history.pushState(null, '', hash);
    });
  });

  function onScroll() {
    const y = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
    }

    if (mobileCta && leadSection) {
      const heroBottom = document.getElementById('hero')?.offsetHeight || 600;
      const leadTop = leadSection.getBoundingClientRect().top + window.scrollY;
      const leadBottom = leadTop + leadSection.offsetHeight;
      const inLead = y + window.innerHeight > leadTop && y < leadBottom;
      const pastHero = y > heroBottom * 0.5;
      mobileCta.classList.toggle('is-visible', pastHero && !inLead);
    }

    const offset = getHeaderOffset() + 80;
    let current = sections[0];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.nav === current);
    });
  }

  function openMobileNav() {
    if (!mobileNav || !burger) return;
    mobileNav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
  }

  function closeMobileNav() {
    if (!mobileNav || !burger) return;
    mobileNav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }

  if (burger) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      open ? closeMobileNav() : openMobileNav();
    });
  }

  document.querySelectorAll('.mobile-nav__link').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (window.location.hash) {
    setTimeout(() => scrollToAnchor(window.location.hash), 100);
  }

  injectContacts();
  onScroll();
})();
