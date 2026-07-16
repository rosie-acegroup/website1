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

  /* Demo form guard (replace with a real form plugin in WordPress) */
  var form = document.getElementById('tour-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) note.hidden = false;
      form.reset();
    });
  }
})();
