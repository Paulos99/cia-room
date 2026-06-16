(function () {
  'use strict';

  document.querySelectorAll('.media-slot').forEach((slot) => {
    const img = slot.querySelector('.media-slot__img');
    if (!img) return;

    function setPlaceholder() {
      slot.classList.add('is-placeholder');
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
