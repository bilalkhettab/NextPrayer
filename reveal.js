/* Cascade: page content eases in as it scrolls into view. Elements opt in with
   data-reveal; those arriving together follow one another in page order, so a
   row of cards or a heading and its text come in as a cascade. Independent of
   app.js on purpose: the page must still show if anything else fails. */
(() => {
  'use strict';

  const root = document.documentElement;
  window.revealReady = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    root.classList.remove('js-reveal');
    return;
  }

  const STAGGER = 80;    // ms between items that arrive together
  const MAX_DELAY = 480; // so a long batch never keeps the last item waiting

  const inPageOrder = (a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  const observer = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .sort(inPageOrder)
      .forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i * STAGGER, MAX_DELAY)}ms`);
        el.classList.add('is-in');
        observer.unobserve(el);
      });
  }, {
    // A fixed inset rather than a percentage, so the last lines of the footer
    // still count as in view when the page is scrolled right to the bottom.
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12,
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
})();
