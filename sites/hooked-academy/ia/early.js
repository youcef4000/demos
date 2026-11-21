// Animations seulement si le script tourne et sans « mouvement réduit » ; filet de sécurité :
// si la page n'a pas démarré au bout de 4 s, tout s'affiche sans animation.
(function (d) {
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.className += rm ? ' js rm' : ' js';
  setTimeout(function () {
    if (!window.__haReady) d.className = d.className.replace(/\bjs\b/, 'nojs');
  }, 4000);
})(document.documentElement);
