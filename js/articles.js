(function () {
  'use strict';
  function revealArticle() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const entry = document.getElementById(id);
    if (!entry || !entry.matches('details.article-entry')) return;
    entry.open = true;
    requestAnimationFrame(function () { entry.scrollIntoView({ block: 'start' }); });
  }
  window.addEventListener('hashchange', revealArticle);
  revealArticle();
})();
