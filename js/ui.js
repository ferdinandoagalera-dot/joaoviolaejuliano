(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-links');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', function () {
    setNav(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setNav(false);
  });

  var expandBtn = document.getElementById('expand-btn');
  var gallery = document.getElementById('gallery');
  expandBtn.addEventListener('click', function () {
    var open = gallery.classList.toggle('is-expanded');
    expandBtn.setAttribute('aria-expanded', String(open));
    expandBtn.textContent = open ? 'Recolher' : 'Expand';
  });

  var dialog = document.getElementById('photo-dialog');
  var dialogImg = dialog.querySelector('img');
  // Every photo in a frame or the gallery opens the modal with its own image.
  document.querySelectorAll('.frame img, .gallery img').forEach(function (img) {
    img.addEventListener('click', function () {
      dialogImg.src = img.src;
      dialogImg.alt = img.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('.lightbox-close').addEventListener('click', function () {
    dialog.close();
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
})();
