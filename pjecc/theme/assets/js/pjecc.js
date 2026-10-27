/* PJECC — one-page interactions */
(function () {
  'use strict';

  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav__toggle');

  /* Sticky nav background on scroll */
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('nav__menu-open');
    });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav__menu-open');
      });
    });
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // Failsafe: never leave content hidden if the observer misses an element.
    window.setTimeout(function () {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Form: in the static preview (no real action) show a thank-you without
     navigating. On WordPress the form has a real action and submits normally
     (handled server-side in functions.php). */
  var form = document.getElementById('tour-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      var action = form.getAttribute('action') || '';
      var keyEl = form.querySelector('input[name="access_key"]');
      var key = keyEl ? (keyEl.value || '').trim() : '';
      var note = form.querySelector('.form-note--js');

      // With a Web3Forms access key: send for real via AJAX, stay on the page.
      if (action.indexOf('web3forms.com') !== -1 && key) {
        ev.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (r) { return r.json(); })
          .then(function (j) {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            if (j && j.success) { if (note) note.hidden = false; form.reset(); }
            else { window.alert('Sorry, something went wrong sending your request. Please email info@pjecc.org.'); }
          })
          .catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = label; }
            window.alert('Sorry, something went wrong sending your request. Please email info@pjecc.org.');
          });
        return;
      }

      // No key yet, or the static preview: show the thank-you without sending.
      ev.preventDefault();
      if (note) note.hidden = false;
      form.reset();
    });
  }
})();
