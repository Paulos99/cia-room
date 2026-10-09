(function () {
  'use strict';
  const grid = document.getElementById('objects-grid');
  if (!grid) return;
  let trigger = null;
  function open(card) {
    const dialog = document.getElementById(card.getAttribute('aria-controls'));
    if (!dialog) return;
    trigger = card;
    if (window.CIA_SMOOTH_SCROLL) window.CIA_SMOOTH_SCROLL.lenis.stop();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('object-modal-open');
  }
  grid.addEventListener('click', function (event) {
    const card = event.target.closest('.object-card');
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    open(card);
  }, true);
  grid.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.object-card');
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    open(card);
  }, true);
  document.querySelectorAll('.object-modal').forEach(function (dialog) {
    dialog.querySelector('.object-modal__close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) dialog.close();
    }, true);
    dialog.addEventListener('close', function () {
      document.body.classList.remove('object-modal-open');
      if (window.CIA_SMOOTH_SCROLL) window.CIA_SMOOTH_SCROLL.lenis.start();
      if (trigger) trigger.focus({ preventScroll: true });
      trigger = null;
    });
  });
})();
