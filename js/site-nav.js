(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = header.querySelector('.site-menu-toggle');
  const menu = header.querySelector('.site-menu');
  const close = () => {
    header.classList.remove('site-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
    menu.open = false;
  };
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('site-menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (menu.open || header.classList.contains('site-menu-open'))) { close(); toggle.focus(); }
  });
  header.querySelectorAll('nav a').forEach(a => {
    const url = new URL(a.href);
    if (url.pathname === location.pathname && !url.hash) { a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); }
    if (url.pathname === location.pathname && url.hash === location.hash && url.hash) a.classList.add('is-active');
    if (a.closest('.site-menu') && url.pathname === location.pathname) menu.querySelector('summary').classList.add('is-active');
    a.addEventListener('click', close);
  });
})();
