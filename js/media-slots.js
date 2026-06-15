(function () {
  'use strict';

  document.querySelectorAll('.media-slot').forEach((slot) => {
    const img = slot.querySelector('.media-slot__img');
    if (!img) return;

    function setPlaceholder() {
      slot.classList.add('is-placeholder');
      const file = slot.dataset.image || img.getAttribute('src') || '';
      const name = file.split('/').pop();
      if (name && slot.querySelector('.media-slot__file')) {
        slot.querySelector('.media-slot__file').textContent = name;
      }
    }

    if (!img.complete) {
      img.addEventListener('error', setPlaceholder);
      img.addEventListener('load', () => slot.classList.remove('is-placeholder'));
    } else if (img.naturalWidth === 0) {
      setPlaceholder();
    } else {
      slot.classList.remove('is-placeholder');
    }

    img.addEventListener('error', setPlaceholder);
  });
})();
