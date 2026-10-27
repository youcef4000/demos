// Avant le premier rendu : drapeaux d'animation, langue et sens d'écriture (pas de saut de mise en page en arabe).
(function (h) {
  h.classList.add('js');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) h.classList.add('motion');
  var lang = null;
  try {
    lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('ap:lang');
  } catch (e) {}
  if (!lang) {
    var nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    lang = ['fr', 'en', 'ar', 'es'].indexOf(nav) >= 0 ? nav : 'fr';
  }
  h.lang = lang;
  if (lang === 'ar') {
    h.dir = 'rtl';
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400..700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }
  // Filet de sécurité : si les scripts ne se chargent pas, tout reste visible.
  setTimeout(function () {
    if (!h.classList.contains('booted')) h.classList.remove('motion');
  }, 8000);
})(document.documentElement);
